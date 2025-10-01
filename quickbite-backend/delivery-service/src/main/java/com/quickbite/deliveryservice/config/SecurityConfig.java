package com.quickbite.deliveryservice.config;

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
                // Reviews can be posted by authenticated customers
                .requestMatchers(HttpMethod.POST, "/api/delivery/partners/*/reviews").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/delivery/partners/*/reviews").permitAll()
                // Delivery partner-protected endpoints
                .requestMatchers("/api/delivery/partners/profile").hasRole("DELIVERY_PARTNER")
                .requestMatchers("/api/delivery/partners/status").hasRole("DELIVERY_PARTNER")
                .requestMatchers("/api/delivery/partners/location").hasRole("DELIVERY_PARTNER")
                .requestMatchers(HttpMethod.POST, "/api/delivery/partners").hasRole("DELIVERY_PARTNER")
                // Internal/admin
                .requestMatchers(HttpMethod.GET, "/api/delivery/partners/available").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}