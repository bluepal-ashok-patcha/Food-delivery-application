package com.quickbite.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartPricingBreakdown {

    private Double subtotal;
    private Double deliveryFee;
    private Double tax;
    private Double discount;
    private Double total;
    private String appliedCouponCode;
    private String couponMessage;
}
