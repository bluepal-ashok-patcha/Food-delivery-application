package com.quickbite.paymentservice.controller;

import com.quickbite.paymentservice.dto.ApiResponse;
import com.quickbite.paymentservice.dto.CouponDto;
import com.quickbite.paymentservice.dto.CouponValidationRequest;
import com.quickbite.paymentservice.dto.CouponValidationResponse;
import com.quickbite.paymentservice.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import com.quickbite.paymentservice.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @Valid @RequestBody CouponValidationRequest request) {
        CouponValidationResponse response = couponService.validateCoupon(request);
        return ResponseEntity.ok(ApiResponse.<CouponValidationResponse>builder()
                .success(response.isValid())
                .message(response.getMessage())
                .data(response)
                .build());
    }

    @GetMapping("/applicable")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getApplicableCoupons(
            @RequestParam(required = false) Long restaurantId,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        List<CouponDto> coupons = couponService.getApplicableCoupons(restaurantId, userId);
        return ResponseEntity.ok(ApiResponse.<List<CouponDto>>builder()
                .success(true)
                .message("Applicable coupons fetched successfully")
                .data(coupons)
                .build());
    }

    // Admin endpoints
    @PostMapping
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(
            @Valid @RequestBody CouponDto couponDto,
            HttpServletRequest request) {
        Long adminUserId = extractUserId(request);
        CouponDto createdCoupon = couponService.createCoupon(couponDto, adminUserId);
        return new ResponseEntity<>(ApiResponse.<CouponDto>builder()
                .success(true)
                .message("Coupon created successfully")
                .data(createdCoupon)
                .build(), HttpStatus.CREATED);
    }

    @PutMapping("/{couponId}")
    public ResponseEntity<ApiResponse<CouponDto>> updateCoupon(
            @PathVariable Long couponId,
            @Valid @RequestBody CouponDto couponDto) {
        CouponDto updatedCoupon = couponService.updateCoupon(couponId, couponDto);
        return ResponseEntity.ok(ApiResponse.<CouponDto>builder()
                .success(true)
                .message("Coupon updated successfully")
                .data(updatedCoupon)
                .build());
    }

    @DeleteMapping("/{couponId}")
    public ResponseEntity<ApiResponse<Void>> deactivateCoupon(@PathVariable Long couponId) {
        couponService.deactivateCoupon(couponId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Coupon deactivated successfully")
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<CouponDto> coupons = couponService.getAllCoupons(page, size);
        return ResponseEntity.ok(ApiResponse.<List<CouponDto>>builder()
                .success(true)
                .message("Coupons fetched successfully")
                .data(coupons)
                .build());
    }

    @GetMapping("/{couponId}")
    public ResponseEntity<ApiResponse<CouponDto>> getCouponById(@PathVariable Long couponId) {
        CouponDto coupon = couponService.getCouponById(couponId);
        return ResponseEntity.ok(ApiResponse.<CouponDto>builder()
                .success(true)
                .message("Coupon fetched successfully")
                .data(coupon)
                .build());
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


