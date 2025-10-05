package com.quickbite.orderservice.service;

import com.quickbite.orderservice.dto.OrderAnalyticsDto;
import com.quickbite.orderservice.dto.OrderStatusCountDto;
import com.quickbite.orderservice.dto.HourlyOrderCountDto;
import com.quickbite.orderservice.dto.DailyOrderCountDto;
import com.quickbite.orderservice.dto.RestaurantOrderCountDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderAnalyticsService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public OrderAnalyticsDto getOrderAnalytics(String period) {
        LocalDateTime startDate = getStartDate(period);
        LocalDateTime endDate = LocalDateTime.now();

        // Order Statistics
        Long totalOrders = getTotalOrders(startDate, endDate);
        Long todayOrders = getTodayOrders();
        Long pendingOrders = getPendingOrders();
        Long completedOrders = getCompletedOrders(startDate, endDate);
        Long cancelledOrders = getCancelledOrders(startDate, endDate);

        // Revenue Statistics
        BigDecimal totalRevenue = getTotalRevenue(startDate, endDate);
        BigDecimal todayRevenue = getTodayRevenue();
        BigDecimal averageOrderValue = getAverageOrderValue(startDate, endDate);

        // Performance Metrics
        Double completionRate = getCompletionRate(startDate, endDate);
        Double cancellationRate = getCancellationRate(startDate, endDate);
        Double averageDeliveryTime = getAverageDeliveryTime(startDate, endDate);

        // Analytics Data
        List<OrderStatusCountDto> statusDistribution = getOrderStatusDistribution(startDate, endDate);
        List<HourlyOrderCountDto> hourlyOrders = getHourlyOrders(startDate, endDate);
        List<DailyOrderCountDto> dailyOrders = getDailyOrders(startDate, endDate);
        List<RestaurantOrderCountDto> topRestaurants = getTopRestaurants(startDate, endDate);

        // Customer Analytics
        Long totalCustomers = getTotalCustomers(startDate, endDate);
        Long newCustomers = getNewCustomers(startDate, endDate);
        Double averageOrdersPerCustomer = getAverageOrdersPerCustomer(startDate, endDate);

        return OrderAnalyticsDto.builder()
            .periodStart(startDate)
            .periodEnd(endDate)
            .totalOrders(totalOrders)
            .todayOrders(todayOrders)
            .pendingOrders(pendingOrders)
            .completedOrders(completedOrders)
            .cancelledOrders(cancelledOrders)
            .totalRevenue(totalRevenue)
            .todayRevenue(todayRevenue)
            .averageOrderValue(averageOrderValue)
            .completionRate(completionRate)
            .cancellationRate(cancellationRate)
            .averageDeliveryTime(averageDeliveryTime)
            .statusDistribution(statusDistribution)
            .hourlyOrders(hourlyOrders)
            .dailyOrders(dailyOrders)
            .topRestaurants(topRestaurants)
            .totalCustomers(totalCustomers)
            .newCustomers(newCustomers)
            .averageOrdersPerCustomer(averageOrdersPerCustomer)
            .build();
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

    private Long getTotalOrders(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COUNT(*) FROM orders WHERE created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, Long.class, startDate, endDate);
    }

    private Long getTodayOrders() {
        String sql = "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    private Long getPendingOrders() {
        String sql = "SELECT COUNT(*) FROM orders WHERE order_status IN ('PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP')";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    private Long getCompletedOrders(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COUNT(*) FROM orders WHERE order_status = 'DELIVERED' AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, Long.class, startDate, endDate);
    }

    private Long getCancelledOrders(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COUNT(*) FROM orders WHERE order_status = 'CANCELLED' AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, Long.class, startDate, endDate);
    }

    private BigDecimal getTotalRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status = 'DELIVERED' AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, startDate, endDate);
    }

    private BigDecimal getTodayRevenue() {
        String sql = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status = 'DELIVERED' AND DATE(created_at) = CURDATE()";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class);
    }

    private BigDecimal getAverageOrderValue(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COALESCE(AVG(total_amount), 0) FROM orders WHERE order_status = 'DELIVERED' AND created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, startDate, endDate);
    }

    private Double getCompletionRate(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                ROUND(COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END) * 100.0 / COUNT(*), 2)
            FROM orders 
            WHERE created_at BETWEEN ? AND ?
            """;
        return jdbcTemplate.queryForObject(sql, Double.class, startDate, endDate);
    }

    private Double getCancellationRate(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                ROUND(COUNT(CASE WHEN order_status = 'CANCELLED' THEN 1 END) * 100.0 / COUNT(*), 2)
            FROM orders 
            WHERE created_at BETWEEN ? AND ?
            """;
        return jdbcTemplate.queryForObject(sql, Double.class, startDate, endDate);
    }

    private Double getAverageDeliveryTime(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                COALESCE(AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)), 0)
            FROM orders 
            WHERE order_status = 'DELIVERED' AND created_at BETWEEN ? AND ?
            """;
        return jdbcTemplate.queryForObject(sql, Double.class, startDate, endDate);
    }

    private List<OrderStatusCountDto> getOrderStatusDistribution(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                order_status,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders WHERE created_at BETWEEN ? AND ?), 2) as percentage
            FROM orders 
            WHERE created_at BETWEEN ? AND ?
            GROUP BY order_status
            ORDER BY count DESC
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> 
            OrderStatusCountDto.builder()
                .status(rs.getString("order_status"))
                .count(rs.getLong("count"))
                .percentage(rs.getDouble("percentage"))
                .build(),
            startDate, endDate, startDate, endDate);
    }

    private List<HourlyOrderCountDto> getHourlyOrders(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                HOUR(created_at) as hour,
                COUNT(*) as orderCount,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM orders 
            WHERE created_at BETWEEN ? AND ?
            GROUP BY HOUR(created_at)
            ORDER BY hour
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> 
            HourlyOrderCountDto.builder()
                .hour(rs.getInt("hour"))
                .orderCount(rs.getLong("orderCount"))
                .revenue(rs.getBigDecimal("revenue"))
                .build(),
            startDate, endDate);
    }

    private List<DailyOrderCountDto> getDailyOrders(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as orderCount,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM orders 
            WHERE created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> 
            DailyOrderCountDto.builder()
                .date(rs.getString("date"))
                .orderCount(rs.getLong("orderCount"))
                .revenue(rs.getBigDecimal("revenue"))
                .build(),
            startDate, endDate);
    }

    private List<RestaurantOrderCountDto> getTopRestaurants(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                o.restaurant_id as restaurantId,
                r.name as restaurantName,
                COUNT(*) as orderCount,
                COALESCE(SUM(o.total_amount), 0) as revenue
            FROM orders o
            LEFT JOIN restaurants r ON o.restaurant_id = r.id
            WHERE o.created_at BETWEEN ? AND ?
            GROUP BY o.restaurant_id, r.name
            ORDER BY orderCount DESC
            LIMIT 10
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> 
            RestaurantOrderCountDto.builder()
                .restaurantId(rs.getLong("restaurantId"))
                .restaurantName(rs.getString("restaurantName"))
                .orderCount(rs.getLong("orderCount"))
                .revenue(rs.getBigDecimal("revenue"))
                .build(),
            startDate, endDate);
    }

    private Long getTotalCustomers(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT COUNT(DISTINCT user_id) FROM orders WHERE created_at BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, Long.class, startDate, endDate);
    }

    private Long getNewCustomers(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT COUNT(DISTINCT user_id) 
            FROM orders 
            WHERE created_at BETWEEN ? AND ? 
            AND user_id NOT IN (
                SELECT DISTINCT user_id FROM orders WHERE created_at < ?
            )
            """;
        return jdbcTemplate.queryForObject(sql, Long.class, startDate, endDate, startDate);
    }

    private Double getAverageOrdersPerCustomer(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                COALESCE(AVG(order_count), 0)
            FROM (
                SELECT user_id, COUNT(*) as order_count
                FROM orders 
                WHERE created_at BETWEEN ? AND ?
                GROUP BY user_id
            ) as customer_orders
            """;
        return jdbcTemplate.queryForObject(sql, Double.class, startDate, endDate);
    }
}
