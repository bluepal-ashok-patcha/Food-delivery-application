package com.quickbite.orderservice.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDto {

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotNull(message = "Restaurant ID cannot be null")
    private Long restaurantId;

    @NotNull(message = "Address ID cannot be null")
    private Long addressId;

    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemDto> items;

    private String specialInstructions;

    // Optional: client-provided delivery coordinates; if absent, service may fetch from user-service via JDBC
    private Double deliveryLatitude;
    private Double deliveryLongitude;
}