package com.quickbite.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

@Component
public class JwtAuthenticationFilter implements GatewayFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey key;

    private static final List<String> openApiEndpoints = List.of(
            "/auth/register",
            "/auth/login",
            "/test/public",
            "/eureka"
    );

    // HTTP Method-specific role mappings
    // Format: "METHOD:ENDPOINT_PATTERN" -> List of allowed roles
    private static final Map<String, List<String>> roleMappings = createRoleMappings();
    
    private static Map<String, List<String>> createRoleMappings() {
        Map<String, List<String>> mappings = new java.util.HashMap<>();
        
        // ===== PUBLIC ENDPOINTS (No authentication required) =====
        mappings.put("GET:/api/restaurants", List.of("PUBLIC"));
        mappings.put("GET:/api/restaurants/{id}", List.of("PUBLIC"));
        mappings.put("GET:/api/restaurants/{restaurantId}/reviews", List.of("PUBLIC"));
        mappings.put("GET:/api/restaurants/{restaurantId}/categories", List.of("PUBLIC"));
        mappings.put("GET:/api/restaurants/{restaurantId}/items", List.of("PUBLIC"));
        mappings.put("GET:/api/restaurants/items/{itemId}", List.of("PUBLIC"));
        mappings.put("GET:/api/delivery/partners/available", List.of("PUBLIC"));
        mappings.put("GET:/api/delivery/partners/{partnerUserId}/reviews", List.of("PUBLIC"));
        mappings.put("POST:/api/payments/webhook", List.of("PUBLIC"));
        mappings.put("GET:/api/payments/webhook/test", List.of("PUBLIC"));
        mappings.put("POST:/api/payments/coupons/validate", List.of("PUBLIC"));
        
        // ===== CUSTOMER ENDPOINTS =====
        // Order endpoints
        mappings.put("POST:/api/orders", List.of("CUSTOMER"));
        mappings.put("POST:/api/orders/from-cart", List.of("CUSTOMER"));
        mappings.put("GET:/api/orders/user", List.of("CUSTOMER"));
        mappings.put("GET:/api/orders/user/**", List.of("CUSTOMER"));
        mappings.put("GET:/api/orders/user/active", List.of("CUSTOMER"));
        mappings.put("GET:/api/orders/restaurant/{restaurantId}", List.of("RESTAURANT_OWNER", "ADMIN"));
        
        // Cart endpoints
        mappings.put("GET:/api/cart", List.of("CUSTOMER"));
        mappings.put("POST:/api/cart/add", List.of("CUSTOMER"));
        mappings.put("PUT:/api/cart/items/{menuItemId}", List.of("CUSTOMER"));
        mappings.put("DELETE:/api/cart/items/{menuItemId}", List.of("CUSTOMER"));
        mappings.put("DELETE:/api/cart", List.of("CUSTOMER"));
        mappings.put("POST:/api/cart/coupon", List.of("CUSTOMER"));
        mappings.put("DELETE:/api/cart/coupon", List.of("CUSTOMER"));
        mappings.put("GET:/api/cart/pricing", List.of("CUSTOMER"));
        
        // User profile endpoints
        mappings.put("POST:/api/users/profile", List.of("CUSTOMER"));
        mappings.put("GET:/api/users/profile", List.of("CUSTOMER"));
        mappings.put("PUT:/api/users/profile", List.of("CUSTOMER"));
        mappings.put("GET:/api/users/location", List.of("CUSTOMER"));
        mappings.put("PUT:/api/users/location", List.of("CUSTOMER"));
        mappings.put("POST:/api/users/addresses", List.of("CUSTOMER"));
        mappings.put("PUT:/api/users/addresses/{addressId}", List.of("CUSTOMER"));
        mappings.put("DELETE:/api/users/addresses/{addressId}", List.of("CUSTOMER"));
        
        // Payment endpoints
        mappings.put("POST:/api/payments/process", List.of("CUSTOMER"));
        mappings.put("POST:/api/payments/verify-payment", List.of("CUSTOMER"));
        mappings.put("POST:/api/payments/refund", List.of("CUSTOMER"));
        mappings.put("GET:/api/payments/history", List.of("CUSTOMER"));
        mappings.put("GET:/api/payments/coupons/applicable", List.of("CUSTOMER"));
        
        // Review endpoints
        mappings.put("POST:/api/restaurants/{restaurantId}/reviews", List.of("CUSTOMER"));
        mappings.put("PUT:/api/restaurants/reviews/{reviewId}", List.of("CUSTOMER"));
        mappings.put("DELETE:/api/restaurants/reviews/{reviewId}", List.of("CUSTOMER"));
        mappings.put("POST:/api/delivery/partners/{partnerUserId}/reviews", List.of("CUSTOMER"));
        
        // ===== DELIVERY PARTNER ENDPOINTS =====
        // Delivery partner management
        mappings.put("POST:/api/delivery/partners", List.of("DELIVERY_PARTNER"));
        mappings.put("GET:/api/delivery/partners/profile", List.of("DELIVERY_PARTNER"));
        mappings.put("PUT:/api/delivery/partners/status", List.of("DELIVERY_PARTNER"));
        mappings.put("PUT:/api/delivery/partners/location", List.of("DELIVERY_PARTNER"));
        
        // Assignment management
        mappings.put("PUT:/api/delivery/assignments/{assignmentId}/accept", List.of("DELIVERY_PARTNER"));
        mappings.put("PUT:/api/delivery/assignments/{assignmentId}/status", List.of("DELIVERY_PARTNER"));
        mappings.put("GET:/api/delivery/assignments/my", List.of("DELIVERY_PARTNER"));
        mappings.put("GET:/api/delivery/assignments/active", List.of("DELIVERY_PARTNER"));
        mappings.put("PUT:/api/delivery/location", List.of("DELIVERY_PARTNER"));
        // Live location updates for assignments
        mappings.put("PUT:/api/delivery/assignments/location", List.of("DELIVERY_PARTNER"));
        
        // ===== RESTAURANT OWNER ENDPOINTS =====
        // Restaurant management
        mappings.put("POST:/api/restaurants", List.of("RESTAURANT_OWNER", "ADMIN"));
        // Onboarding endpoints
        mappings.put("POST:/api/restaurants/owners/apply", List.of("CUSTOMER", "ADMIN"));
        mappings.put("POST:/api/delivery/partners/self-register", List.of("CUSTOMER", "ADMIN"));
        mappings.put("GET:/api/delivery/admin/pending", List.of("ADMIN"));
        mappings.put("PUT:/api/restaurants/{id}/profile", List.of("RESTAURANT_OWNER","ADMIN"));
        // Owner toggle for open (owner can change isOpen)
        mappings.put("PUT:/api/restaurants/{id}/open", List.of("RESTAURANT_OWNER","ADMIN"));
        mappings.put("GET:/api/restaurants/my", List.of("RESTAURANT_OWNER"));
        
        // Category management
        mappings.put("POST:/api/restaurants/{restaurantId}/categories", List.of("RESTAURANT_OWNER"));
        mappings.put("PUT:/api/restaurants/categories/{categoryId}", List.of("RESTAURANT_OWNER"));
        mappings.put("DELETE:/api/restaurants/categories/{categoryId}", List.of("RESTAURANT_OWNER"));
        mappings.put("POST:/api/restaurants/categories", List.of("RESTAURANT_OWNER"));
        mappings.put("PUT:/api/restaurants/categories/{categoryId}", List.of("RESTAURANT_OWNER"));
        mappings.put("DELETE:/api/restaurants/categories/{categoryId}", List.of("RESTAURANT_OWNER"));
        
        // Menu item management
        mappings.put("POST:/api/restaurants/categories/{categoryId}/items", List.of("RESTAURANT_OWNER"));
        mappings.put("POST:/api/restaurants/items", List.of("RESTAURANT_OWNER"));
        mappings.put("PUT:/api/restaurants/items/{itemId}", List.of("RESTAURANT_OWNER"));
        mappings.put("DELETE:/api/restaurants/items/{itemId}", List.of("RESTAURANT_OWNER"));
        
        // Order management
        mappings.put("GET:/api/restaurants/orders", List.of("RESTAURANT_OWNER"));
        mappings.put("PUT:/api/restaurants/orders/{orderId}/status", List.of("RESTAURANT_OWNER"));
        
        // ===== MULTI-ROLE ENDPOINTS =====
        // Order status updates (multiple roles can update)
        mappings.put("PUT:/api/orders/{orderId}/status", List.of("RESTAURANT_OWNER", "ADMIN", "DELIVERY_PARTNER"));
        
        // Delivery assignment creation
        mappings.put("POST:/api/delivery/assignments", List.of("RESTAURANT_OWNER", "ADMIN","CUSTOMER","DELIVERY_PARTNER"));
        
        // Assignment lookup (multiple roles can view)
        mappings.put("GET:/api/delivery/assignments/order/{orderId}", List.of("RESTAURANT_OWNER", "ADMIN", "DELIVERY_PARTNER"));
        
        // Delivery: available orders feed (partners claimable list)
        mappings.put("GET:/api/delivery/assignments/available", List.of("DELIVERY_PARTNER", "ADMIN"));
        // Delivery: claim order (create+accept) by partner
        mappings.put("POST:/api/delivery/assignments/claim/{orderId}", List.of("DELIVERY_PARTNER"));
        

        
        // ===== ADMIN ENDPOINTS =====
        // Restaurant admin
        mappings.put("GET:/api/restaurants/admin/pending", List.of("ADMIN"));
        mappings.put("PUT:/api/restaurants/admin/{restaurantId}/approve", List.of("ADMIN"));
        mappings.put("PUT:/api/restaurants/admin/{restaurantId}/reject", List.of("ADMIN"));
        mappings.put("GET:/api/restaurants/admin/all", List.of("ADMIN"));
        mappings.put("PUT:/api/restaurants/admin/{restaurantId}/status", List.of("ADMIN"));
        // Admin toggle for active only (open handled on owner route)
        mappings.put("PUT:/api/restaurants/admin/{restaurantId}/active", List.of("ADMIN"));
        mappings.put("PUT:/api/restaurants/{id}/status", List.of("ADMIN"));
        mappings.put("POST:/api/restaurants/admin/initialize-ratings", List.of("ADMIN"));
        
        // Order admin
        mappings.put("GET:/api/orders", List.of("ADMIN"));
        mappings.put("GET:/api/orders/admin", List.of("ADMIN"));
        mappings.put("GET:/api/orders/admin/**", List.of("ADMIN"));
        
        // User admin
        mappings.put("GET:/api/users/admin/**", List.of("ADMIN"));
        mappings.put("PUT:/api/users/admin/**", List.of("ADMIN"));
        mappings.put("DELETE:/api/users/admin/**", List.of("ADMIN"));
        
        // Payment admin (Coupon management)
        mappings.put("POST:/api/payments/coupons", List.of("ADMIN"));
        mappings.put("PUT:/api/payments/coupons/{couponId}", List.of("ADMIN"));
        mappings.put("DELETE:/api/payments/coupons/{couponId}", List.of("ADMIN"));
        mappings.put("GET:/api/payments/coupons", List.of("ADMIN"));
        mappings.put("GET:/api/payments/coupons/{couponId}", List.of("ADMIN"));
        
        // Delivery admin
        mappings.put("GET:/api/delivery/admin/**", List.of("ADMIN"));
        mappings.put("PUT:/api/delivery/admin/**", List.of("ADMIN"));
        
        //----------------------------------------------------------------------------------------------
        
     // ===== ADMIN IMPORT/EXPORT (PDF/Excel) =====
        mappings.put("POST:/admin/users/import", List.of("ADMIN"));
        mappings.put("GET:/admin/users/export/pdf", List.of("ADMIN"));
        mappings.put("GET:/admin/users/export/pdf/{role}", List.of("ADMIN"));

        
        // ===== MISSING ENDPOINTS FROM README =====
        
        // Admin User Management (from auth-service)
        mappings.put("GET:/admin/users", List.of("ADMIN"));
        mappings.put("POST:/admin/users", List.of("ADMIN"));
        mappings.put("PUT:/admin/users/{id}", List.of("ADMIN"));
        mappings.put("PUT:/admin/users/{id}/activate", List.of("ADMIN"));
        mappings.put("PUT:/admin/users/{id}/deactivate", List.of("ADMIN"));
        
        // Payment Service Endpoints
        mappings.put("POST:/api/payments/intent", List.of("CUSTOMER"));
        mappings.put("GET:/api/payments/transactions", List.of("CUSTOMER", "ADMIN"));
        mappings.put("GET:/api/payments/transactions/{id}", List.of("CUSTOMER", "ADMIN"));
        mappings.put("GET:/api/payments/transactions/order/{orderId}", List.of("CUSTOMER", "ADMIN"));
        mappings.put("GET:/api/payments/transactions/status/{status}", List.of("ADMIN"));
        mappings.put("GET:/api/payments/transactions/restaurant/{restaurantId}", List.of("RESTAURANT_OWNER", "ADMIN"));
        
        // Additional Order Endpoints (already defined above)
        
        // Additional Restaurant Endpoints
        mappings.put("GET:/api/restaurants/my", List.of("RESTAURANT_OWNER"));
        mappings.put("GET:/api/restaurants/orders", List.of("RESTAURANT_OWNER"));
        mappings.put("PUT:/api/restaurants/orders/{orderId}/status", List.of("RESTAURANT_OWNER"));
        
        // Additional Delivery Endpoints (fixing role access)
        mappings.put("GET:/api/delivery/assignments/order/{orderId}", List.of("CUSTOMER", "RESTAURANT_OWNER", "ADMIN", "DELIVERY_PARTNER"));
        
        // ===== ANALYTICS ENDPOINTS =====
        // Restaurant Analytics
        mappings.put("GET:/api/restaurants/{restaurantId}/analytics", List.of("RESTAURANT_OWNER", "ADMIN"));
        mappings.put("GET:/api/restaurants/analytics/summary", List.of("ADMIN"));
        
        // Order Analytics
        mappings.put("GET:/api/orders/analytics", List.of("ADMIN"));
        mappings.put("GET:/api/orders/analytics/summary", List.of("ADMIN"));
        
        // Delivery Analytics
        mappings.put("GET:/api/delivery/analytics", List.of("ADMIN", "DELIVERY_PARTNER"));
        mappings.put("GET:/api/delivery/analytics/summary", List.of("ADMIN"));
        
        // Payment Analytics
        mappings.put("GET:/api/payments/analytics", List.of("ADMIN"));
        mappings.put("GET:/api/payments/analytics/summary", List.of("ADMIN"));
        
        return mappings;
    }

    public Predicate<ServerHttpRequest> isSecured =
            request -> {
                // Check if it's in the basic open endpoints
                boolean isBasicOpen = openApiEndpoints
                        .stream()
                        .anyMatch(uri -> request.getURI().getPath().contains(uri));
                
                if (isBasicOpen) {
                    return false; // Not secured
                }
                
                // Check if it's a public endpoint in our role mappings
                String method = request.getMethod().toString();
                String path = request.getURI().getPath();
                
                // Check for exact match
                String exactKey = method + ":" + path;
                if (roleMappings.containsKey(exactKey)) {
                    return !roleMappings.get(exactKey).contains("PUBLIC");
                }
                
                // Check for pattern matches
                for (Map.Entry<String, List<String>> entry : roleMappings.entrySet()) {
                    String pattern = entry.getKey();
                    String methodPattern = pattern.split(":")[0];
                    String pathPattern = pattern.split(":", 2)[1];
                    
                    if (method.equals(methodPattern) && matchesPath(path, pathPattern)) {
                        return !entry.getValue().contains("PUBLIC");
                    }
                }
                
                // If no rule found, consider it secured
                return true;
            };

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        System.out.println("DEBUG: JwtAuthenticationFilter processing request: " + request.getURI().getPath());

        // Handle OPTIONS requests (CORS preflight) - allow them through without authentication
        if ("OPTIONS".equals(request.getMethod().toString())) {
            System.out.println("DEBUG: OPTIONS request detected, allowing through for CORS preflight");
            return chain.filter(exchange);
        }

        if (isSecured.test(request)) {
            System.out.println("DEBUG: Request requires authentication");
            
            if (this.isAuthMissing(request)) {
                System.out.println("DEBUG: Authorization header is missing");
                return this.onError(exchange, "Authorization header is missing in request", HttpStatus.UNAUTHORIZED);
            }

            final String token = this.getAuthHeader(request);
            System.out.println("DEBUG: Extracted token: " + token.substring(0, Math.min(20, token.length())) + "...");

            try {
                this.isTokenValid(token);
                System.out.println("DEBUG: Token is valid");
                
                // Extract user info and add to headers
                Claims claims = this.getAllClaimsFromToken(token);
                String userId = claims.get("userId").toString();
                String role = claims.get("role").toString();
                String email = claims.getSubject();
                
                System.out.println("DEBUG: User ID: " + userId + ", Role: " + role + ", Email: " + email);
                
                // Check role-based authorization
                System.out.println("DEBUG: Checking role-based authorization for role: " + role);
                if (!hasRequiredRole(request.getMethod().toString(), request.getURI().getPath(), role)) {
                    System.out.println("DEBUG: Access denied - User role '" + role + "' not authorized for " + request.getMethod() + " " + request.getURI().getPath());
                    return this.onError(exchange, "Access denied - insufficient permissions", HttpStatus.FORBIDDEN);
                }
                
                System.out.println("DEBUG: Role-based authorization passed");
                
                // Add user info to request headers for downstream services
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Role", role)
                        .header("X-User-Email", email)
                        .build();
                
                exchange = exchange.mutate().request(mutatedRequest).build();
                
            } catch (Exception e) {
                System.out.println("DEBUG: Token validation failed: " + e.getMessage());
                return this.onError(exchange, "Authorization header is invalid", HttpStatus.UNAUTHORIZED);
            }
        } else {
            System.out.println("DEBUG: Request is public, skipping authentication");
        }
        
        return chain.filter(exchange);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().add("Content-Type", "application/json");
        String body = String.format("{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"path\":\"%s\"}",
                java.time.OffsetDateTime.now().toString(), httpStatus.value(), err, exchange.getRequest().getPath().value());
        byte[] bytes = body.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }

    private String getAuthHeader(ServerHttpRequest request) {
        return request.getHeaders().getOrEmpty("Authorization").get(0).substring(7);
    }

    private boolean isAuthMissing(ServerHttpRequest request) {
        if (!request.getHeaders().containsKey("Authorization")) {
            return true;
        }
        return !request.getHeaders().getOrEmpty("Authorization").get(0).startsWith("Bearer ");
    }

    private void isTokenValid(String token) {
        if (key == null) {
            key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }
        Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }
    
    private Claims getAllClaimsFromToken(String token) {
        if (key == null) {
            key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
    
    private boolean hasRequiredRole(String method, String path, String userRole) {
        System.out.println("DEBUG: Checking role authorization for " + method + " " + path + ", user role: " + userRole);
        
        // First check for exact method:path match
        String exactKey = method + ":" + path;
        System.out.println("DEBUG: Checking exact match for key: " + exactKey);
        if (roleMappings.containsKey(exactKey)) {
            List<String> allowedRoles = roleMappings.get(exactKey);
            boolean hasAccess = allowedRoles.contains("PUBLIC") || allowedRoles.contains(userRole);
            System.out.println("DEBUG: Exact match found - allowed roles: " + allowedRoles + ", access: " + hasAccess);
            return hasAccess;
        }
        
        // Check for pattern matches (with wildcards)
        System.out.println("DEBUG: No exact match, checking pattern matches...");
        for (Map.Entry<String, List<String>> entry : roleMappings.entrySet()) {
            String pattern = entry.getKey();
            String methodPattern = pattern.split(":")[0];
            String pathPattern = pattern.split(":", 2)[1];
            
            System.out.println("DEBUG: Checking pattern: " + pattern + " (method: " + methodPattern + ", path: " + pathPattern + ")");
            
            if (method.equals(methodPattern) && matchesPath(path, pathPattern)) {
                List<String> allowedRoles = entry.getValue();
                boolean hasAccess = allowedRoles.contains("PUBLIC") || allowedRoles.contains(userRole);
                System.out.println("DEBUG: Pattern match found - pattern: " + pattern + ", allowed roles: " + allowedRoles + ", access: " + hasAccess);
                return hasAccess;
            }
        }
        
        // If no specific rule found, deny access for security
        System.out.println("DEBUG: No authorization rule found - access denied");
        return false;
    }
    
    private boolean matchesPath(String actualPath, String pattern) {
        System.out.println("DEBUG: Matching path '" + actualPath + "' against pattern '" + pattern + "'");
        
        // Convert path pattern to regex
        // First handle path variables {variableName} -> [^/]+
        String regex = pattern.replaceAll("\\{[^}]+\\}", "[^/]+");
        
        // Then escape special regex characters (but NOT the ones we just added)
        regex = regex
            .replace(".", "\\.")
            .replace("?", "\\?")
            .replace("$", "\\$")
            .replace("|", "\\|")
            .replace("(", "\\(")
            .replace(")", "\\)");
        
        // Convert wildcards
        regex = regex.replace("*", ".*");
        
        System.out.println("DEBUG: Converted regex: '" + regex + "'");
        boolean matches = actualPath.matches(regex);
        System.out.println("DEBUG: Pattern match result: " + matches);
        
        return matches;
    }
}
