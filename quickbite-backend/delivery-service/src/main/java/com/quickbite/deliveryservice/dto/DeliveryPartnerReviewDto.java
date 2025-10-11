package com.quickbite.deliveryservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class DeliveryPartnerReviewDto {
    private Long id;
    
    private Long partnerUserId;
    private Long userId;
    private Long orderId; // Track which order this review is for (optional for now)
    @Min(1)
    @Max(5)
    private int rating;
    private String comment;
    private Instant createdAt;
}


