package com.quickbite.config;



import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JwtTokenValidator extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = request.getHeader(JWTConstant.JWT_HEADER); // e.g., "Authorization"

        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7); // remove "Bearer "

            try {
                SecretKey key = Keys.hmacShaKeyFor(JWTConstant.SECRET_KEY.getBytes());

                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(jwt)
                        .getBody();

                String email = String.valueOf(claims.get("email"));
                log.info("📧 Extracted Email: {}", email);

                Object rawAuthorities = claims.get("authorities");
                List<GrantedAuthority> authorities = new ArrayList<>();

                if (rawAuthorities instanceof List<?> rolesList) {
                    for (Object role : rolesList) {
                        // Add ROLE_ prefix so Spring Security recognizes it
                        String roleName = "ROLE_" + role.toString();
                        authorities.add(new SimpleGrantedAuthority(roleName));
                        log.info("➡️ Granted Authority: {}", roleName);
                    }
                }

                Authentication authentication =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("🔒 SecurityContext updated for user: {}", email);

            } catch (Exception e) {
                log.error("❌ Invalid token: {}", e.getMessage());
                throw new BadCredentialsException("Invalid token", e);
            }
        } else {
            log.warn("⚠️ No JWT token found or token doesn't start with 'Bearer '");
        }

        filterChain.doFilter(request, response);
    }
}

