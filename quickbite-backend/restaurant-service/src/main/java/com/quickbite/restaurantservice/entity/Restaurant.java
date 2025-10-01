package com.quickbite.restaurantservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "restaurants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String contactNumber;

    @Column(nullable = false)
    private String cuisineType;

    // --- Frontend metadata alignment ---
    @Column(length = 1000)
    private String description;

    private String image;
    private String coverImage;

    private Double rating; // average rating
    private Integer totalRatings;

    private String deliveryTime; // e.g., "25-30 mins"
    private Double deliveryFee;
    private Double minimumOrder;

    private Boolean isOpen;
    private Boolean isActive;
    private Boolean isVeg;
    private Boolean isPureVeg;

    private String openingHours; // e.g., "10:00 AM - 11:00 PM"
    private Integer deliveryRadiusKm;

    private Double latitude;
    private Double longitude;

    @Column(length = 500)
    private String tags; // comma-separated tags: Popular,Fast Delivery,Best Seller

    private LocalTime openingTime;
    private LocalTime closingTime;

    @Column(nullable = false)
    private Long ownerId; // Corresponds to the User ID from auth-service

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RestaurantStatus status; // PENDING_APPROVAL, APPROVED, REJECTED, ACTIVE, INACTIVE

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "restaurant_id")
    private List<MenuCategory> menuCategories;
}