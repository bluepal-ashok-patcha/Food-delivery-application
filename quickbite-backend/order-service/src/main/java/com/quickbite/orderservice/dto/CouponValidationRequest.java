package com.quickbite.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidationRequest {
    private String couponCode;
    private Long userId;
    private Long restaurantId;
    private Double orderAmount;
}
