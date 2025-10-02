package com.quickbite.paymentservice.repository;

import com.quickbite.paymentservice.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    
    List<CouponUsage> findByCouponId(Long couponId);
    
    List<CouponUsage> findByUserId(Long userId);
    
    List<CouponUsage> findByCouponIdAndUserId(Long couponId, Long userId);
    
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.couponId = :couponId AND cu.userId = :userId")
    Long countByCouponIdAndUserId(@Param("couponId") Long couponId, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.couponId = :couponId")
    Long countByCouponId(@Param("couponId") Long couponId);
}
