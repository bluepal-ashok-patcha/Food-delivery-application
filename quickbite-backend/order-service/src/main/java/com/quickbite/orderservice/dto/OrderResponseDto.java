package com.quickbite.orderservice.dto;

import com.quickbite.orderservice.entity.OrderStatus;
import com.quickbite.orderservice.entity.PaymentStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDto {

    private Long id;
    private Long userId;
    private Long restaurantId;
    private Long deliveryPartnerId;
    private List<OrderItemResponseDto> items;
    private Double totalAmount;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private String deliveryAddress;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}