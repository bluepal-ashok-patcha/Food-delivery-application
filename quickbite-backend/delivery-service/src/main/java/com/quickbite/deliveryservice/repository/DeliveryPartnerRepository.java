package com.quickbite.deliveryservice.repository;

import com.quickbite.deliveryservice.entity.DeliveryPartner;
import com.quickbite.deliveryservice.entity.DeliveryPartnerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    Optional<DeliveryPartner> findByUserId(Long userId);
    List<DeliveryPartner> findByStatus(DeliveryPartnerStatus status);
}