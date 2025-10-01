package com.quickbite.deliveryservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "delivery_partner_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartnerReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // customer id

    @Column(nullable = false)
    private Long partnerUserId; // delivery partner userId

    @Column(nullable = false)
    private int rating;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}


