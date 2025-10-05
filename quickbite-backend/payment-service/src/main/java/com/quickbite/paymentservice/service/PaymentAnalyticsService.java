package com.quickbite.paymentservice.service;

import com.quickbite.paymentservice.dto.PaymentAnalyticsDto;
import com.quickbite.paymentservice.dto.PaymentMethodStatsDto;
import com.quickbite.paymentservice.dto.TransactionStatusDto;
import com.quickbite.paymentservice.dto.HourlyTransactionDto;
import com.quickbite.paymentservice.dto.PaymentDailyRevenueDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class PaymentAnalyticsService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public PaymentAnalyticsDto getPaymentAnalytics(String period) {
        LocalDateTime startDate = getStartDate(period);
        LocalDateTime endDate = LocalDateTime.now();

        // Payment Statistics
        Long totalTransactions = getTotalTransactions(startDate, endDate);
        Long todayTransactions = getTodayTransactions();
        Long successfulTransactions = getSuccessfulTransactions(startDate, endDate);
        Long failedTransactions = getFailedTransactions(startDate, endDate);
        Long pendingTransactions = getPendingTransactions();

        // Revenue Statistics
        BigDecimal totalRevenue = getTotalRevenue(startDate, endDate);
        BigDecimal todayRevenue = getTodayRevenue();
        BigDecimal averageTransactionValue = getAverageTransactionValue(startDate, endDate);
        BigDecimal totalFees = getTotalFees(startDate, endDate);
        BigDecimal netRevenue = totalRevenue.subtract(totalFees);

        // Payment Method Analytics
        List<PaymentMethodStatsDto> paymentMethodStats = getPaymentMethodStats(startDate, endDate);

        // Transaction Status Distribution
        List<TransactionStatusDto> statusDistribution = getStatusDistribution(startDate, endDate);

        // Time-based Analytics
        List<HourlyTransactionDto> hourlyTransactions = getHourlyTransactions(startDate, endDate);
        List<PaymentDailyRevenueDto> dailyRevenue = getDailyRevenue(startDate, endDate);

        // Refund Analytics
        Long totalRefunds = getTotalRefunds(startDate, endDate);
        BigDecimal totalRefundAmount = getTotalRefundAmount(startDate, endDate);
        Double refundRate = getRefundRate(startDate, endDate);

        // Coupon Analytics
        Long totalCouponsUsed = getTotalCouponsUsed(startDate, endDate);
        BigDecimal totalDiscountAmount = getTotalDiscountAmount(startDate, endDate);
        Double averageDiscountPercentage = getAverageDiscountPercentage(startDate, endDate);

        // Performance Metrics
        Double successRate = getSuccessRate(startDate, endDate);
        Double failureRate = getFailureRate(startDate, endDate);
        Double averageProcessingTime = getAverageProcessingTime(startDate, endDate);

        return PaymentAnalyticsDto.builder()
            .periodStart(startDate)
            .periodEnd(endDate)
            .totalTransactions(totalTransactions)
            .todayTransactions(todayTransactions)
            .successfulTransactions(successfulTransactions)
            .failedTransactions(failedTransactions)
            .pendingTransactions(pendingTransactions)
            .totalRevenue(totalRevenue)
            .todayRevenue(todayRevenue)
            .averageTransactionValue(averageTransactionValue)
            .totalFees(totalFees)
            .netRevenue(netRevenue)
            .paymentMethodStats(paymentMethodStats)
            .statusDistribution(statusDistribution)
            .hourlyTransactions(hourlyTransactions)
            .dailyRevenue(dailyRevenue)
            .totalRefunds(totalRefunds)
            .totalRefundAmount(totalRefundAmount)
            .refundRate(refundRate)
            .totalCouponsUsed(totalCouponsUsed)
            .totalDiscountAmount(totalDiscountAmount)
            .averageDiscountPercentage(averageDiscountPercentage)
            .successRate(successRate)
            .failureRate(failureRate)
            .averageProcessingTime(averageProcessingTime)
            .build();
    }

    public Object getPaymentAnalyticsSummary(String period) {
        LocalDateTime startDate = getStartDate(period);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get summary statistics for payments
        Long totalTransactions = getTotalTransactions(startDate, endDate);
        BigDecimal totalRevenue = getTotalRevenue(startDate, endDate);
        Double successRate = getSuccessRate(startDate, endDate);
        
        return Map.of(
            "period", period,
            "periodStart", startDate,
            "periodEnd", endDate,
            "totalTransactions", totalTransactions,
            "totalRevenue", totalRevenue,
            "successRate", successRate,
            "message", "Payment analytics summary"
        );
    }

    private LocalDateTime getStartDate(String period) {
        LocalDateTime now = LocalDateTime.now();
        switch (period.toLowerCase()) {
            case "today":
                return now.toLocalDate().atStartOfDay();
            case "week":
                return now.minusWeeks(1);
            case "month":
                return now.minusMonths(1);
            case "year":
                return now.minusYears(1);
            default:
                return now.minusDays(7);
        }
    }

    private Long getTotalTransactions(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COUNT(*) FROM payment_transactions WHERE created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, Long.class, startDate, endDate);
    }

    private Long getTodayTransactions() {
        String sql = "SELECT COUNT(*) FROM payment_transactions WHERE DATE(created_at) = CURDATE()";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    private Long getSuccessfulTransactions(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COUNT(*) FROM payment_transactions WHERE status = 'SUCCESS' AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, Long.class, startDate, endDate);
    }

    private Long getFailedTransactions(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COUNT(*) FROM payment_transactions WHERE status = 'FAILED' AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, Long.class, startDate, endDate);
    }

    private Long getPendingTransactions() {
        String sql = "SELECT COUNT(*) FROM payment_transactions WHERE status = 'PENDING'";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    private BigDecimal getTotalRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status = 'SUCCESS' AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, startDate, endDate);
    }

    private BigDecimal getTodayRevenue() {
        String sql = "SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status = 'SUCCESS' AND DATE(created_at) = CURDATE()";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class);
    }

    private BigDecimal getAverageTransactionValue(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COALESCE(AVG(amount), 0) FROM payment_transactions WHERE status = 'SUCCESS' AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, startDate, endDate);
    }

    private BigDecimal getTotalFees(LocalDateTime startDate, LocalDateTime endDate) {
        // Assuming 2% processing fee
        String sql = "SELECT COALESCE(SUM(amount * 0.02), 0) FROM payment_transactions WHERE status = 'SUCCESS' AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, startDate, endDate);
    }

    private List<PaymentMethodStatsDto> getPaymentMethodStats(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                'RAZORPAY' as paymentMethod,
                COUNT(*) as transactionCount,
                COALESCE(SUM(amount), 0) as totalAmount,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM payment_transactions WHERE created_at BETWEEN ? AND ?), 2) as percentage,
                ROUND(COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) * 100.0 / COUNT(*), 2) as successRate
            FROM payment_transactions 
            WHERE created_at BETWEEN ? AND ?
            GROUP BY 'RAZORPAY'
            ORDER BY transactionCount DESC
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> 
            PaymentMethodStatsDto.builder()
                .paymentMethod(rs.getString("paymentMethod"))
                .transactionCount(rs.getLong("transactionCount"))
                .totalAmount(rs.getBigDecimal("totalAmount"))
                .percentage(rs.getDouble("percentage"))
                .successRate(rs.getDouble("successRate"))
                .build(),
            startDate, endDate, startDate, endDate);
    }

    private List<TransactionStatusDto> getStatusDistribution(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                status,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM payment_transactions WHERE created_at BETWEEN ? AND ?), 2) as percentage
            FROM payment_transactions 
            WHERE created_at BETWEEN ? AND ?
            GROUP BY status
            ORDER BY count DESC
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> 
            TransactionStatusDto.builder()
                .status(rs.getString("status"))
                .count(rs.getLong("count"))
                .percentage(rs.getDouble("percentage"))
                .build(),
            startDate, endDate, startDate, endDate);
    }

    private List<HourlyTransactionDto> getHourlyTransactions(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                HOUR(created_at) as hour,
                COUNT(*) as transactionCount,
                COALESCE(SUM(amount), 0) as totalAmount
            FROM payment_transactions 
            WHERE created_at BETWEEN ? AND ?
            GROUP BY HOUR(created_at)
            ORDER BY hour
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> 
            HourlyTransactionDto.builder()
                .hour(rs.getInt("hour"))
                .transactionCount(rs.getLong("transactionCount"))
                .totalAmount(rs.getBigDecimal("totalAmount"))
                .build(),
            startDate, endDate);
    }

    private List<PaymentDailyRevenueDto> getDailyRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                DATE(created_at) as date,
                COALESCE(SUM(amount), 0) as revenue,
                COUNT(*) as transactionCount
            FROM payment_transactions 
            WHERE status = 'SUCCESS' AND created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> 
            PaymentDailyRevenueDto.builder()
                .date(rs.getString("date"))
                .revenue(rs.getBigDecimal("revenue"))
                .transactionCount(rs.getLong("transactionCount"))
                .build(),
            startDate, endDate);
    }

    private Long getTotalRefunds(LocalDateTime startDate, LocalDateTime endDate) {
        // Assuming refunds are tracked with negative amounts or separate status
        String sql = "SELECT COUNT(*) FROM payment_transactions WHERE amount < 0 AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, Long.class, startDate, endDate);
    }

    private BigDecimal getTotalRefundAmount(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COALESCE(SUM(ABS(amount)), 0) FROM payment_transactions WHERE amount < 0 AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, startDate, endDate);
    }

    private Double getRefundRate(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                ROUND(COUNT(CASE WHEN amount < 0 THEN 1 END) * 100.0 / COUNT(*), 2)
            FROM payment_transactions 
            WHERE created_at BETWEEN ? AND ?
            """;
        return jdbcTemplate.queryForObject(sql, Double.class, startDate, endDate);
    }

    private Long getTotalCouponsUsed(LocalDateTime startDate, LocalDateTime endDate) {
        // Since orders table doesn't have coupon_id, return 0 for now
        return 0L;
    }

    private BigDecimal getTotalDiscountAmount(LocalDateTime startDate, LocalDateTime endDate) {
        // Since orders table doesn't have coupon_id, return 0 for now
        return BigDecimal.ZERO;
    }

    private Double getAverageDiscountPercentage(LocalDateTime startDate, LocalDateTime endDate) {
        // Since orders table doesn't have coupon_id, return 0 for now
        return 0.0;
    }

    private Double getSuccessRate(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                ROUND(COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) * 100.0 / COUNT(*), 2)
            FROM payment_transactions 
            WHERE created_at BETWEEN ? AND ?
            """;
        return jdbcTemplate.queryForObject(sql, Double.class, startDate, endDate);
    }

    private Double getFailureRate(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                ROUND(COUNT(CASE WHEN status = 'FAILED' THEN 1 END) * 100.0 / COUNT(*), 2)
            FROM payment_transactions 
            WHERE created_at BETWEEN ? AND ?
            """;
        return jdbcTemplate.queryForObject(sql, Double.class, startDate, endDate);
    }

    private Double getAverageProcessingTime(LocalDateTime startDate, LocalDateTime endDate) {
        // Since there's no updated_at column, we'll return 0 for now
        // In a real implementation, you might want to add an updated_at column
        // or calculate processing time based on other criteria
        return 0.0;
    }
}
