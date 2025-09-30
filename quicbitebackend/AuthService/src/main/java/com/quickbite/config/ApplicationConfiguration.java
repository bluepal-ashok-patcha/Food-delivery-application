package com.quickbite.config;


import java.io.IOException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class ApplicationConfiguration {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
	    return http
	        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
	        .authorizeHttpRequests(auth -> auth
	            
	            // Payment endpoints
	            .requestMatchers("/api/payments/**").hasAnyRole("CUSTOMER", "ADMIN")
	            .requestMatchers("/api/payments/webhook/**").hasRole("ADMIN")
	            // Review endpoints
	            .requestMatchers("/api/reviews").hasAnyRole("CUSTOMER", "ADMIN", "AGENT")
	            .requestMatchers("/api/reviews/**").hasAnyRole("CUSTOMER", "ADMIN", "AGENT")
	            // Enrollment endpoints
	            .requestMatchers("/api/enrollments/user/{userId}").hasAnyRole("CUSTOMER", "ADMIN", "AGENT")
	            // User profile endpoint
	            .requestMatchers("/api/user/profile").hasAnyRole("CUSTOMER", "ADMIN", "AGENT")
	            // Appointment endpoints
	            .requestMatchers("/api/appointments/request").hasRole("CUSTOMER")
	            .requestMatchers("/api/appointments/requests").hasAnyRole("AGENT", "ADMIN")
	            .requestMatchers(HttpMethod.POST, "/api/appointments/{id}/action").hasAnyRole("AGENT", "ADMIN")
	            .requestMatchers(HttpMethod.POST, "/api/appointments/{id}/confirm").hasAnyRole("AGENT", "ADMIN")
	            .requestMatchers("/api/appointments/report").hasAnyRole("AGENT", "ADMIN")
	            // Lead endpoints
	            .requestMatchers("/api/leads").hasAnyRole("AGENT", "ADMIN")
	            .requestMatchers("/api/leads/**").hasAnyRole("AGENT", "ADMIN")
	            // Message endpoints
	            .requestMatchers("/api/messages/**").hasAnyRole("CUSTOMER", "AGENT", "ADMIN")
	            // User endpoints
	            .requestMatchers(HttpMethod.GET, "/api/users/{id}").hasRole("ADMIN")
	            .requestMatchers(HttpMethod.GET, "/api/users/email/{email}").hasRole("ADMIN")
	            .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
	            .requestMatchers(HttpMethod.PUT, "/api/users/{id}").hasRole("ADMIN")
	            .requestMatchers(HttpMethod.DELETE, "/api/users/{id}").hasRole("ADMIN")
	            .requestMatchers("/api/users/image").hasAnyRole("CUSTOMER", "AGENT", "ADMIN")
	            .requestMatchers(HttpMethod.GET, "/api/users/report/pdf").hasRole("ADMIN")
	            // Auth endpoints (public access)
	            .requestMatchers("/api/auth/**").permitAll()
	            // Agent profile endpoint
	            .requestMatchers("/api/agents/createProfile").hasRole("AGENT")
	            // Allow all other requests (if not specified above)
	            .anyRequest().permitAll()
	        )
	        .exceptionHandling(exception -> exception
	            .accessDeniedHandler(customAccessDeniedHandler())
	        )
	        .csrf(csrf -> csrf.disable())
	        // Remove this line since CORS is handled by the API Gateway
	        // .cors(cors -> cors.configurationSource(corsConfigurationSource()))
	        .addFilterBefore(new JwtTokenValidator(), BasicAuthenticationFilter.class)
	        .httpBasic(Customizer.withDefaults())
	        .formLogin(Customizer.withDefaults())
	        .build();
	}
	
    

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public AccessDeniedHandler customAccessDeniedHandler() {
        return new AccessDeniedHandler() {
            @Override
            public void handle(HttpServletRequest request,
                              HttpServletResponse response,
                              AccessDeniedException accessDeniedException) throws IOException {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("""
                    {
                      "error": "❌ Access Denied",
                      "message": "Only authorized roles can access this resource",
                      "path": "%s"
                    }
                    """.formatted(request.getRequestURI()));
            }
        };
    }
}
