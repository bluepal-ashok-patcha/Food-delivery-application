package com.quickbite.userservice.filter;

import com.quickbite.userservice.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtValidationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                // Validate JWT token
                if (jwtUtil.validateToken(token)) {
                    // Extract user info and add to request attributes
                    String username = jwtUtil.getUsernameFromToken(token);
                    request.setAttribute("username", username);
                    
                    // Extract additional claims if needed
                    var claims = jwtUtil.getAllClaimsFromToken(token);
                    if (claims.containsKey("userId")) {
                        request.setAttribute("userId", claims.get("userId"));
                    }
                    if (claims.containsKey("role")) {
                        request.setAttribute("userRole", claims.get("role"));
                    }
                    if (claims.containsKey("email")) {
                        request.setAttribute("userEmail", claims.get("email"));
                    }
                    
                    logger.debug("JWT validation successful for user: " + username);
                } else {
                    logger.warn("JWT token validation failed");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\":\"Invalid JWT token\"}");
                    return;
                }
            } catch (Exception e) {
                logger.error("JWT validation error: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"JWT validation failed\"}");
                return;
            }
        } else {
            logger.debug("No Authorization header found");
        }
        
        filterChain.doFilter(request, response);
    }
}
