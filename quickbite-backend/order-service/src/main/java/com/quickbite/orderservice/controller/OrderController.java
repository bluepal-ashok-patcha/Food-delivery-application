package com.quickbite.orderservice.controller;

import com.quickbite.orderservice.dto.OrderRequestDto;
import com.quickbite.orderservice.dto.OrderResponseDto;
import com.quickbite.orderservice.entity.OrderStatus;
import com.quickbite.orderservice.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponseDto> placeOrder(@RequestHeader("X-User-Id") Long userId, @Valid @RequestBody OrderRequestDto orderRequestDto) {
        // Ensure the userId from the token matches the one in the request for consistency
        if (!userId.equals(orderRequestDto.getUserId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        OrderResponseDto createdOrder = orderService.placeOrder(orderRequestDto);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByUserId(@RequestHeader("X-User-Id") Long userId) {
        List<OrderResponseDto> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByRestaurantId(@PathVariable Long restaurantId) {
        List<OrderResponseDto> orders = orderService.getOrdersByRestaurantId(restaurantId);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(@PathVariable Long orderId, @RequestParam OrderStatus status) {
        OrderResponseDto updatedOrder = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(updatedOrder);
    }
}