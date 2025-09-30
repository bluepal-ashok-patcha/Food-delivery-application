package com.quickbite.restaurantservice.dto;

import com.quickbite.restaurantservice.entity.RestaurantStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;

@Data
public class RestaurantDto {

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

    @NotNull(message = "Owner ID cannot be null")
    private Long ownerId;

    private RestaurantStatus status;

    private List<MenuCategoryDto> menuCategories;
}