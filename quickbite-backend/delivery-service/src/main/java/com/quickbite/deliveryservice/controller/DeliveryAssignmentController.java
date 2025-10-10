package com.quickbite.deliveryservice.controller;

import com.quickbite.deliveryservice.dto.*;
import com.quickbite.deliveryservice.entity.DeliveryStatus;
import com.quickbite.deliveryservice.service.DeliveryAssignmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import com.quickbite.deliveryservice.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
@RequestMapping("/api/delivery/assignments")
public class DeliveryAssignmentController {

    @Autowired
    private DeliveryAssignmentService assignmentService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping
    public ResponseEntity<ApiResponse<DeliveryAssignmentDto>> assignOrder(@Valid @RequestBody DeliveryAssignmentRequest request, HttpServletRequest httpRequest) {
        // Enforce ownership when CUSTOMER creates assignment
        String role = extractRole(httpRequest);
        if ("CUSTOMER".equalsIgnoreCase(role)) {
            Long jwtUserId = extractUserId(httpRequest);
            Long orderUserId = jdbcTemplate.query("SELECT user_id FROM orders WHERE id = ?", ps -> ps.setLong(1, request.getOrderId()), rs -> rs.next() ? rs.getLong(1) : null);
            if (orderUserId == null || !orderUserId.equals(jwtUserId)) {
                throw new RuntimeException("Forbidden: order does not belong to current user");
            }
        }
        DeliveryAssignmentDto assignment = assignmentService.assignOrder(request);
        ApiResponse<DeliveryAssignmentDto> body = ApiResponse.<DeliveryAssignmentDto>builder()
                .success(true)
                .message("Order assigned to delivery partner successfully")
                .data(assignment)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @PutMapping("/{assignmentId}/accept")
    public ResponseEntity<ApiResponse<DeliveryAssignmentDto>> acceptAssignment(@PathVariable Long assignmentId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        DeliveryAssignmentDto assignment = assignmentService.acceptAssignment(assignmentId, userId);
        ApiResponse<DeliveryAssignmentDto> body = ApiResponse.<DeliveryAssignmentDto>builder()
                .success(true)
                .message("Assignment accepted successfully")
                .data(assignment)
                .build();
        return ResponseEntity.ok(body);
    }

    @PutMapping("/{assignmentId}/status")
    public ResponseEntity<ApiResponse<DeliveryAssignmentDto>> updateDeliveryStatus(
            @PathVariable Long assignmentId,
            @RequestParam DeliveryStatus status,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
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
    public ResponseEntity<ApiResponse<List<DeliveryAssignmentDto>>> getMyAssignments(HttpServletRequest request) {
        Long userId = extractUserId(request);
        List<DeliveryAssignmentDto> assignments = assignmentService.getPartnerAssignments(userId);
        ApiResponse<List<DeliveryAssignmentDto>> body = ApiResponse.<List<DeliveryAssignmentDto>>builder()
                .success(true)
                .message("Assignments fetched successfully")
                .data(assignments)
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DeliveryAssignmentDto>>> getActiveAssignments(HttpServletRequest request) {
        Long userId = extractUserId(request);
        List<DeliveryAssignmentDto> assignments = assignmentService.getActiveAssignments(userId);
        ApiResponse<List<DeliveryAssignmentDto>> body = ApiResponse.<List<DeliveryAssignmentDto>>builder()
                .success(true)
                .message("Active assignments fetched successfully")
                .data(assignments)
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<AvailableOrderDto>>> getAvailableOrders(HttpServletRequest request) {
        Long userId = extractUserId(request);
        List<AvailableOrderDto> list = assignmentService.listAvailableOrders(userId);
        ApiResponse<List<AvailableOrderDto>> body = ApiResponse.<List<AvailableOrderDto>>builder()
                .success(true)
                .message("Available orders fetched successfully")
                .data(list)
                .build();
        return ResponseEntity.ok(body);
    }

    @PostMapping("/claim/{orderId}")
    public ResponseEntity<ApiResponse<DeliveryAssignmentDto>> claimOrder(@PathVariable Long orderId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        DeliveryAssignmentDto dto = assignmentService.claimOrder(orderId, userId);
        ApiResponse<DeliveryAssignmentDto> body = ApiResponse.<DeliveryAssignmentDto>builder()
                .success(true)
                .message("Order claimed successfully")
                .data(dto)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @PutMapping("/location")
    public ResponseEntity<ApiResponse<String>> updateLocation(@Valid @RequestBody LocationUpdateRequest request, HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        assignmentService.updatePartnerLocation(userId, request);
        ApiResponse<String> body = ApiResponse.<String>builder()
                .success(true)
                .message("Location updated successfully")
                .data("Location updated")
                .build();
        return ResponseEntity.ok(body);
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

    private String extractRole(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                return jwtUtil.getAllClaimsFromToken(token).get("role", String.class);
            } catch (Exception ignored) {}
        }
        throw new RuntimeException("Unauthorized");
    }
}
