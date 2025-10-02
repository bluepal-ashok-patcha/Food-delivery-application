package com.quickbite.deliveryservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.and())
            .authorizeHttpRequests(auth -> auth
                // Reviews can be posted by authenticated customers
                .requestMatchers(HttpMethod.POST, "/api/delivery/partners/*/reviews").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/delivery/partners/*/reviews").permitAll()
                
                // Delivery partner-protected endpoints
                .requestMatchers(HttpMethod.GET, "/api/delivery/partners/profile").hasRole("DELIVERY_PARTNER")
                .requestMatchers(HttpMethod.PUT, "/api/delivery/partners/status").hasRole("DELIVERY_PARTNER")
                .requestMatchers(HttpMethod.POST, "/api/delivery/partners").hasRole("DELIVERY_PARTNER")
                
                // Delivery assignments endpoints
                .requestMatchers(HttpMethod.POST, "/api/delivery/assignments").hasAnyRole("ADMIN", "RESTAURANT_OWNER")
                .requestMatchers(HttpMethod.PUT, "/api/delivery/assignments/*/accept").hasRole("DELIVERY_PARTNER")
                .requestMatchers(HttpMethod.PUT, "/api/delivery/assignments/*/status").hasRole("DELIVERY_PARTNER")
                .requestMatchers(HttpMethod.PUT, "/api/delivery/assignments/location").hasRole("DELIVERY_PARTNER")
                .requestMatchers(HttpMethod.GET, "/api/delivery/assignments/my").hasRole("DELIVERY_PARTNER")
                .requestMatchers(HttpMethod.GET, "/api/delivery/assignments/active").hasRole("DELIVERY_PARTNER")
                .requestMatchers(HttpMethod.GET, "/api/delivery/assignments/order/*").authenticated()
                
                // Public endpoints
                .requestMatchers(HttpMethod.GET, "/api/delivery/partners/available").authenticated()
                
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}