package com.quickbite.restaurantservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "restaurant_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long restaurantId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private int rating; // 1-5

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
