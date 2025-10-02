package com.quickbite.restaurantservice.repository;

import com.quickbite.restaurantservice.entity.RestaurantApproval;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantApprovalRepository extends JpaRepository<RestaurantApproval, Long> {
    
    List<RestaurantApproval> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    
    List<RestaurantApproval> findByAdminUserIdOrderByCreatedAtDesc(Long adminUserId);
    
    List<RestaurantApproval> findByNewStatusOrderByCreatedAtDesc(RestaurantStatus status);
}
