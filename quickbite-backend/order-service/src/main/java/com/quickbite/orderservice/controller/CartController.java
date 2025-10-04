package com.quickbite.orderservice.controller;

import com.quickbite.orderservice.dto.*;
import com.quickbite.orderservice.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import com.quickbite.orderservice.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(HttpServletRequest request) {
        Long userId = extractUserId(request);
        CartDto cart = cartService.getCart(userId);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Cart retrieved successfully")
                .data(cart)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartDto>> addToCart(
            @Valid @RequestBody AddToCartRequest requestBody,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        CartDto cart = cartService.addToCart(userId, requestBody);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Item added to cart successfully")
                .data(cart)
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/items/{menuItemId}")
    public ResponseEntity<ApiResponse<CartDto>> updateCartItem(
            @PathVariable Long menuItemId,
            @Valid @RequestBody UpdateCartItemRequest body,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        body.setMenuItemId(menuItemId); // Ensure consistency
        CartDto cart = cartService.updateCartItem(userId, body);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Cart item updated successfully")
                .data(cart)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{menuItemId}")
    public ResponseEntity<ApiResponse<CartDto>> removeFromCart(
            @PathVariable Long menuItemId,
            @RequestParam(required = false) String customization,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        CartDto cart = cartService.removeFromCart(userId, menuItemId, customization);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Item removed from cart successfully")
                .data(cart)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(HttpServletRequest request) {
        Long userId = extractUserId(request);
        cartService.clearCart(userId);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Cart cleared successfully")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/coupon")
    public ResponseEntity<ApiResponse<CartDto>> applyCoupon(
            @RequestParam String couponCode,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        CartDto cart = cartService.applyCoupon(userId, couponCode);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Coupon applied successfully")
                .data(cart)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/coupon")
    public ResponseEntity<ApiResponse<CartDto>> removeCoupon(HttpServletRequest request) {
        Long userId = extractUserId(request);
        CartDto cart = cartService.removeCoupon(userId);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Coupon removed successfully")
                .data(cart)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pricing")
    public ResponseEntity<ApiResponse<CartPricingBreakdown>> getCartPricing(HttpServletRequest request) {
        Long userId = extractUserId(request);
        CartPricingBreakdown pricing = cartService.getCartPricing(userId);
        ApiResponse<CartPricingBreakdown> response = ApiResponse.<CartPricingBreakdown>builder()
                .success(true)
                .message("Cart pricing retrieved successfully")
                .data(pricing)
                .build();
        return ResponseEntity.ok(response);
    }
    private Long extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                return jwtUtil.getAllClaimsFromToken(token).get("userId", Long.class);
            } catch (Exception ignored) {}
        }
        throw new RuntimeException("Unauthorized");
    }
}
