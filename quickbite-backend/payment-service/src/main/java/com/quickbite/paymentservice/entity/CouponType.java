package com.quickbite.paymentservice.entity;

public enum CouponType {
    PERCENTAGE,     // Percentage discount (e.g., 10% off)
    FIXED_AMOUNT,   // Fixed amount discount (e.g., $5 off)
    FREE_DELIVERY,  // Free delivery
    BOGO,          // Buy One Get One (50% off on second item)
    COMBO_DEAL     // Special combo pricing
}
