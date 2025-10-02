package com.quickbite.paymentservice.entity;

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
@Table(name = "coupons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 10, scale = 2)
    private BigDecimal minimumOrderAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal maximumDiscountAmount;

    @Column(nullable = false)
    private LocalDateTime validFrom;

    @Column(nullable = false)
    private LocalDateTime validUntil;

    @Column(nullable = false)
    private Integer totalUsageLimit;

    @Column(nullable = false)
    private Integer usagePerUserLimit;

    @Column(nullable = false)
    private Integer currentUsageCount = 0;

    @Column(nullable = false)
    private Boolean isActive = true;

    // Restaurant-specific coupon (null means applicable to all restaurants)
    private Long restaurantId;

    // User-specific coupon (null means applicable to all users)
    private Long userId;

    @Column(length = 1000)
    private String terms;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private Long createdBy; // Admin user ID who created this coupon
}
