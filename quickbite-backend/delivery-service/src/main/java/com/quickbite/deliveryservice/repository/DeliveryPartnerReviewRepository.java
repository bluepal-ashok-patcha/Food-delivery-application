package com.quickbite.deliveryservice.repository;

import com.quickbite.deliveryservice.entity.DeliveryPartnerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerReviewRepository extends JpaRepository<DeliveryPartnerReview, Long> {
    List<DeliveryPartnerReview> findByPartnerUserId(Long partnerUserId);
    Optional<DeliveryPartnerReview> findByPartnerUserIdAndUserIdAndOrderId(Long partnerUserId, Long userId, Long orderId);
}


