package com.quickbite.deliveryservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_assignments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long orderId;

    @Column(nullable = false)
    private Long deliveryPartnerId;

    @Column(nullable = false)
    private Long restaurantId;

    @Column(nullable = false)
    private Long customerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status;

    @Column(nullable = false, length = 500)
    private String pickupAddress;

    @Column(nullable = false, length = 500)
    private String deliveryAddress;

    // Pickup location coordinates
    private Double pickupLatitude;
    private Double pickupLongitude;

    // Delivery location coordinates
    private Double deliveryLatitude;
    private Double deliveryLongitude;

    // Current partner location (updated in real-time)
    private Double currentLatitude;
    private Double currentLongitude;

    @Column(precision = 10, scale = 2)
    private BigDecimal estimatedDistance; // in kilometers

    @Column
    private Integer estimatedDuration; // in minutes

    @Column(precision = 10, scale = 2)
    private BigDecimal deliveryFee;

    @Column(precision = 10, scale = 2)
    private BigDecimal tip;

    @CreationTimestamp
    private LocalDateTime assignedAt;

    private LocalDateTime acceptedAt;

    private LocalDateTime pickedUpAt;

    private LocalDateTime deliveredAt;

    private LocalDateTime cancelledAt;

    @Column(length = 500)
    private String cancellationReason;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(length = 1000)
    private String specialInstructions;
}
