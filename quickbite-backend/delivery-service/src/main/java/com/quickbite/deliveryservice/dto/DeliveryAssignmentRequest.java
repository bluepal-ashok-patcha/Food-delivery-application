package com.quickbite.deliveryservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignmentRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    // The following fields are optional and will be enriched server-side when missing
    private Long restaurantId;

    private Long customerId;

    private String pickupAddress;

    private String deliveryAddress;

    private Double pickupLatitude;

    private Double pickupLongitude;

    private Double deliveryLatitude;

    private Double deliveryLongitude;

    @DecimalMin(value = "0.0", message = "Delivery fee must be non-negative")
    private BigDecimal deliveryFee;

    @DecimalMin(value = "0.0", message = "Tip must be non-negative")
    private BigDecimal tip;

    private String specialInstructions;
}
