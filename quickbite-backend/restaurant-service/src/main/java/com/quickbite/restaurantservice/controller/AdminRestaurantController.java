package com.quickbite.restaurantservice.controller;

import com.quickbite.restaurantservice.dto.ApiResponse;
import com.quickbite.restaurantservice.dto.RestaurantApprovalRequest;
import com.quickbite.restaurantservice.dto.RestaurantDto;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import com.quickbite.restaurantservice.service.RestaurantService;
import com.quickbite.restaurantservice.service.RestaurantApprovalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import com.quickbite.restaurantservice.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/admin")
public class AdminRestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private RestaurantApprovalService approvalService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<RestaurantDto>>> getPendingRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<RestaurantDto> restaurants = restaurantService.getRestaurantsByStatus(RestaurantStatus.PENDING_APPROVAL, page, size);
        return ResponseEntity.ok(ApiResponse.<List<RestaurantDto>>builder()
                .success(true)
                .message("Pending restaurants fetched successfully")
                .data(restaurants)
                .build());
    }

    @PutMapping("/{restaurantId}/approve")
    public ResponseEntity<ApiResponse<RestaurantDto>> approveRestaurant(
            @PathVariable Long restaurantId,
            @Valid @RequestBody RestaurantApprovalRequest request,
            HttpServletRequest httpRequest) {
        Long adminUserId = extractUserId(httpRequest);
        RestaurantDto approvedRestaurant = approvalService.approveRestaurant(restaurantId, adminUserId, request.getApprovalNotes());
        return ResponseEntity.ok(ApiResponse.<RestaurantDto>builder()
                .success(true)
                .message("Restaurant approved successfully")
                .data(approvedRestaurant)
                .build());
    }

    @PutMapping("/{restaurantId}/reject")
    public ResponseEntity<ApiResponse<RestaurantDto>> rejectRestaurant(
            @PathVariable Long restaurantId,
            @Valid @RequestBody RestaurantApprovalRequest request,
            HttpServletRequest httpRequest) {
        Long adminUserId = extractUserId(httpRequest);
        RestaurantDto rejectedRestaurant = approvalService.rejectRestaurant(restaurantId, adminUserId, request.getRejectionReason());
        return ResponseEntity.ok(ApiResponse.<RestaurantDto>builder()
                .success(true)
                .message("Restaurant rejected successfully")
                .data(rejectedRestaurant)
                .build());
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<RestaurantDto>>> getAllRestaurantsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) RestaurantStatus status) {
        List<RestaurantDto> restaurants = status != null 
            ? restaurantService.getRestaurantsByStatus(status, page, size)
            : restaurantService.getAllRestaurants(page, size);
        return ResponseEntity.ok(ApiResponse.<List<RestaurantDto>>builder()
                .success(true)
                .message("Restaurants fetched successfully")
                .data(restaurants)
                .build());
    }

    @PutMapping("/{restaurantId}/status")
    public ResponseEntity<ApiResponse<RestaurantDto>> updateRestaurantStatus(
            @PathVariable Long restaurantId,
            @RequestParam RestaurantStatus status,
            HttpServletRequest httpRequest) {
        Long adminUserId = extractUserId(httpRequest);
        RestaurantDto updatedRestaurant = approvalService.updateRestaurantStatus(restaurantId, status, adminUserId);
        return ResponseEntity.ok(ApiResponse.<RestaurantDto>builder()
                .success(true)
                .message("Restaurant status updated successfully")
                .data(updatedRestaurant)
                .build());
    }

    @PostMapping("/initialize-ratings")
    public ResponseEntity<ApiResponse<Void>> initializeAllRestaurantRatings(HttpServletRequest httpRequest) {
        Long adminUserId = extractUserId(httpRequest);
        restaurantService.initializeAllRestaurantRatings();
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Restaurant ratings initialized successfully")
                .data(null)
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
