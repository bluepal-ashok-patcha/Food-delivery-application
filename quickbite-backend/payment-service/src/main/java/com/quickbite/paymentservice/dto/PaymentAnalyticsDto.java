package com.quickbite.paymentservice.dto;

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
public class PaymentAnalyticsDto {
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    
    // Payment Statistics
    private Long totalTransactions;
    private Long todayTransactions;
    private Long successfulTransactions;
    private Long failedTransactions;
    private Long pendingTransactions;
    
    // Revenue Statistics
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal averageTransactionValue;
    private BigDecimal totalFees;
    private BigDecimal netRevenue;
    
    // Payment Method Analytics
    private List<PaymentMethodStatsDto> paymentMethodStats;
    
    // Transaction Status Distribution
    private List<TransactionStatusDto> statusDistribution;
    
    // Time-based Analytics
    private List<HourlyTransactionDto> hourlyTransactions;
    private List<PaymentDailyRevenueDto> dailyRevenue;
    
    // Refund Analytics
    private Long totalRefunds;
    private BigDecimal totalRefundAmount;
    private Double refundRate;
    
    // Coupon Analytics
    private Long totalCouponsUsed;
    private BigDecimal totalDiscountAmount;
    private Double averageDiscountPercentage;
    
    // Performance Metrics
    private Double successRate;
    private Double failureRate;
    private Double averageProcessingTime; // in seconds
}
