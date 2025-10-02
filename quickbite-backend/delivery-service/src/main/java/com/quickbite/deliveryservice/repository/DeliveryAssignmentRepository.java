package com.quickbite.deliveryservice.repository;

import com.quickbite.deliveryservice.entity.DeliveryAssignment;
import com.quickbite.deliveryservice.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    
    Optional<DeliveryAssignment> findByOrderId(Long orderId);
    
    List<DeliveryAssignment> findByDeliveryPartnerIdOrderByAssignedAtDesc(Long deliveryPartnerId);
    
    List<DeliveryAssignment> findByDeliveryPartnerIdAndStatusOrderByAssignedAtDesc(Long deliveryPartnerId, DeliveryStatus status);
    
    List<DeliveryAssignment> findByCustomerIdOrderByAssignedAtDesc(Long customerId);
    
    List<DeliveryAssignment> findByRestaurantIdOrderByAssignedAtDesc(Long restaurantId);
    
    List<DeliveryAssignment> findByStatusOrderByAssignedAtDesc(DeliveryStatus status);
    
    @Query("SELECT da FROM DeliveryAssignment da WHERE da.deliveryPartnerId = :partnerId AND da.status IN :statuses")
    List<DeliveryAssignment> findActiveDeliveriesByPartnerId(@Param("partnerId") Long partnerId, 
                                                           @Param("statuses") List<DeliveryStatus> statuses);
    
    @Query("SELECT COUNT(da) FROM DeliveryAssignment da WHERE da.deliveryPartnerId = :partnerId AND da.status = 'DELIVERED' AND da.deliveredAt >= :fromDate")
    Long countCompletedDeliveriesByPartnerSince(@Param("partnerId") Long partnerId, @Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT da FROM DeliveryAssignment da WHERE da.status IN :statuses AND da.assignedAt < :cutoffTime")
    List<DeliveryAssignment> findStaleAssignments(@Param("statuses") List<DeliveryStatus> statuses, 
                                                 @Param("cutoffTime") LocalDateTime cutoffTime);
}
