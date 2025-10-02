package com.quickbite.paymentservice.dto;

import com.quickbite.paymentservice.entity.CouponType;
import jakarta.validation.constraints.*;
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
public class CouponDto {

    private Long id;

    @NotBlank(message = "Coupon code is required")
    @Size(min = 3, max = 50, message = "Coupon code must be between 3 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Coupon code must contain only uppercase letters and numbers")
    private String code;

    @NotBlank(message = "Description is required")
    @Size(max = 200, message = "Description cannot exceed 200 characters")
    private String description;

    @NotNull(message = "Coupon type is required")
    private CouponType type;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.01", message = "Minimum order amount must be greater than 0")
    private BigDecimal minimumOrderAmount;

    @DecimalMin(value = "0.01", message = "Maximum discount amount must be greater than 0")
    private BigDecimal maximumDiscountAmount;

    @NotNull(message = "Valid from date is required")
    private LocalDateTime validFrom;

    @NotNull(message = "Valid until date is required")
    private LocalDateTime validUntil;

    @NotNull(message = "Total usage limit is required")
    @Min(value = 1, message = "Total usage limit must be at least 1")
    private Integer totalUsageLimit;

    @NotNull(message = "Usage per user limit is required")
    @Min(value = 1, message = "Usage per user limit must be at least 1")
    private Integer usagePerUserLimit;

    private Integer currentUsageCount;

    private Boolean isActive;

    private Long restaurantId;

    private Long userId;

    @Size(max = 1000, message = "Terms cannot exceed 1000 characters")
    private String terms;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long createdBy;
}
