package com.quickbite.deliveryservice.dto;

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
public class DeliveryAnalyticsDto {
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    
    // Delivery Statistics
    private Long totalDeliveries;
    private Long todayDeliveries;
    private Long activeDeliveries;
    private Long completedDeliveries;
    private Long cancelledDeliveries;
    
    // Partner Statistics
    private Long totalPartners;
    private Long activePartners;
    private Long onlinePartners;
    private Long availablePartners;
    
    // Performance Metrics
    private Double averageDeliveryTime; // in minutes
    private Double onTimeDeliveryRate; // percentage
    private Double completionRate; // percentage
    private Double cancellationRate; // percentage
    
    // Earnings Analytics
    private BigDecimal totalEarnings;
    private BigDecimal todayEarnings;
    private BigDecimal averageEarningsPerDelivery;
    private BigDecimal averageEarningsPerPartner;
    
    // Rating Analytics
    private Double averageRating;
    private Long totalReviews;
    private List<DeliveryRatingDistributionDto> ratingDistribution;
    
    // Time-based Analytics
    private List<HourlyDeliveryDto> hourlyDeliveries;
    private List<DailyDeliveryDto> dailyDeliveries;
    
    // Top Performers
    private List<PartnerPerformanceDto> topPerformers;
    
    // Geographic Analytics
    private List<ZoneDeliveryDto> zoneDeliveries;
}
