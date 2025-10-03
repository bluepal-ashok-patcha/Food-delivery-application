package com.quickbite.orderservice.controller;

import com.quickbite.orderservice.dto.*;
import com.quickbite.orderservice.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
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
            @Valid @RequestBody AddToCartRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        CartDto cart = cartService.addToCart(userId, request);
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
            @Valid @RequestBody UpdateCartItemRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        request.setMenuItemId(menuItemId); // Ensure consistency
        CartDto cart = cartService.updateCartItem(userId, request);
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
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        CartDto cart = cartService.removeFromCart(userId, menuItemId, customization);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Item removed from cart successfully")
                .data(cart)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
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
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        CartDto cart = cartService.applyCoupon(userId, couponCode);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Coupon applied successfully")
                .data(cart)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/coupon")
    public ResponseEntity<ApiResponse<CartDto>> removeCoupon(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        CartDto cart = cartService.removeCoupon(userId);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Coupon removed successfully")
                .data(cart)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pricing")
    public ResponseEntity<ApiResponse<CartPricingBreakdown>> getCartPricing(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        CartPricingBreakdown pricing = cartService.getCartPricing(userId);
        ApiResponse<CartPricingBreakdown> response = ApiResponse.<CartPricingBreakdown>builder()
                .success(true)
                .message("Cart pricing retrieved successfully")
                .data(pricing)
                .build();
        return ResponseEntity.ok(response);
    }
}
