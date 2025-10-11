package com.quickbite.restaurantservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class RestaurantReviewDto {
    private Long id;
    private Long restaurantId; // Set by controller from path variable
    private Long userId; // from token
    private Long orderId; // Track which order this review is for (optional for now)
    @Min(1)
    @Max(5)
    private int rating;
    private String comment;
    private Instant createdAt;
}


