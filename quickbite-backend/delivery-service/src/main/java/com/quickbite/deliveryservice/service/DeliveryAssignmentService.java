package com.quickbite.deliveryservice.service;

import com.quickbite.deliveryservice.dto.DeliveryAssignmentDto;
import com.quickbite.deliveryservice.dto.DeliveryAssignmentRequest;
import com.quickbite.deliveryservice.dto.LocationUpdateRequest;
import com.quickbite.deliveryservice.entity.DeliveryAssignment;
import com.quickbite.deliveryservice.entity.DeliveryPartner;
import com.quickbite.deliveryservice.entity.DeliveryPartnerStatus;
import com.quickbite.deliveryservice.entity.DeliveryStatus;
import com.quickbite.deliveryservice.repository.DeliveryAssignmentRepository;
import com.quickbite.deliveryservice.repository.DeliveryPartnerRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DeliveryAssignmentService {

    @Autowired
    private DeliveryAssignmentRepository assignmentRepository;

    @Autowired
    private DeliveryPartnerRepository partnerRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @org.springframework.beans.factory.annotation.Value("${delivery.assignment.maxRadiusKm:15}")
    private double maxAssignmentRadiusKm;

    @Transactional
    public DeliveryAssignmentDto assignOrder(DeliveryAssignmentRequest request) {
        // Check if order is already assigned
        if (assignmentRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new IllegalArgumentException("Order is already assigned to a delivery partner");
        }

        // Enrich missing fields from order-service and restaurant-service via JdbcTemplate
        EnrichedData enriched = enrichFromBackend(request);

        // Find the best available delivery partner
        DeliveryPartner partner = findBestAvailablePartner(enriched.pickupLatitude, enriched.pickupLongitude);
        if (partner == null) {
            throw new IllegalArgumentException("No available delivery partners found");
        }

        // Calculate estimated distance and duration
        BigDecimal estimatedDistance = calculateDistance(
            enriched.pickupLatitude, enriched.pickupLongitude,
            enriched.deliveryLatitude, enriched.deliveryLongitude
        );
        Integer estimatedDuration = calculateDuration(estimatedDistance);

        // Create delivery assignment
        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .orderId(request.getOrderId())
                .deliveryPartnerId(partner.getId())
                .restaurantId(enriched.restaurantId)
                .customerId(enriched.customerId)
                .status(DeliveryStatus.ASSIGNED)
                .pickupAddress(enriched.pickupAddress)
                .deliveryAddress(enriched.deliveryAddress)
                .pickupLatitude(enriched.pickupLatitude)
                .pickupLongitude(enriched.pickupLongitude)
                .deliveryLatitude(enriched.deliveryLatitude)
                .deliveryLongitude(enriched.deliveryLongitude)
                .currentLatitude(partner.getLatitude())
                .currentLongitude(partner.getLongitude())
                .estimatedDistance(estimatedDistance)
                .estimatedDuration(estimatedDuration)
                .deliveryFee(enriched.deliveryFee)
                .tip(request.getTip() != null ? request.getTip() : BigDecimal.ZERO)
                .specialInstructions(request.getSpecialInstructions())
                .build();

        DeliveryAssignment savedAssignment = assignmentRepository.save(assignment);

        // Update partner status
        partner.setStatus(DeliveryPartnerStatus.ON_DELIVERY);
        partnerRepository.save(partner);

        // Send notification to delivery partner
        sendAssignmentNotification(partner, savedAssignment);

        log.info("Order {} assigned to delivery partner {}", request.getOrderId(), partner.getId());

        return convertToDto(savedAssignment);
    }

    private static class EnrichedData {
        Long restaurantId;
        Long customerId;
        String pickupAddress;
        String deliveryAddress;
        Double pickupLatitude;
        Double pickupLongitude;
        Double deliveryLatitude;
        Double deliveryLongitude;
        BigDecimal deliveryFee;
    }

    private EnrichedData enrichFromBackend(DeliveryAssignmentRequest request) {
        EnrichedData e = new EnrichedData();
        // Use provided values if present; otherwise fetch from backend (to be implemented)
        e.restaurantId = request.getRestaurantId();
        e.customerId = request.getCustomerId();
        e.pickupAddress = request.getPickupAddress();
        e.deliveryAddress = request.getDeliveryAddress();
        e.pickupLatitude = request.getPickupLatitude();
        e.pickupLongitude = request.getPickupLongitude();
        e.deliveryLatitude = request.getDeliveryLatitude();
        e.deliveryLongitude = request.getDeliveryLongitude();
        e.deliveryFee = request.getDeliveryFee();

        // Look up missing data from orders table
        if (e.deliveryLatitude == null || e.deliveryLongitude == null || e.deliveryAddress == null || e.customerId == null) {
            String orderSql = "SELECT user_id, delivery_address, delivery_latitude, delivery_longitude, restaurant_id FROM orders WHERE id = ?";
            jdbcTemplate.query(orderSql, ps -> ps.setLong(1, request.getOrderId()), rs -> {
                if (rs.next()) {
                    if (e.customerId == null) e.customerId = rs.getLong("user_id");
                    if (e.deliveryAddress == null) e.deliveryAddress = rs.getString("delivery_address");
                    if (e.deliveryLatitude == null) e.deliveryLatitude = (Double) rs.getObject("delivery_latitude");
                    if (e.deliveryLongitude == null) e.deliveryLongitude = (Double) rs.getObject("delivery_longitude");
                    if (e.restaurantId == null) e.restaurantId = rs.getLong("restaurant_id");
                }
                return null;
            });
        }

        // Look up restaurant pickup address/coordinates if missing
        if (e.pickupLatitude == null || e.pickupLongitude == null || e.pickupAddress == null) {
            if (e.restaurantId != null) {
                String restSql = "SELECT address, latitude, longitude FROM restaurants WHERE id = ?";
                jdbcTemplate.query(restSql, ps -> ps.setLong(1, e.restaurantId), rs -> {
                    if (rs.next()) {
                        if (e.pickupAddress == null) e.pickupAddress = rs.getString("address");
                        if (e.pickupLatitude == null) e.pickupLatitude = (Double) rs.getObject("latitude");
                        if (e.pickupLongitude == null) e.pickupLongitude = (Double) rs.getObject("longitude");
                    }
                    return null;
                });
            }
        }

        if (e.deliveryFee == null) {
            e.deliveryFee = BigDecimal.valueOf(3.99);
        }
        return e;
    }

    @Transactional
    public DeliveryAssignmentDto acceptAssignment(Long assignmentId, Long partnerId) {
        DeliveryAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (!assignment.getDeliveryPartnerId().equals(partnerId)) {
            throw new RuntimeException("Assignment not assigned to this partner");
        }

        if (assignment.getStatus() != DeliveryStatus.ASSIGNED) {
            throw new RuntimeException("Assignment cannot be accepted in current status");
        }

        assignment.setStatus(DeliveryStatus.ACCEPTED);
        assignment.setAcceptedAt(LocalDateTime.now());
        DeliveryAssignment savedAssignment = assignmentRepository.save(assignment);

        log.info("Assignment {} accepted by partner {}", assignmentId, partnerId);

        return convertToDto(savedAssignment);
    }

    @Transactional
    public DeliveryAssignmentDto updateDeliveryStatus(Long assignmentId, DeliveryStatus newStatus, Long partnerId) {
        DeliveryAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (!assignment.getDeliveryPartnerId().equals(partnerId)) {
            throw new RuntimeException("Assignment not assigned to this partner");
        }

        DeliveryStatus currentStatus = assignment.getStatus();
        
        // Validate status transition
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        assignment.setStatus(newStatus);
        
        // Update timestamps based on status
        switch (newStatus) {
            case PICKED_UP:
                assignment.setPickedUpAt(LocalDateTime.now());
                break;
            case DELIVERED:
                assignment.setDeliveredAt(LocalDateTime.now());
                // Update partner status back to available
                DeliveryPartner partner = partnerRepository.findById(partnerId).orElse(null);
                if (partner != null) {
                    partner.setStatus(DeliveryPartnerStatus.AVAILABLE);
                    partnerRepository.save(partner);
                }
                break;
            case CANCELLED:
                assignment.setCancelledAt(LocalDateTime.now());
                // Update partner status back to available
                DeliveryPartner cancelPartner = partnerRepository.findById(partnerId).orElse(null);
                if (cancelPartner != null) {
                    cancelPartner.setStatus(DeliveryPartnerStatus.AVAILABLE);
                    partnerRepository.save(cancelPartner);
                }
                break;
        }

        DeliveryAssignment savedAssignment = assignmentRepository.save(assignment);

        log.info("Assignment {} status updated to {} by partner {}", assignmentId, newStatus, partnerId);

        return convertToDto(savedAssignment);
    }

    @Transactional
    public void updatePartnerLocation(Long partnerId, LocationUpdateRequest request) {
        // Update partner's current location
        DeliveryPartner partner = partnerRepository.findByUserId(partnerId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        partner.setLatitude(request.getLatitude());
        partner.setLongitude(request.getLongitude());
        partnerRepository.save(partner);

        // Update current location in active assignments
        List<DeliveryAssignment> activeAssignments = assignmentRepository.findActiveDeliveriesByPartnerId(
            partner.getId(), 
            Arrays.asList(DeliveryStatus.ASSIGNED, DeliveryStatus.ACCEPTED, 
                         DeliveryStatus.HEADING_TO_PICKUP, DeliveryStatus.PICKED_UP, 
                         DeliveryStatus.HEADING_TO_DELIVERY)
        );

        for (DeliveryAssignment assignment : activeAssignments) {
            assignment.setCurrentLatitude(request.getLatitude());
            assignment.setCurrentLongitude(request.getLongitude());
            assignmentRepository.save(assignment);
        }

        log.debug("Updated location for partner {} to ({}, {})", partnerId, request.getLatitude(), request.getLongitude());
    }

    @Transactional(readOnly = true)
    public DeliveryAssignmentDto getAssignmentByOrderId(Long orderId) {
        DeliveryAssignment assignment = assignmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Assignment not found for order"));
        return convertToDto(assignment);
    }

    @Transactional(readOnly = true)
    public List<DeliveryAssignmentDto> getPartnerAssignments(Long partnerId) {
        DeliveryPartner partner = partnerRepository.findByUserId(partnerId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        List<DeliveryAssignment> assignments = assignmentRepository.findByDeliveryPartnerIdOrderByAssignedAtDesc(partner.getId());
        return assignments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryAssignmentDto> getActiveAssignments(Long partnerId) {
        DeliveryPartner partner = partnerRepository.findByUserId(partnerId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        List<DeliveryAssignment> activeAssignments = assignmentRepository.findActiveDeliveriesByPartnerId(
            partner.getId(),
            Arrays.asList(DeliveryStatus.ASSIGNED, DeliveryStatus.ACCEPTED, 
                         DeliveryStatus.HEADING_TO_PICKUP, DeliveryStatus.PICKED_UP, 
                         DeliveryStatus.HEADING_TO_DELIVERY)
        );

        return activeAssignments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private DeliveryPartner findBestAvailablePartner(Double pickupLat, Double pickupLng) {
        List<DeliveryPartner> availablePartners = partnerRepository.findByStatus(DeliveryPartnerStatus.AVAILABLE);
        
        if (availablePartners.isEmpty()) {
            return null;
        }

        // Simple implementation: find closest partner
        DeliveryPartner bestPartner = null;
        double minDistance = Double.MAX_VALUE;

        for (DeliveryPartner partner : availablePartners) {
            if (partner.getLatitude() != null && partner.getLongitude() != null) {
                double distance = calculateDistanceInKm(
                    pickupLat, pickupLng, 
                    partner.getLatitude(), partner.getLongitude()
                );
                // Enforce radius cutoff
                if (distance <= maxAssignmentRadiusKm && distance < minDistance) {
                    minDistance = distance;
                    bestPartner = partner;
                }
            }
        }

        // If nearest partner is still beyond cutoff or none eligible, return null
        if (bestPartner == null || minDistance > maxAssignmentRadiusKm) {
            return null;
        }
        return bestPartner;
    }

    private BigDecimal calculateDistance(Double lat1, Double lng1, Double lat2, Double lng2) {
        double distance = calculateDistanceInKm(lat1, lng1, lat2, lng2);
        return BigDecimal.valueOf(distance).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    private double calculateDistanceInKm(Double lat1, Double lng1, Double lat2, Double lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
            return 0.0;
        }

        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c; // Distance in km

        return distance;
    }

    private Integer calculateDuration(BigDecimal distanceKm) {
        // Simple estimation: 30 km/h average speed
        double hours = distanceKm.doubleValue() / 30.0;
        return (int) Math.ceil(hours * 60); // Convert to minutes
    }

    private boolean isValidStatusTransition(DeliveryStatus current, DeliveryStatus next) {
        switch (current) {
            case ASSIGNED:
                return next == DeliveryStatus.ACCEPTED || next == DeliveryStatus.CANCELLED;
            case ACCEPTED:
                return next == DeliveryStatus.HEADING_TO_PICKUP || next == DeliveryStatus.CANCELLED;
            case HEADING_TO_PICKUP:
                return next == DeliveryStatus.ARRIVED_AT_PICKUP || next == DeliveryStatus.CANCELLED;
            case ARRIVED_AT_PICKUP:
                return next == DeliveryStatus.PICKED_UP || next == DeliveryStatus.CANCELLED;
            case PICKED_UP:
                return next == DeliveryStatus.HEADING_TO_DELIVERY || next == DeliveryStatus.CANCELLED;
            case HEADING_TO_DELIVERY:
                return next == DeliveryStatus.ARRIVED_AT_DELIVERY || next == DeliveryStatus.CANCELLED;
            case ARRIVED_AT_DELIVERY:
                return next == DeliveryStatus.DELIVERED || next == DeliveryStatus.FAILED;
            default:
                return false;
        }
    }

    private void sendAssignmentNotification(DeliveryPartner partner, DeliveryAssignment assignment) {
        // This would send email/SMS notification to delivery partner
        // For now, just log
        log.info("Sending assignment notification to partner {} for order {}", 
                partner.getId(), assignment.getOrderId());
    }

    private DeliveryAssignmentDto convertToDto(DeliveryAssignment assignment) {
        DeliveryAssignmentDto dto = new DeliveryAssignmentDto();
        BeanUtils.copyProperties(assignment, dto);
        return dto;
    }
}
