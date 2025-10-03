package com.quickbite.orderservice.service;

import com.quickbite.orderservice.dto.*;
import com.quickbite.orderservice.entity.Cart;
import com.quickbite.orderservice.entity.CartItem;
import com.quickbite.orderservice.repository.CartRepository;
import com.quickbite.orderservice.repository.CrossServiceJdbcRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CrossServiceJdbcRepository crossServiceRepository;

    @Transactional
    public CartDto getCart(Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            return CartDto.builder()
                    .userId(userId)
                    .subtotal(0.0)
                    .deliveryFee(0.0)
                    .tax(0.0)
                    .total(0.0)
                    .build();
        }
        return convertToDto(cartOpt.get());
    }

    @Transactional
    public CartDto addToCart(Long userId, AddToCartRequest request) {
        Optional<Cart> existingCartOpt = cartRepository.findByUserId(userId);
        
        Cart cart;
        if (existingCartOpt.isPresent()) {
            cart = existingCartOpt.get();
            
            // If different restaurant, clear cart and start fresh
            if (!cart.getRestaurantId().equals(request.getRestaurantId())) {
                cartRepository.delete(cart);
                cart = createNewCart(userId, request.getRestaurantId());
            }
        } else {
            cart = createNewCart(userId, request.getRestaurantId());
        }

        // Add or update item
        CartItemDto itemDto = request.getItem();
        CartItem existingItem = findCartItem(cart, itemDto.getMenuItemId(), itemDto.getCustomization());
        
        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + itemDto.getQuantity());
        } else {
            CartItem newItem = convertToCartItem(itemDto);
            if (cart.getItems() == null) {
                cart.setItems(new java.util.ArrayList<>());
            }
            cart.getItems().add(newItem);
        }

        // Recalculate totals
        recalculateCartTotals(cart);
        
        Cart savedCart = cartRepository.save(cart);
        log.info("Added item to cart for user {}: {} x {}", userId, itemDto.getMenuItemName(), itemDto.getQuantity());
        
        return convertToDto(savedCart);
    }

    @Transactional
    public CartDto updateCartItem(Long userId, UpdateCartItemRequest request) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            throw new RuntimeException("Cart not found for user: " + userId);
        }

        Cart cart = cartOpt.get();
        CartItem item = findCartItem(cart, request.getMenuItemId(), request.getCustomization());
        
        if (item == null) {
            throw new RuntimeException("Cart item not found");
        }

        if (request.getQuantity() <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(request.getQuantity());
            if (request.getSpecialInstructions() != null) {
                item.setSpecialInstructions(request.getSpecialInstructions());
            }
        }

        recalculateCartTotals(cart);
        
        Cart savedCart = cartRepository.save(cart);
        log.info("Updated cart item for user {}: menu item {} quantity to {}", userId, request.getMenuItemId(), request.getQuantity());
        
        return convertToDto(savedCart);
    }

    @Transactional
    public CartDto removeFromCart(Long userId, Long menuItemId, String customization) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            throw new RuntimeException("Cart not found for user: " + userId);
        }

        Cart cart = cartOpt.get();
        CartItem item = findCartItem(cart, menuItemId, customization);
        
        if (item != null) {
            if (cart.getItems() != null) {
                cart.getItems().remove(item);
            }
            recalculateCartTotals(cart);
            cartRepository.save(cart);
            log.info("Removed item from cart for user {}: menu item {}", userId, menuItemId);
        }

        return convertToDto(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartRepository.deleteByUserId(userId);
        log.info("Cleared cart for user {}", userId);
    }

    @Transactional
    public CartDto applyCoupon(Long userId, String couponCode) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            throw new RuntimeException("Cart not found for user: " + userId);
        }

        Cart cart = cartOpt.get();
        
        // Validate coupon via JdbcTemplate
        // For FREE_DELIVERY coupons, use total order amount (subtotal + delivery + tax) for minimum validation
        Double validationAmount = cart.getSubtotal() + cart.getDeliveryFee() + cart.getTax();
        
        log.info("Applying coupon {} for user {} to cart with restaurant {} and validation amount {}", 
                couponCode, userId, cart.getRestaurantId(), validationAmount);
        Map<String, Object> couponData = crossServiceRepository.validateCoupon(
            couponCode, userId, cart.getRestaurantId(), validationAmount
        );

        if (couponData == null) {
            log.warn("Coupon validation failed for code: {} user: {} restaurant: {} subtotal: {}", 
                    couponCode, userId, cart.getRestaurantId(), cart.getSubtotal());
            throw new RuntimeException("Invalid coupon code or coupon not applicable");
        }

        log.info("Coupon validation successful: {}", couponData);
        
        // Calculate discount amount
        Double discountAmount = calculateDiscountAmount(couponData, cart.getSubtotal());
        String couponType = (String) couponData.get("type");
        
        cart.setAppliedCouponCode(couponCode);
        cart.setAppliedCouponType(couponType);
        cart.setDiscountAmount(discountAmount);
        recalculateCartTotals(cart);
        cartRepository.save(cart);
        log.info("Applied coupon {} (type: {}) to cart for user {} with discount amount {}", couponCode, couponType, userId, discountAmount);

        return convertToDto(cart);
    }

    @Transactional
    public CartDto removeCoupon(Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            throw new RuntimeException("Cart not found for user: " + userId);
        }

        Cart cart = cartOpt.get();
        cart.setAppliedCouponCode(null);
        cart.setAppliedCouponType(null);
        cart.setDiscountAmount(0.0);
        recalculateCartTotals(cart);
        
        Cart savedCart = cartRepository.save(cart);
        log.info("Removed coupon from cart for user {}", userId);
        
        return convertToDto(savedCart);
    }

    public CartPricingBreakdown getCartPricing(Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            return CartPricingBreakdown.builder()
                    .subtotal(0.0)
                    .deliveryFee(0.0)
                    .tax(0.0)
                    .discount(0.0)
                    .total(0.0)
                    .build();
        }

        Cart cart = cartOpt.get();
        return CartPricingBreakdown.builder()
                .subtotal(cart.getSubtotal())
                .deliveryFee(cart.getDeliveryFee())
                .tax(cart.getTax())
                .discount(cart.getDiscountAmount() != null ? cart.getDiscountAmount() : 0.0)
                .total(cart.getTotal())
                .appliedCouponCode(cart.getAppliedCouponCode())
                .build();
    }

    private Cart createNewCart(Long userId, Long restaurantId) {
        return Cart.builder()
                .userId(userId)
                .restaurantId(restaurantId)
                .items(new java.util.ArrayList<>())
                .subtotal(0.0)
                .deliveryFee(0.0)
                .tax(0.0)
                .total(0.0)
                .build();
    }

    private CartItem findCartItem(Cart cart, Long menuItemId, String customization) {
        if (cart.getItems() == null) {
            return null;
        }
        return cart.getItems().stream()
                .filter(item -> item.getMenuItemId().equals(menuItemId) &&
                        ((item.getCustomization() == null && customization == null) ||
                         (item.getCustomization() != null && item.getCustomization().equals(customization))))
                .findFirst()
                .orElse(null);
    }

    private void recalculateCartTotals(Cart cart) {
        // Calculate subtotal
        double subtotal = 0.0;
        if (cart.getItems() != null) {
            subtotal = cart.getItems().stream()
                    .mapToDouble(item -> item.getPrice() * item.getQuantity())
                    .sum();
        }

        // Calculate delivery fee (simplified - could be distance-based)
        double deliveryFee = subtotal > 0 ? 2.99 : 0.0;

        // Calculate tax (8% of subtotal)
        double tax = subtotal * 0.08;

        // Apply discount
        double discount = cart.getDiscountAmount() != null ? cart.getDiscountAmount() : 0.0;

        // Handle FREE_DELIVERY coupon - waive delivery fee
        if (cart.getAppliedCouponCode() != null && "FREE_DELIVERY".equals(cart.getAppliedCouponType())) {
            deliveryFee = 0.0; // Waive delivery fee for free delivery coupons
        }

        // Calculate total
        double total = subtotal + deliveryFee + tax - discount;

        cart.setSubtotal(round(subtotal, 2));
        cart.setDeliveryFee(round(deliveryFee, 2));
        cart.setTax(round(tax, 2));
        cart.setTotal(round(total, 2));
    }

    private double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }


    private Double calculateDiscountAmount(Map<String, Object> couponData, Double orderAmount) {
        String type = (String) couponData.get("type");
        Double discountValue = ((Number) couponData.get("discount_value")).doubleValue();
        Double maxDiscount = couponData.get("maximum_discount_amount") != null ? 
            ((Number) couponData.get("maximum_discount_amount")).doubleValue() : null;

        Double discountAmount;
        if ("PERCENTAGE".equals(type)) {
            discountAmount = (orderAmount * discountValue) / 100.0;
            if (maxDiscount != null && discountAmount > maxDiscount) {
                discountAmount = maxDiscount;
            }
        } else if ("FREE_DELIVERY".equals(type)) {
            // For free delivery, the discount is the delivery fee amount
            // This will be handled in recalculateCartTotals method
            discountAmount = discountValue; // This represents the delivery fee to be waived
        } else {
            // FIXED_AMOUNT or other types
            discountAmount = discountValue;
        }

        // Ensure discount doesn't exceed order amount
        return Math.min(discountAmount, orderAmount);
    }

    private CartItem convertToCartItem(CartItemDto dto) {
        // Fetch menu item details from database
        Map<String, Object> menuItemDetails = crossServiceRepository.getMenuItemDetails(dto.getMenuItemId());
        if (menuItemDetails == null) {
            throw new RuntimeException("Menu item not found with ID: " + dto.getMenuItemId());
        }

        CartItem item = new CartItem();
        item.setMenuItemId(dto.getMenuItemId());
        item.setMenuItemName((String) menuItemDetails.get("name"));
        item.setPrice((Double) menuItemDetails.get("price"));
        item.setQuantity(dto.getQuantity());
        item.setCustomization(dto.getCustomization());
        item.setSpecialInstructions(dto.getSpecialInstructions());
        return item;
    }

    private CartDto convertToDto(Cart cart) {
        CartDto dto = new CartDto();
        BeanUtils.copyProperties(cart, dto);
        
        if (cart.getItems() != null) {
            List<CartItemDto> itemDtos = cart.getItems().stream()
                    .map(this::convertToCartItemDto)
                    .toList();
            dto.setItems(itemDtos);
        }
        
        return dto;
    }

    private CartItemDto convertToCartItemDto(CartItem item) {
        CartItemDto dto = new CartItemDto();
        BeanUtils.copyProperties(item, dto);
        return dto;
    }
}
