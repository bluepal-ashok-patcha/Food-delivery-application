package com.quickbite.deliveryservice.controller;

import com.quickbite.deliveryservice.dto.ApiResponse;
import com.quickbite.deliveryservice.dto.DeliveryPartnerDto;
import com.quickbite.deliveryservice.dto.LocationUpdateDto;
import com.quickbite.deliveryservice.dto.DeliveryPartnerReviewDto;
import com.quickbite.deliveryservice.entity.DeliveryPartnerStatus;
import com.quickbite.deliveryservice.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import com.quickbite.deliveryservice.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/partners")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> createDeliveryPartner(@Valid @RequestBody DeliveryPartnerDto partnerDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        partnerDto.setUserId(userId); // Set userId from authenticated token
        DeliveryPartnerDto createdPartner = deliveryService.createDeliveryPartner(partnerDto);
        ApiResponse<DeliveryPartnerDto> body = ApiResponse.<DeliveryPartnerDto>builder()
                .success(true)
                .message("Delivery partner created successfully")
                .data(createdPartner)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @GetMapping("/partners/profile")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> getDeliveryPartner(HttpServletRequest request) {
        Long userId = extractUserId(request);
        DeliveryPartnerDto partner = deliveryService.getDeliveryPartnerByUserId(userId);
        return ResponseEntity.ok(ApiResponse.<DeliveryPartnerDto>builder()
                .success(true)
                .message("Delivery partner fetched successfully")
                .data(partner)
                .build());
    }

    @PutMapping("/partners/status")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> updatePartnerStatus(@RequestParam DeliveryPartnerStatus status, HttpServletRequest request) {
        Long userId = extractUserId(request);
        DeliveryPartnerDto updatedPartner = deliveryService.updateDeliveryPartnerStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.<DeliveryPartnerDto>builder()
                .success(true)
                .message("Delivery partner status updated successfully")
                .data(updatedPartner)
                .build());
    }

    @PutMapping("/partners/location")
    public ResponseEntity<ApiResponse<Void>> updatePartnerLocation(@Valid @RequestBody LocationUpdateDto locationDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        deliveryService.updateDeliveryPartnerLocation(userId, locationDto);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Delivery partner location updated successfully")
                .data(null)
                .build());
    }

    @PutMapping("/partners/profile")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> updateProfile(@RequestBody DeliveryPartnerDto partnerDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        partnerDto.setUserId(userId);
        DeliveryPartnerDto updatedPartner = deliveryService.updateDeliveryPartnerProfile(userId, partnerDto);
        return ResponseEntity.ok(ApiResponse.<DeliveryPartnerDto>builder()
                .success(true)
                .message("Profile updated successfully")
                .data(updatedPartner)
                .build());
    }

    @GetMapping("/partners/available")
    public ResponseEntity<ApiResponse<List<DeliveryPartnerDto>>> getAvailablePartners() {
        List<DeliveryPartnerDto> partners = deliveryService.findAvailablePartners();
        return ResponseEntity.ok(ApiResponse.<List<DeliveryPartnerDto>>builder()
                .success(true)
                .message("Available delivery partners fetched successfully")
                .data(partners)
                .build());
    }

    // --- Onboarding ---

    @PostMapping("/partners/self-register")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> selfRegister(@Valid @RequestBody DeliveryPartnerDto partnerDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        partnerDto.setUserId(userId);
        // Force status to OFFLINE as initial state (treated as PENDING by admin workflow)
        if (partnerDto.getStatus() == null) {
            partnerDto.setStatus(com.quickbite.deliveryservice.entity.DeliveryPartnerStatus.OFFLINE);
        }
        DeliveryPartnerDto saved = deliveryService.selfRegisterOrUpdate(partnerDto);
        return new ResponseEntity<>(ApiResponse.<DeliveryPartnerDto>builder()
                .success(true)
                .message("Delivery partner application submitted successfully")
                .data(saved)
                .build(), HttpStatus.CREATED);
    }

    // --- Reviews ---

    @PostMapping("/partners/{partnerUserId}/reviews")
    public ResponseEntity<ApiResponse<DeliveryPartnerReviewDto>> addPartnerReview(@PathVariable Long partnerUserId, @Valid @RequestBody DeliveryPartnerReviewDto dto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        dto.setPartnerUserId(partnerUserId);
        dto.setUserId(userId);
        DeliveryPartnerReviewDto saved = deliveryService.addPartnerReview(dto);
        return new ResponseEntity<>(ApiResponse.<DeliveryPartnerReviewDto>builder()
                .success(true)
                .message("Review added successfully")
                .data(saved)
                .build(), HttpStatus.CREATED);
    }

    @GetMapping("/partners/{partnerUserId}/reviews")
    public ResponseEntity<ApiResponse<List<DeliveryPartnerReviewDto>>> listPartnerReviews(@PathVariable Long partnerUserId) {
        List<DeliveryPartnerReviewDto> list = deliveryService.listPartnerReviews(partnerUserId);
        return ResponseEntity.ok(ApiResponse.<List<DeliveryPartnerReviewDto>>builder()
                .success(true)
                .message("Reviews fetched successfully")
                .data(list)
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