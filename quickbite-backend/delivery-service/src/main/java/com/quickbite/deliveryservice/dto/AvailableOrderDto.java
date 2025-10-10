package com.quickbite.deliveryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableOrderDto {

    private Long orderId;
    private Long customerId;
    private Long restaurantId;

    private String restaurantName;
    private String restaurantAddress;

    private String deliveryAddress;

    private Double pickupLatitude;
    private Double pickupLongitude;

    private Double deliveryLatitude;
    private Double deliveryLongitude;

    private Double totalAmount;
    private Double deliveryFee; // optional if available from pricing policy
}


