package com.quickbite.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidationResponse {

    private boolean valid;
    private String message;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String couponCode;
    private String discountType;
    private Long couponId;
}
