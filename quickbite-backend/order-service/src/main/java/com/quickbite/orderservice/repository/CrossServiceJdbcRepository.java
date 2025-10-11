package com.quickbite.orderservice.repository;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public class CrossServiceJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public CrossServiceJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getMenuItemDetails(Long menuItemId) {
        try {
            return jdbcTemplate.queryForMap(
                "SELECT mi.id, mi.name, mi.price, mi.description, mi.image_url, mi.in_stock, " +
                "mc.restaurant_id " +
                "FROM menu_items mi " +
                "JOIN menu_categories mc ON mi.menu_category_id = mc.id " +
                "WHERE mi.id = ?",
                menuItemId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public Map<String, Object> getRestaurantDetails(Long restaurantId) {
        try {
            return jdbcTemplate.queryForMap(
                "SELECT id, name, latitude, longitude, delivery_fee FROM restaurants WHERE id = ?",
                restaurantId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public Map<String, Object> getUserAddressDetails(Long addressId) {
        try {
            return jdbcTemplate.queryForMap(
                "SELECT id, latitude, longitude, street, city, state, zip_code FROM addresses WHERE id = ?",
                addressId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public Map<String, Object> getUserDetails(Long userId) {
        try {
            return jdbcTemplate.queryForMap(
                "SELECT id, email, name, phone FROM users WHERE id = ?",
                userId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public Map<String, Object> getDeliveryPartnerDetails(Long partnerId) {
        try {
            return jdbcTemplate.queryForMap(
                "SELECT dp.id, dp.name, dp.phone_number, dp.vehicle_details, dp.status " +
                "FROM delivery_partners dp " +
                "WHERE dp.id = ?",
                partnerId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public Map<String, Object> validateCoupon(String couponCode, Long userId, Long restaurantId, Double orderAmount) {
        try {
            // First, get the coupon details
            Map<String, Object> couponData = jdbcTemplate.queryForMap(
                "SELECT id, code, type, discount_value, minimum_order_amount, " +
                "maximum_discount_amount, valid_from, valid_until, total_usage_limit, " +
                "usage_per_user_limit, current_usage_count, restaurant_id, user_id " +
                "FROM coupons " +
                "WHERE code = ? AND is_active = true " +
                "AND valid_from <= CURRENT_TIMESTAMP AND valid_until >= CURRENT_TIMESTAMP " +
                "AND (restaurant_id IS NULL OR restaurant_id = ?) " +
                "AND (user_id IS NULL OR user_id = ?) " +
                "AND current_usage_count < total_usage_limit " +
                "AND minimum_order_amount <= ?",
                couponCode, restaurantId, userId, orderAmount
            );

            if (couponData == null) {
                return null;
            }

            // Check per-user usage limit separately
            Long couponId = ((Number) couponData.get("id")).longValue();
            Long userUsageCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = ? AND user_id = ?",
                Long.class, couponId, userId
            );

            Long usagePerUserLimit = ((Number) couponData.get("usage_per_user_limit")).longValue();
            if (userUsageCount >= usagePerUserLimit) {
                return null; // User has exceeded usage limit
            }

            return couponData;
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }
}
