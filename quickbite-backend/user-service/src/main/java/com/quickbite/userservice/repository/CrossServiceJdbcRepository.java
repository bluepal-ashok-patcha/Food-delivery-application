package com.quickbite.userservice.repository;

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

    public Map<String, Object> findAuthUserById(Long id) {
        try {
            return jdbcTemplate.queryForMap(
                "SELECT id, email, role, name, phone FROM users WHERE id = ?",
                id
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }
}


