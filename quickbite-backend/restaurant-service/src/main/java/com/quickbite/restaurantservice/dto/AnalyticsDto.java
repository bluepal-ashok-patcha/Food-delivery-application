package com.quickbite.restaurantservice.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDto {
    private Long restaurantId;
    private String restaurantName;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    
    // Order Analytics
    private Long totalOrders;
    private Long todayOrders;
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private Double averageOrderValue;
    private Double averagePreparationTime; // in minutes
    
    // Popular Items
    private List<PopularItemDto> popularItems;
    
    // Order Status Distribution
    private List<OrderStatusDistributionDto> orderStatusDistribution;
    
    // Rating Analytics
    private Double averageRating;
    private Long totalReviews;
    private List<RatingDistributionDto> ratingDistribution;
    
    // Time-based Analytics
    private List<HourlyOrderDto> hourlyOrders;
    private List<DailyRevenueDto> dailyRevenue;
    
    // Performance Metrics
    private Double completionRate; // percentage
    private Double cancellationRate; // percentage
    private Double onTimeDeliveryRate; // percentage
}
