package com.quickbite.orderservice.config;

import com.quickbite.orderservice.filter.JwtValidationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Autowired
    private JwtValidationFilter jwtValidationFilter;

    @Bean
    public FilterRegistrationBean<JwtValidationFilter> jwtFilterRegistration() {
        FilterRegistrationBean<JwtValidationFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(jwtValidationFilter);
        registration.addUrlPatterns("/api/orders/*", "/api/cart/*");
        registration.setName("jwtValidationFilter");
        registration.setOrder(1);
        return registration;
    }
}
