package com.quickbite.paymentservice.repository;

import com.quickbite.paymentservice.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByOrderId(Long orderId);
    List<PaymentTransaction> findByStatus(String status);
    List<PaymentTransaction> findByRestaurantId(Long restaurantId);
    Optional<PaymentTransaction> findByRazorpayOrderId(String razorpayOrderId);
}


