package com.quickbite.paymentservice.repository;

import com.quickbite.paymentservice.entity.Coupon;
import com.quickbite.paymentservice.entity.CouponType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    Optional<Coupon> findByCodeAndIsActiveTrue(String code);
    
    List<Coupon> findByIsActiveTrueAndValidFromBeforeAndValidUntilAfter(LocalDateTime now1, LocalDateTime now2);
    
    List<Coupon> findByRestaurantIdAndIsActiveTrueAndValidFromBeforeAndValidUntilAfter(
        Long restaurantId, LocalDateTime now1, LocalDateTime now2);
    
    List<Coupon> findByUserIdAndIsActiveTrueAndValidFromBeforeAndValidUntilAfter(
        Long userId, LocalDateTime now1, LocalDateTime now2);
    
    Page<Coupon> findByIsActiveTrue(Pageable pageable);
    
    Page<Coupon> findByRestaurantIdAndIsActiveTrue(Long restaurantId, Pageable pageable);
    
    List<Coupon> findByType(CouponType type);
    
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.validFrom <= :now AND c.validUntil >= :now " +
           "AND (c.restaurantId IS NULL OR c.restaurantId = :restaurantId) " +
           "AND (c.userId IS NULL OR c.userId = :userId) " +
           "AND c.currentUsageCount < c.totalUsageLimit")
    List<Coupon> findApplicableCoupons(@Param("restaurantId") Long restaurantId, 
                                      @Param("userId") Long userId, 
                                      @Param("now") LocalDateTime now);
}
