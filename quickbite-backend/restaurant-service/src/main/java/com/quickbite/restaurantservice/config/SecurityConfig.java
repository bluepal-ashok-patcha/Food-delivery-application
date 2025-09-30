package com.quickbite.restaurantservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Public endpoints for browsing
                .requestMatchers(HttpMethod.GET, "/api/restaurants/**").permitAll()
                // Endpoints for restaurant owners
                .requestMatchers(HttpMethod.POST, "/api/restaurants").hasRole("RESTAURANT_OWNER")
                .requestMatchers(HttpMethod.PUT, "/api/restaurants/{id}/profile").hasRole("RESTAURANT_OWNER")
                .requestMatchers("/api/restaurants/{restaurantId}/categories/**").hasRole("RESTAURANT_OWNER")
                .requestMatchers("/api/restaurants/categories/**").hasRole("RESTAURANT_OWNER")
                .requestMatchers("/api/restaurants/items/**").hasRole("RESTAURANT_OWNER")
                // Endpoint for admins
                .requestMatchers(HttpMethod.PUT, "/api/restaurants/{id}/status").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}