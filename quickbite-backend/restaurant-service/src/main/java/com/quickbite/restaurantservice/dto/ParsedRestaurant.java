package com.quickbite.restaurantservice.dto;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class ParsedRestaurant {
    private String name;
    private String cuisineType;
    private String address;
    private String contactNumber;
    private String description;
    private String image;
    private String coverImage;
    private Double rating;
    private Integer totalRatings;
    private String deliveryTime;
    private Double deliveryFee;
    private Double minimumOrder;
    private Boolean isOpen;
    private Boolean isActive;
    private Boolean isVeg;
    private Boolean isPureVeg;
    private String openingHours;
    private Integer deliveryRadiusKm;
    private Double latitude;
    private Double longitude;
    private String tags;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Long ownerId;
    private String status;

    private List<ParsedMenuCategory> menuCategories = new ArrayList<>();
}
