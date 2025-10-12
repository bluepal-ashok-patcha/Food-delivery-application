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
import com.quickbite.deliveryservice.repository.CrossServiceJdbcRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
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

    @Autowired
    private CrossServiceJdbcRepository crossServiceRepository;

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
        if (e.deliveryLatitude == null || e.deliveryLongitude == null || e.deliveryAddress == null || e.customerId == null || e.deliveryFee == null) {
            String orderSql = "SELECT user_id, delivery_address, delivery_latitude, delivery_longitude, restaurant_id, delivery_fee FROM orders WHERE id = ?";
            jdbcTemplate.query(orderSql, ps -> ps.setLong(1, request.getOrderId()), rs -> {
                if (rs.next()) {
                    if (e.customerId == null) e.customerId = rs.getLong("user_id");
                    if (e.deliveryAddress == null) e.deliveryAddress = rs.getString("delivery_address");
                    if (e.deliveryLatitude == null) e.deliveryLatitude = (Double) rs.getObject("delivery_latitude");
                    if (e.deliveryLongitude == null) e.deliveryLongitude = (Double) rs.getObject("delivery_longitude");
                    if (e.restaurantId == null) e.restaurantId = rs.getLong("restaurant_id");
                    if (e.deliveryFee == null) {
                        Double orderDeliveryFee = (Double) rs.getObject("delivery_fee");
                        if (orderDeliveryFee != null) {
                            e.deliveryFee = BigDecimal.valueOf(orderDeliveryFee);
                        }
                    }
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
            // Try to get delivery fee from restaurant if not available from order
            if (e.restaurantId != null) {
                try {
                    Map<String, Object> restaurantDetails = crossServiceRepository.getRestaurantDetails(e.restaurantId);
                    if (restaurantDetails != null && restaurantDetails.get("delivery_fee") != null) {
                        e.deliveryFee = BigDecimal.valueOf(((Number) restaurantDetails.get("delivery_fee")).doubleValue());
                    } else {
                        e.deliveryFee = BigDecimal.valueOf(2.99); // Fallback to default
                    }
                } catch (Exception ex) {
                    log.warn("Failed to fetch restaurant delivery fee for restaurant {}: {}", e.restaurantId, ex.getMessage());
                    e.deliveryFee = BigDecimal.valueOf(2.99); // Fallback to default
                }
            } else {
                e.deliveryFee = BigDecimal.valueOf(2.99); // Fallback to default
            }
        }
        return e;
    }

    @Transactional
    public DeliveryAssignmentDto acceptAssignment(Long assignmentId, Long partnerUserId) {
        DeliveryAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // Resolve partner by user id from JWT
        DeliveryPartner partner = partnerRepository.findByUserId(partnerUserId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        if (!assignment.getDeliveryPartnerId().equals(partner.getId())) {
            throw new RuntimeException("Assignment not assigned to this partner");
        }

        if (assignment.getStatus() != DeliveryStatus.ASSIGNED) {
            throw new RuntimeException("Assignment cannot be accepted in current status");
        }

        assignment.setStatus(DeliveryStatus.ACCEPTED);
        assignment.setAcceptedAt(LocalDateTime.now());
        DeliveryAssignment savedAssignment = assignmentRepository.save(assignment);

        log.info("Assignment {} accepted by partner {}", assignmentId, partner.getId());

        return convertToDto(savedAssignment);
    }

    @Transactional
    public DeliveryAssignmentDto updateDeliveryStatus(Long assignmentId, DeliveryStatus newStatus, Long partnerUserId) {
        DeliveryAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // Resolve delivery partner id from JWT user id
        DeliveryPartner requestingPartner = partnerRepository.findByUserId(partnerUserId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        if (!assignment.getDeliveryPartnerId().equals(requestingPartner.getId())) {
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
                requestingPartner.setStatus(DeliveryPartnerStatus.AVAILABLE);
                partnerRepository.save(requestingPartner);
                break;
            case CANCELLED:
                assignment.setCancelledAt(LocalDateTime.now());
                // Update partner status back to available
                requestingPartner.setStatus(DeliveryPartnerStatus.AVAILABLE);
                partnerRepository.save(requestingPartner);
                break;
        }

        DeliveryAssignment savedAssignment = assignmentRepository.save(assignment);

        log.info("Assignment {} status updated to {} by partner {}", assignmentId, newStatus, requestingPartner.getId());

        return convertToDto(savedAssignment);
    }

    @Transactional
    public void updatePartnerLocation(Long partnerId, LocationUpdateRequest request) {
        // Validate coordinates
        if (request.getLatitude() == null || request.getLongitude() == null) {
            log.warn("Invalid location update request from partner {}: null coordinates", partnerId);
            throw new RuntimeException("Latitude and longitude are required");
        }
        
        if (request.getLatitude() < -90 || request.getLatitude() > 90 || 
            request.getLongitude() < -180 || request.getLongitude() > 180) {
            log.warn("Invalid location coordinates from partner {}: ({}, {})", 
                    partnerId, request.getLatitude(), request.getLongitude());
            throw new RuntimeException("Invalid coordinate values");
        }
        
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

        log.info("Updated location for partner {} to ({}, {}) - {} active assignments updated", 
                partnerId, request.getLatitude(), request.getLongitude(), activeAssignments.size());
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

    @Transactional(readOnly = true)
    public List<com.quickbite.deliveryservice.dto.AvailableOrderDto> listAvailableOrders(Long partnerUserId) {
        // Orders that are READY_FOR_PICKUP, payment COMPLETED, and no delivery_assignment
        String sql = "SELECT o.id AS order_id, o.user_id AS customer_id, o.restaurant_id AS restaurant_id, o.delivery_address, o.delivery_latitude, o.delivery_longitude, o.total_amount, o.delivery_fee, r.name AS restaurant_name, r.address AS restaurant_address, r.latitude AS pickup_latitude, r.longitude AS pickup_longitude " +
                "FROM orders o " +
                "JOIN restaurants r ON r.id = o.restaurant_id " +
                "LEFT JOIN delivery_assignments da ON da.order_id = o.id " +
                "WHERE o.payment_status = 'COMPLETED' AND o.order_status = 'READY_FOR_PICKUP' AND da.id IS NULL " +
                "ORDER BY o.created_at DESC LIMIT 50";

        return jdbcTemplate.query(sql, (rs, rowNum) -> com.quickbite.deliveryservice.dto.AvailableOrderDto.builder()
                .orderId(rs.getLong("order_id"))
                .customerId(rs.getLong("customer_id"))
                .restaurantId(rs.getLong("restaurant_id"))
                .restaurantName(rs.getString("restaurant_name"))
                .restaurantAddress(rs.getString("restaurant_address"))
                .deliveryAddress(rs.getString("delivery_address"))
                .pickupLatitude(getDoubleOrNull(rs, "pickup_latitude"))
                .pickupLongitude(getDoubleOrNull(rs, "pickup_longitude"))
                .deliveryLatitude(getDoubleOrNull(rs, "delivery_latitude"))
                .deliveryLongitude(getDoubleOrNull(rs, "delivery_longitude"))
                .totalAmount(getDoubleOrNull(rs, "total_amount"))
                .deliveryFee(getDoubleOrNull(rs, "delivery_fee"))
                .build());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOrderItems(Long orderId) {
        log.info("Fetching order items for order ID: {}", orderId);
        String sql = "SELECT menu_item_id, name, price, quantity, special_instructions FROM order_items WHERE order_id = ?";
        List<Map<String, Object>> items = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("menuItemId", rs.getLong("menu_item_id"));
            item.put("name", rs.getString("name"));
            item.put("price", rs.getDouble("price"));
            item.put("quantity", rs.getInt("quantity"));
            item.put("specialInstructions", rs.getString("special_instructions"));
            return item;
        }, orderId);
        log.info("Found {} items for order {}: {}", items.size(), orderId, items);
        return items;
    }

    private Double getDoubleOrNull(java.sql.ResultSet rs, String col) throws java.sql.SQLException {
        double val = rs.getDouble(col);
        return rs.wasNull() ? null : val;
    }

    @Transactional
    public DeliveryAssignmentDto claimOrder(Long orderId, Long partnerUserId) {
        // Prevent duplicate assignment
        if (assignmentRepository.findByOrderId(orderId).isPresent()) {
            throw new IllegalArgumentException("Order is already assigned to a delivery partner");
        }

        // Enrich order and restaurant data
        DeliveryAssignmentRequest req = DeliveryAssignmentRequest.builder().orderId(orderId).build();
        EnrichedData enriched = enrichFromBackend(req);

        // Resolve calling delivery partner by userId
        DeliveryPartner partner = partnerRepository.findByUserId(partnerUserId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        // Create assignment bound to the requesting partner, immediately accepted
        BigDecimal estimatedDistance = calculateDistance(
            enriched.pickupLatitude, enriched.pickupLongitude,
            enriched.deliveryLatitude, enriched.deliveryLongitude
        );
        Integer estimatedDuration = calculateDuration(estimatedDistance);

        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .orderId(orderId)
                .deliveryPartnerId(partner.getId())
                .restaurantId(enriched.restaurantId)
                .customerId(enriched.customerId)
                .status(DeliveryStatus.ACCEPTED)
                .pickupAddress(enriched.pickupAddress)
                .deliveryAddress(enriched.deliveryAddress)
                .pickupLatitude(enriched.pickupLatitude)
                .pickupLongitude(enriched.pickupLongitude)
                .deliveryLatitude(enriched.deliveryLatitude)
                .deliveryLongitude(enriched.deliveryLongitude)
                .estimatedDistance(estimatedDistance)
                .estimatedDuration(estimatedDuration)
                .deliveryFee(enriched.deliveryFee)
                .acceptedAt(java.time.LocalDateTime.now())
                .build();

        DeliveryAssignment saved = assignmentRepository.save(assignment);

        // Update partner status
        partner.setStatus(DeliveryPartnerStatus.ON_DELIVERY);
        partnerRepository.save(partner);

        return convertToDto(saved);
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
        
        // Fetch customer name
        try {
            Map<String, Object> userDetails = crossServiceRepository.getUserDetails(assignment.getCustomerId());
            log.info("User details for customer {}: {}", assignment.getCustomerId(), userDetails);
            if (userDetails != null && userDetails.get("name") != null) {
                dto.setCustomerName((String) userDetails.get("name"));
                log.info("Set customer name to: {}", dto.getCustomerName());
            }
        } catch (Exception e) {
            log.warn("Failed to fetch customer name for user {}: {}", assignment.getCustomerId(), e.getMessage());
        }
        
        // Fetch restaurant name
        try {
            Map<String, Object> restaurantDetails = crossServiceRepository.getRestaurantDetails(assignment.getRestaurantId());
            log.info("Restaurant details for restaurant {}: {}", assignment.getRestaurantId(), restaurantDetails);
            if (restaurantDetails != null && restaurantDetails.get("name") != null) {
                dto.setRestaurantName((String) restaurantDetails.get("name"));
                log.info("Set restaurant name to: {}", dto.getRestaurantName());
            }
        } catch (Exception e) {
            log.warn("Failed to fetch restaurant name for restaurant {}: {}", assignment.getRestaurantId(), e.getMessage());
        }
        
        return dto;
    }
}
