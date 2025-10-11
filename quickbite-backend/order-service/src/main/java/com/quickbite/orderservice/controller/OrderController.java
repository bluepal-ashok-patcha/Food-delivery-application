package com.quickbite.orderservice.controller;

import com.quickbite.orderservice.dto.ApiResponse;
import com.quickbite.orderservice.dto.OrderRequestDto;
import com.quickbite.orderservice.dto.OrderResponseDto;
import com.quickbite.orderservice.dto.PageMeta;
import com.quickbite.orderservice.entity.Order;
import com.quickbite.orderservice.entity.OrderStatus;
import com.quickbite.orderservice.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import com.quickbite.orderservice.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDto>> placeOrder(@Valid @RequestBody OrderRequestDto orderRequestDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        orderRequestDto.setUserId(userId); // Set userId from the authenticated token
        OrderResponseDto createdOrder = orderService.placeOrder(orderRequestDto);
        ApiResponse<OrderResponseDto> body = ApiResponse.<OrderResponseDto>builder()
                .success(true)
                .message("Order created successfully")
                .data(createdOrder)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @PostMapping("/from-cart")
    public ResponseEntity<ApiResponse<OrderResponseDto>> createOrderFromCart(
            @RequestParam Long addressId,
            @RequestParam(required = false) String specialInstructions,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        OrderResponseDto createdOrder = orderService.createOrderFromCart(userId, addressId, specialInstructions);
        ApiResponse<OrderResponseDto> body = ApiResponse.<OrderResponseDto>builder()
                .success(true)
                .message("Order created from cart successfully")
                .data(createdOrder)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getOrdersByUserId(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status
    ) {
        Long userId = extractUserId(request);
        // Use paginated method with sorting to get latest orders first
        Page<Order> pageData = orderService.getOrdersByUserIdPage(userId, page, size, sortBy, sortDir, status);
        List<OrderResponseDto> orders = pageData.getContent().stream()
                .map(orderService::convertToDto)
                .collect(java.util.stream.Collectors.toList());
        ApiResponse<List<OrderResponseDto>> body = ApiResponse.<List<OrderResponseDto>>builder()
                .success(true)
                .message("Orders fetched successfully")
                .data(orders)
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/user/{orderId:\\d+}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getOrderByIdForUser(
            @PathVariable Long orderId,
            HttpServletRequest request
    ) {
        Long userId = extractUserId(request);
        OrderResponseDto order = orderService.getOrderByIdForUser(orderId, userId);
        ApiResponse<OrderResponseDto> body = ApiResponse.<OrderResponseDto>builder()
                .success(true)
                .message("Order fetched successfully")
                .data(order)
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/user/active")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getLatestActiveOrderForUser(HttpServletRequest request) {
        Long userId = extractUserId(request);
        OrderResponseDto order = orderService.getLatestActiveOrderForUser(userId);
        ApiResponse<OrderResponseDto> body = ApiResponse.<OrderResponseDto>builder()
                .success(true)
                .message(order != null ? "Active order fetched successfully" : "No active order")
                .data(order)
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/user/{orderId}/review-status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getOrderReviewStatus(
            @PathVariable Long orderId,
            HttpServletRequest request
    ) {
        Long userId = extractUserId(request);
        Map<String, Boolean> reviewStatus = orderService.getOrderReviewStatus(orderId, userId);
        ApiResponse<Map<String, Boolean>> body = ApiResponse.<Map<String, Boolean>>builder()
                .success(true)
                .message("Review status fetched successfully")
                .data(reviewStatus)
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getOrdersByRestaurantId(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status
    ) {
        org.springframework.data.domain.Page<com.quickbite.orderservice.entity.Order> pageData = orderService.getOrdersByRestaurantIdPage(restaurantId, page, size, sortBy, sortDir, status);
        List<OrderResponseDto> orders = pageData.getContent().stream()
                .map(orderService::convertToDto)
                .collect(java.util.stream.Collectors.toList());
        ApiResponse<List<OrderResponseDto>> body = ApiResponse.<List<OrderResponseDto>>builder()
                .success(true)
                .message("Orders fetched successfully")
                .data(orders)
                .page(ApiResponse.PageMeta.builder()
                        .currentPage(pageData.getNumber())
                        .size(pageData.getSize())
                        .totalElements(pageData.getTotalElements())
                        .totalPages(pageData.getTotalPages())
                        .hasNext(pageData.hasNext())
                        .hasPrevious(pageData.hasPrevious())
                        .build())
                .build();
        return ResponseEntity.ok(body);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponseDto>> updateOrderStatus(@PathVariable Long orderId, @RequestParam OrderStatus status) {
        OrderResponseDto updatedOrder = orderService.updateOrderStatus(orderId, status);
        ApiResponse<OrderResponseDto> body = ApiResponse.<OrderResponseDto>builder()
                .success(true)
                .message("Order status updated successfully")
                .data(updatedOrder)
                .build();
        return ResponseEntity.ok(body);
    }

    // --- Admin list/filter ---
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long restaurantId,
            @RequestParam(required = false) Long userId
    ) {
        org.springframework.data.domain.Page<com.quickbite.orderservice.entity.Order> pageData = orderService.getAllOrdersPage(page, size, sortBy, sortDir, status, restaurantId, userId);
        List<OrderResponseDto> orders = pageData.getContent().stream()
                .map(orderService::convertToDto)
                .collect(java.util.stream.Collectors.toList());
        ApiResponse<List<OrderResponseDto>> body = ApiResponse.<List<OrderResponseDto>>builder()
                .success(true)
                .message("Orders fetched successfully")
                .data(orders)
                .page(ApiResponse.PageMeta.builder()
                        .currentPage(pageData.getNumber())
                        .size(pageData.getSize())
                        .totalElements(pageData.getTotalElements())
                        .totalPages(pageData.getTotalPages())
                        .hasNext(pageData.hasNext())
                        .hasPrevious(pageData.hasPrevious())
                        .build())
                .build();
        return ResponseEntity.ok(body);
    }

    private Long extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                return jwtUtil.getAllClaimsFromToken(token).get("userId", Long.class);
            } catch (Exception ignored) {}
        }
        throw new RuntimeException("Unauthorized");
    }
}