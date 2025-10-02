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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

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
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<CouponDto> coupons = couponService.getApplicableCoupons(restaurantId, userId);
        return ResponseEntity.ok(ApiResponse.<List<CouponDto>>builder()
                .success(true)
                .message("Applicable coupons fetched successfully")
                .data(coupons)
                .build());
    }

    // Admin endpoints
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(
            @Valid @RequestBody CouponDto couponDto,
            Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        CouponDto createdCoupon = couponService.createCoupon(couponDto, adminUserId);
        return new ResponseEntity<>(ApiResponse.<CouponDto>builder()
                .success(true)
                .message("Coupon created successfully")
                .data(createdCoupon)
                .build(), HttpStatus.CREATED);
    }

    @PutMapping("/{couponId}")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateCoupon(@PathVariable Long couponId) {
        couponService.deactivateCoupon(couponId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Coupon deactivated successfully")
                .build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponDto>> getCouponById(@PathVariable Long couponId) {
        CouponDto coupon = couponService.getCouponById(couponId);
        return ResponseEntity.ok(ApiResponse.<CouponDto>builder()
                .success(true)
                .message("Coupon fetched successfully")
                .data(coupon)
                .build());
    }
}


