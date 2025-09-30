package com.quickbite.paymentservice.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public class OrderReadRepository {

	private final JdbcTemplate jdbcTemplate;

	public OrderReadRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

    public BigDecimal findOrderAmountById(Long orderId) {
        String sql = "SELECT total_amount FROM orders WHERE id = ?";
        return jdbcTemplate.query(sql, rs -> {
            if (rs.next()) {
                return rs.getBigDecimal("total_amount");
            }
            return null;
        }, orderId);
    }

    public Long findRestaurantIdByOrderId(Long orderId) {
        String sql = "SELECT restaurant_id FROM orders WHERE id = ?";
        return jdbcTemplate.query(sql, rs -> {
            if (rs.next()) {
                long value = rs.getLong("restaurant_id");
                return rs.wasNull() ? null : value;
            }
            return null;
        }, orderId);
    }
}
