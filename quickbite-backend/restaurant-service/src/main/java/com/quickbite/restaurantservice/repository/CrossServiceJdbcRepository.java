package com.quickbite.restaurantservice.repository;

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

    public Map<String, Object> findAuthUserById(Long userId) {
        try {
            return jdbcTemplate.queryForMap(
                "SELECT id, email, role, name, phone, active FROM users WHERE id = ?",
                userId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public Map<String, Object> findUserProfileByUserId(Long userId) {
        try {
            return jdbcTemplate.queryForMap(
                "SELECT id, user_id, first_name, last_name, phone_number FROM user_profiles WHERE user_id = ?",
                userId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }
}
