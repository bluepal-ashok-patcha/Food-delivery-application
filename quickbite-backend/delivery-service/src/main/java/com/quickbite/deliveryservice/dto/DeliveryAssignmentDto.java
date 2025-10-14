package com.quickbite.deliveryservice.dto;

import com.quickbite.deliveryservice.entity.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignmentDto {

    private Long id;
    private Long orderId;
    private Long deliveryPartnerId;
    private Long restaurantId;
    private String restaurantName; // Added restaurant name
    private Long customerId;
    private String customerName; // Added customer name
    private DeliveryStatus status;
    private String pickupAddress;
    private String deliveryAddress;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private Double currentLatitude;
    private Double currentLongitude;
    private BigDecimal estimatedDistance;
    private Integer estimatedDuration;
    private BigDecimal deliveryFee;
    private BigDecimal tip;
    private BigDecimal totalAmount; // Order total amount
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private LocalDateTime updatedAt;
    private String specialInstructions;
}
