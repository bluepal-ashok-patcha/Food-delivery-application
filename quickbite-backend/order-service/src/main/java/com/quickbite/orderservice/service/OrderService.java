package com.quickbite.orderservice.service;

import com.quickbite.orderservice.dto.*;
import com.quickbite.orderservice.entity.Cart;
import com.quickbite.orderservice.entity.CartItem;
import com.quickbite.orderservice.entity.Order;
import com.quickbite.orderservice.entity.OrderItem;
import com.quickbite.orderservice.entity.OrderStatus;
import com.quickbite.orderservice.entity.PaymentStatus;
import com.quickbite.orderservice.repository.CartRepository;
import com.quickbite.orderservice.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional
    public OrderResponseDto placeOrder(OrderRequestDto orderRequestDto) {
        // 1. Fetch address details using JdbcTemplate
        String deliveryAddress = fetchAddress(orderRequestDto.getAddressId());

        // 2. Fetch menu item details and calculate total price
        List<OrderItem> orderItems = orderRequestDto.getItems().stream()
                .map(this::createOrderItem)
                .collect(Collectors.toList());

        double totalAmount = orderItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        // 3. Resolve delivery coordinates: prefer request payload, else fetch user's current location
        Double deliveryLat = orderRequestDto.getDeliveryLatitude();
        Double deliveryLng = orderRequestDto.getDeliveryLongitude();
        if (deliveryLat == null || deliveryLng == null) {
            double[] coords = fetchUserCurrentLocation(orderRequestDto.getUserId());
            deliveryLat = coords[0];
            deliveryLng = coords[1];
        }

        // 4. Create and save the order
        Order order = Order.builder()
                .userId(orderRequestDto.getUserId())
                .restaurantId(orderRequestDto.getRestaurantId())
                .items(orderItems)
                .totalAmount(totalAmount)
                .deliveryAddress(deliveryAddress)
                .deliveryLatitude(deliveryLat)
                .deliveryLongitude(deliveryLng)
                .specialInstructions(orderRequestDto.getSpecialInstructions())
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING) // Assuming payment is handled next
                .build();

        Order savedOrder = orderRepository.save(order);
        log.info("New order #{} placed for user {}", savedOrder.getId(), savedOrder.getUserId());
        return convertToDto(savedOrder);
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        log.info("Order #{} status updated to {}", updatedOrder.getId(), newStatus);
        return convertToDto(updatedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<Order> getOrdersByUserIdPage(Long userId, int page, int size, String sortBy, String sortDir, String status) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Order> pageData;
        if (status != null && !status.isBlank()) {
            pageData = orderRepository.findByUserIdAndOrderStatus(userId, OrderStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            pageData = orderRepository.findByUserId(userId, pageable);
        }
        return pageData;
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByRestaurantId(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<Order> getOrdersByRestaurantIdPage(Long restaurantId, int page, int size, String sortBy, String sortDir, String status) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Order> pageData;
        if (status != null && !status.isBlank()) {
            pageData = orderRepository.findByRestaurantIdAndOrderStatus(restaurantId, OrderStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            pageData = orderRepository.findByRestaurantId(restaurantId, pageable);
        }
        return pageData;
    }

    @Transactional(readOnly = true)
    public Page<Order> getAllOrdersPage(int page, int size, String sortBy, String sortDir, String status, Long restaurantId, Long userId) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        if (restaurantId != null) {
            if (status != null && !status.isBlank()) {
                return orderRepository.findByRestaurantIdAndOrderStatus(restaurantId, OrderStatus.valueOf(status.toUpperCase()), pageable);
            }
            return orderRepository.findByRestaurantId(restaurantId, pageable);
        }
        if (userId != null) {
            if (status != null && !status.isBlank()) {
                return orderRepository.findByUserIdAndOrderStatus(userId, OrderStatus.valueOf(status.toUpperCase()), pageable);
            }
            return orderRepository.findByUserId(userId, pageable);
        }
        return orderRepository.findAll(pageable);
    }

    @Transactional
    public OrderResponseDto createOrderFromCart(Long userId, Long addressId, String specialInstructions) {
        // 1. Get user's cart
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            throw new RuntimeException("Cart is empty. Please add items to cart first.");
        }

        Cart cart = cartOpt.get();
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty. Please add items to cart first.");
        }

        // 2. Fetch address details
        String deliveryAddress = fetchAddress(addressId);

        // 3. Convert cart items to order items
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(this::convertCartItemToOrderItem)
                .collect(Collectors.toList());

        // 4. Resolve delivery coordinates from user's current location
        double[] coords = fetchUserCurrentLocation(userId);
        Double deliveryLat = coords[0];
        Double deliveryLng = coords[1];

        // 5. Create order with cart totals
        Order order = Order.builder()
                .userId(userId)
                .restaurantId(cart.getRestaurantId())
                .items(orderItems)
                .totalAmount(cart.getTotal()) // Use cart's calculated total
                .deliveryAddress(deliveryAddress)
                .deliveryLatitude(deliveryLat)
                .deliveryLongitude(deliveryLng)
                .specialInstructions(specialInstructions)
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        Order savedOrder = orderRepository.save(order);

        // 6. Clear the cart after successful order creation
        cartRepository.delete(cart);

        log.info("Order #{} created from cart for user {}", savedOrder.getId(), userId);
        return convertToDto(savedOrder);
    }

    // --- Helper Methods ---

    private OrderItem createOrderItem(OrderItemDto itemDto) {
        Map<String, Object> menuItemDetails = fetchMenuItemDetails(itemDto.getMenuItemId());
        return OrderItem.builder()
                .menuItemId(itemDto.getMenuItemId())
                .name((String) menuItemDetails.get("name"))
                .price((Double) menuItemDetails.get("price"))
                .quantity(itemDto.getQuantity())
                .build();
    }

    private String fetchAddress(Long addressId) {
        String sql = "SELECT street, city, state, zip_code FROM addresses WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
                rs.getString("street") + ", " +
                rs.getString("city") + ", " +
                rs.getString("state") + " " +
                rs.getString("zip_code"),
                addressId
        );
    }

    private double[] fetchUserCurrentLocation(Long userId) {
        String sql = "SELECT current_latitude, current_longitude FROM user_profiles WHERE user_id = ?";
        return jdbcTemplate.query(sql, ps -> ps.setLong(1, userId), rs -> {
            if (rs.next()) {
                Double lat = (Double) rs.getObject("current_latitude");
                Double lng = (Double) rs.getObject("current_longitude");
                // Default to 0 if null
                return new double[] { lat != null ? lat : 0.0, lng != null ? lng : 0.0 };
            }
            return new double[] { 0.0, 0.0 };
        });
    }

    private Map<String, Object> fetchMenuItemDetails(Long menuItemId) {
        String sql = "SELECT name, price FROM menu_items WHERE id = ?";
        return jdbcTemplate.queryForMap(sql, menuItemId);
    }

    private OrderResponseDto convertToDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        BeanUtils.copyProperties(order, dto);
        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream()
                    .map(this::convertOrderItemToDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private OrderItemResponseDto convertOrderItemToDto(OrderItem orderItem) {
        OrderItemResponseDto dto = new OrderItemResponseDto();
        BeanUtils.copyProperties(orderItem, dto);
        return dto;
    }

    private OrderItem convertCartItemToOrderItem(CartItem cartItem) {
        return OrderItem.builder()
                .menuItemId(cartItem.getMenuItemId())
                .name(cartItem.getMenuItemName())
                .price(cartItem.getPrice())
                .quantity(cartItem.getQuantity())
                .specialInstructions(cartItem.getSpecialInstructions())
                .build();
    }
}