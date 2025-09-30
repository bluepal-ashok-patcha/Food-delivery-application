package com.quickbite.orderservice.repository;

import com.quickbite.orderservice.entity.Order;
import com.quickbite.orderservice.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByRestaurantId(Long restaurantId);
    List<Order> findByDeliveryPartnerId(Long deliveryPartnerId);
    List<Order> findByRestaurantIdAndOrderStatus(Long restaurantId, OrderStatus status);
}