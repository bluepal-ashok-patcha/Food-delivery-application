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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @PostMapping("/partners")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> createDeliveryPartner(@Valid @RequestBody DeliveryPartnerDto partnerDto, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        
        if (userId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.<DeliveryPartnerDto>builder()
                    .success(false)
                    .message("User ID not found in JWT token")
                    .build());
        }
        
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
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> getDeliveryPartner(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        DeliveryPartnerDto partner = deliveryService.getDeliveryPartnerByUserId(userId);
        return ResponseEntity.ok(ApiResponse.<DeliveryPartnerDto>builder()
                .success(true)
                .message("Delivery partner fetched successfully")
                .data(partner)
                .build());
    }

    @PutMapping("/partners/status")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> updatePartnerStatus(@RequestParam DeliveryPartnerStatus status, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        DeliveryPartnerDto updatedPartner = deliveryService.updateDeliveryPartnerStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.<DeliveryPartnerDto>builder()
                .success(true)
                .message("Delivery partner status updated successfully")
                .data(updatedPartner)
                .build());
    }

    @PutMapping("/partners/location")
    public ResponseEntity<ApiResponse<Void>> updatePartnerLocation(@Valid @RequestBody LocationUpdateDto locationDto, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        deliveryService.updateDeliveryPartnerLocation(userId, locationDto);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Delivery partner location updated successfully")
                .data(null)
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

    // --- Reviews ---

    @PostMapping("/partners/{partnerUserId}/reviews")
    public ResponseEntity<ApiResponse<DeliveryPartnerReviewDto>> addPartnerReview(@PathVariable Long partnerUserId, @Valid @RequestBody DeliveryPartnerReviewDto dto, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
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
}