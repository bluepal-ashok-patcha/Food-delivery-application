package com.quickbite.orderservice.controller;

import com.quickbite.orderservice.dto.ApiResponse;
import com.quickbite.orderservice.dto.OrderRequestDto;
import com.quickbite.orderservice.dto.OrderResponseDto;
import com.quickbite.orderservice.dto.PageMeta;
import com.quickbite.orderservice.entity.OrderStatus;
import com.quickbite.orderservice.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDto>> placeOrder(@Valid @RequestBody OrderRequestDto orderRequestDto, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        orderRequestDto.setUserId(userId); // Set userId from the authenticated token
        OrderResponseDto createdOrder = orderService.placeOrder(orderRequestDto);
        ApiResponse<OrderResponseDto> body = ApiResponse.<OrderResponseDto>builder()
                .success(true)
                .message("Order created successfully")
                .data(createdOrder)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getOrdersByUserId(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status
    ) {
        Long userId = (Long) authentication.getPrincipal();
        org.springframework.data.domain.Page<com.quickbite.orderservice.entity.Order> pageData = orderService.getOrdersByUserIdPage(userId, page, size, sortBy, sortDir, status);
        List<OrderResponseDto> orders = pageData.getContent().stream().map(o -> {
            OrderResponseDto dto = new OrderResponseDto();
            org.springframework.beans.BeanUtils.copyProperties(o, dto);
            return dto;
        }).collect(java.util.stream.Collectors.toList());
        ApiResponse<List<OrderResponseDto>> body = ApiResponse.<List<OrderResponseDto>>builder()
                .success(true)
                .message("Orders fetched successfully")
                .data(orders)
                .page(PageMeta.builder()
                        .page(pageData.getNumber())
                        .size(pageData.getSize())
                        .totalElements(pageData.getTotalElements())
                        .totalPages(pageData.getTotalPages())
                        .build())
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
        List<OrderResponseDto> orders = pageData.getContent().stream().map(o -> {
            OrderResponseDto dto = new OrderResponseDto();
            org.springframework.beans.BeanUtils.copyProperties(o, dto);
            return dto;
        }).collect(java.util.stream.Collectors.toList());
        ApiResponse<List<OrderResponseDto>> body = ApiResponse.<List<OrderResponseDto>>builder()
                .success(true)
                .message("Orders fetched successfully")
                .data(orders)
                .page(PageMeta.builder()
                        .page(pageData.getNumber())
                        .size(pageData.getSize())
                        .totalElements(pageData.getTotalElements())
                        .totalPages(pageData.getTotalPages())
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
}