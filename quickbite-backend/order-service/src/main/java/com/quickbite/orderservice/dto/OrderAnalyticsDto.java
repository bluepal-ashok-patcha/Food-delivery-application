package com.quickbite.orderservice.dto;

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
public class OrderAnalyticsDto {
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    
    // Order Statistics
    private Long totalOrders;
    private Long todayOrders;
    private Long pendingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    
    // Revenue Statistics
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal averageOrderValue;
    
    // Performance Metrics
    private Double completionRate;
    private Double cancellationRate;
    private Double averageDeliveryTime; // in minutes
    
    // Order Status Distribution
    private List<OrderStatusCountDto> statusDistribution;
    
    // Time-based Analytics
    private List<HourlyOrderCountDto> hourlyOrders;
    private List<DailyOrderCountDto> dailyOrders;
    
    // Top Restaurants
    private List<RestaurantOrderCountDto> topRestaurants;
    
    // Customer Analytics
    private Long totalCustomers;
    private Long newCustomers;
    private Double averageOrdersPerCustomer;
}
