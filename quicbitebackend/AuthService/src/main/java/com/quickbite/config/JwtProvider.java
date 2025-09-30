package com.quickbite.config;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Slf4j
@Service
public class JwtProvider {

    private final SecretKey key = Keys.hmacShaKeyFor(JWTConstant.SECRET_KEY.getBytes());

    public String generateToken(Authentication auth) {
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();

        // Convert roles to List<String> and remove "ROLE_" prefix if present
        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.startsWith("ROLE_") ? role.substring(5) : role) // strip ROLE_
                .collect(Collectors.toList());

        log.info("✅ Generating JWT Token...");
        log.info("📧 User Email: {}", auth.getName());
        log.debug("🔐 User Roles: {}", roles);

        String jwt = Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                .claim("email", auth.getName())
                .claim("authorities", roles) // now only "CUSTOMER", "ADMIN", etc.
                .signWith(key)
                .compact();

        log.info("✅ JWT Token generated successfully");
        log.debug("🪙 JWT Token (debug mode only): {}", jwt);

        return jwt;
    }

    public String getEmailFromJwtToken(String jwt) {
        log.debug("🔍 Extracting email from JWT");

        jwt = jwt.substring(7); // Remove Bearer prefix
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jwt)
                .getBody();

        String email = String.valueOf(claims.get("email"));
        log.info("✅ Email extracted from token: {}", email);

        return email;
    }
}
