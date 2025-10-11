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
    private String customerName; // Added customer name
    private Long restaurantId;
    private String restaurantName; // Added restaurant name
    private Long deliveryPartnerId;
    private String deliveryPartnerName; // Added delivery partner name
    private List<OrderItemResponseDto> items;
    private Integer itemCount; // Added item count
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