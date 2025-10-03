package com.quickbite.apigateway.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private AuthenticationFilter filter;

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service Routes
                .route("auth-service", r -> r.path("/auth/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://auth-service"))
                .route("auth-admin", r -> r.path("/admin/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://auth-service"))
                
                // User Service Routes
                .route("user-service", r -> r.path("/api/users/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://user-service"))
                
                // Restaurant Service Routes
                .route("restaurant-service", r -> r.path("/api/restaurants/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://restaurant-service"))
                
                // Order Service Routes
                .route("order-service", r -> r.path("/api/orders/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://order-service"))
                
                // Cart Service Routes (part of order-service)
                .route("cart-service", r -> r.path("/api/cart/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://order-service"))
                
                // Delivery Service Routes
                .route("delivery-service", r -> r.path("/api/delivery/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://delivery-service"))
                
                // Payment Service Routes (including enhanced coupons)
                .route("payment-service", r -> r.path("/api/payments/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://payment-service"))
                
                .build();
    }
}