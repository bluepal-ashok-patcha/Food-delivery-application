package com.quickbite.restaurantservice.dto;

import com.quickbite.restaurantservice.entity.RestaurantStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.io.Serializable;

import java.time.LocalTime;
import java.util.List;

@Data
public class RestaurantDto implements Serializable {

    private Long id;

    @NotEmpty(message = "Restaurant name cannot be empty")
    private String name;

    @NotEmpty(message = "Address cannot be empty")
    private String address;

    @NotEmpty(message = "Contact number cannot be empty")
    private String contactNumber;

    @NotEmpty(message = "Cuisine type cannot be empty")
    private String cuisineType;

    private LocalTime openingTime;
    private LocalTime closingTime;

    // Frontend metadata fields
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

    // ownerId will be injected from JWT for RESTAURANT_OWNER in controller
    private Long ownerId;

    private RestaurantStatus status;

    private List<MenuCategoryDto> menuCategories;
}