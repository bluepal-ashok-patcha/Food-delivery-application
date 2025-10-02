package com.quickbite.restaurantservice.service;

import com.quickbite.restaurantservice.dto.RestaurantDto;
import com.quickbite.restaurantservice.entity.Restaurant;
import com.quickbite.restaurantservice.entity.RestaurantApproval;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import com.quickbite.restaurantservice.repository.RestaurantRepository;
import com.quickbite.restaurantservice.repository.RestaurantApprovalRepository;
import com.quickbite.restaurantservice.repository.CrossServiceJdbcRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Slf4j
public class RestaurantApprovalService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private RestaurantApprovalRepository approvalRepository;

    @Autowired
    private CrossServiceJdbcRepository crossServiceRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public RestaurantDto approveRestaurant(Long restaurantId, Long adminUserId, String approvalNotes) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        RestaurantStatus previousStatus = restaurant.getStatus();
        restaurant.setStatus(RestaurantStatus.APPROVED);
        restaurant.setIsActive(true);
        
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);

        // Save approval record
        RestaurantApproval approval = RestaurantApproval.builder()
                .restaurantId(restaurantId)
                .adminUserId(adminUserId)
                .previousStatus(previousStatus)
                .newStatus(RestaurantStatus.APPROVED)
                .approvalNotes(approvalNotes)
                .build();
        approvalRepository.save(approval);

        // Send approval email
        sendApprovalNotification(restaurant, "APPROVED", null);

        log.info("Restaurant {} approved by admin {}", restaurantId, adminUserId);

        RestaurantDto dto = new RestaurantDto();
        BeanUtils.copyProperties(savedRestaurant, dto);
        return dto;
    }

    @Transactional
    public RestaurantDto rejectRestaurant(Long restaurantId, Long adminUserId, String rejectionReason) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        RestaurantStatus previousStatus = restaurant.getStatus();
        restaurant.setStatus(RestaurantStatus.REJECTED);
        restaurant.setIsActive(false);
        
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);

        // Save approval record
        RestaurantApproval approval = RestaurantApproval.builder()
                .restaurantId(restaurantId)
                .adminUserId(adminUserId)
                .previousStatus(previousStatus)
                .newStatus(RestaurantStatus.REJECTED)
                .rejectionReason(rejectionReason)
                .build();
        approvalRepository.save(approval);

        // Send rejection email
        sendApprovalNotification(restaurant, "REJECTED", rejectionReason);

        log.info("Restaurant {} rejected by admin {} with reason: {}", restaurantId, adminUserId, rejectionReason);

        RestaurantDto dto = new RestaurantDto();
        BeanUtils.copyProperties(savedRestaurant, dto);
        return dto;
    }

    @Transactional
    public RestaurantDto updateRestaurantStatus(Long restaurantId, RestaurantStatus newStatus, Long adminUserId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        RestaurantStatus previousStatus = restaurant.getStatus();
        restaurant.setStatus(newStatus);
        
        // Update active status based on new status
        restaurant.setIsActive(newStatus == RestaurantStatus.APPROVED || newStatus == RestaurantStatus.ACTIVE);
        
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);

        // Save approval record
        RestaurantApproval approval = RestaurantApproval.builder()
                .restaurantId(restaurantId)
                .adminUserId(adminUserId)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .build();
        approvalRepository.save(approval);

        // Send notification email
        sendApprovalNotification(restaurant, newStatus.toString(), null);

        log.info("Restaurant {} status updated to {} by admin {}", restaurantId, newStatus, adminUserId);

        RestaurantDto dto = new RestaurantDto();
        BeanUtils.copyProperties(savedRestaurant, dto);
        return dto;
    }

    private void sendApprovalNotification(Restaurant restaurant, String status, String rejectionReason) {
        try {
            // Get owner details from auth service
            Map<String, Object> ownerData = crossServiceRepository.findAuthUserById(restaurant.getOwnerId());
            if (ownerData != null) {
                String ownerEmail = (String) ownerData.get("email");
                String ownerName = (String) ownerData.get("name");
                
                if (ownerEmail != null && ownerName != null) {
                    emailService.sendRestaurantApprovalEmail(
                        ownerEmail, 
                        ownerName, 
                        restaurant.getName(), 
                        status, 
                        rejectionReason
                    );
                } else {
                    log.warn("Owner email or name is null for restaurant {}", restaurant.getId());
                }
            } else {
                log.warn("Owner data not found for restaurant {} with ownerId {}", restaurant.getId(), restaurant.getOwnerId());
            }
        } catch (Exception e) {
            log.error("Failed to send approval notification for restaurant {}", restaurant.getId(), e);
        }
    }
}
