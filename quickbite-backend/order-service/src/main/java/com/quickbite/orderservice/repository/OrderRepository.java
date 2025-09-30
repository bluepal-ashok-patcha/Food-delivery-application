package com.quickbite.orderservice.repository;

import com.quickbite.orderservice.entity.Order;
import com.quickbite.orderservice.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByRestaurantId(Long restaurantId);
    List<Order> findByDeliveryPartnerId(Long deliveryPartnerId);
    List<Order> findByRestaurantIdAndOrderStatus(Long restaurantId, OrderStatus status);

    Page<Order> findByUserId(Long userId, Pageable pageable);
    Page<Order> findByUserIdAndOrderStatus(Long userId, OrderStatus status, Pageable pageable);
    Page<Order> findByRestaurantId(Long restaurantId, Pageable pageable);
    Page<Order> findByRestaurantIdAndOrderStatus(Long restaurantId, OrderStatus status, Pageable pageable);
}