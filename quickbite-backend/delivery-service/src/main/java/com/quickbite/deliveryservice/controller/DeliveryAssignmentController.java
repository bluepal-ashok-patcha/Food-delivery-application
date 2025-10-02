package com.quickbite.deliveryservice.controller;

import com.quickbite.deliveryservice.dto.*;
import com.quickbite.deliveryservice.entity.DeliveryStatus;
import com.quickbite.deliveryservice.service.DeliveryAssignmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery/assignments")
public class DeliveryAssignmentController {

    @Autowired
    private DeliveryAssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<ApiResponse<DeliveryAssignmentDto>> assignOrder(@Valid @RequestBody DeliveryAssignmentRequest request) {
        DeliveryAssignmentDto assignment = assignmentService.assignOrder(request);
        ApiResponse<DeliveryAssignmentDto> body = ApiResponse.<DeliveryAssignmentDto>builder()
                .success(true)
                .message("Order assigned to delivery partner successfully")
                .data(assignment)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @PutMapping("/{assignmentId}/accept")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<ApiResponse<DeliveryAssignmentDto>> acceptAssignment(@PathVariable Long assignmentId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        DeliveryAssignmentDto assignment = assignmentService.acceptAssignment(assignmentId, userId);
        ApiResponse<DeliveryAssignmentDto> body = ApiResponse.<DeliveryAssignmentDto>builder()
                .success(true)
                .message("Assignment accepted successfully")
                .data(assignment)
                .build();
        return ResponseEntity.ok(body);
    }

    @PutMapping("/{assignmentId}/status")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<ApiResponse<DeliveryAssignmentDto>> updateDeliveryStatus(
            @PathVariable Long assignmentId,
            @RequestParam DeliveryStatus status,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        DeliveryAssignmentDto assignment = assignmentService.updateDeliveryStatus(assignmentId, status, userId);
        ApiResponse<DeliveryAssignmentDto> body = ApiResponse.<DeliveryAssignmentDto>builder()
                .success(true)
                .message("Delivery status updated successfully")
                .data(assignment)
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<DeliveryAssignmentDto>> getAssignmentByOrderId(@PathVariable Long orderId) {
        DeliveryAssignmentDto assignment = assignmentService.getAssignmentByOrderId(orderId);
        ApiResponse<DeliveryAssignmentDto> body = ApiResponse.<DeliveryAssignmentDto>builder()
                .success(true)
                .message("Assignment fetched successfully")
                .data(assignment)
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<ApiResponse<List<DeliveryAssignmentDto>>> getMyAssignments(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<DeliveryAssignmentDto> assignments = assignmentService.getPartnerAssignments(userId);
        ApiResponse<List<DeliveryAssignmentDto>> body = ApiResponse.<List<DeliveryAssignmentDto>>builder()
                .success(true)
                .message("Assignments fetched successfully")
                .data(assignments)
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<ApiResponse<List<DeliveryAssignmentDto>>> getActiveAssignments(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<DeliveryAssignmentDto> assignments = assignmentService.getActiveAssignments(userId);
        ApiResponse<List<DeliveryAssignmentDto>> body = ApiResponse.<List<DeliveryAssignmentDto>>builder()
                .success(true)
                .message("Active assignments fetched successfully")
                .data(assignments)
                .build();
        return ResponseEntity.ok(body);
    }

    @PutMapping("/location")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<ApiResponse<String>> updateLocation(@Valid @RequestBody LocationUpdateRequest request, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        assignmentService.updatePartnerLocation(userId, request);
        ApiResponse<String> body = ApiResponse.<String>builder()
                .success(true)
                .message("Location updated successfully")
                .data("Location updated")
                .build();
        return ResponseEntity.ok(body);
    }
}
