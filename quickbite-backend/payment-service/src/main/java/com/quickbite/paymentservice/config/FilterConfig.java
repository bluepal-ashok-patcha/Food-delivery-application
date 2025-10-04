package com.quickbite.paymentservice.config;

import com.quickbite.paymentservice.filter.JwtValidationFilter;
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
        registration.addUrlPatterns("/api/payments/*");
        registration.setName("jwtValidationFilter");
        registration.setOrder(1);
        return registration;
    }
}
