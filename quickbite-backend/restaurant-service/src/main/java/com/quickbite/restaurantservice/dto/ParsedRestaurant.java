package com.quickbite.restaurantservice.dto;

import lombok.Data;

@Data
public class ParsedRestaurant {
    private RestaurantDto restaurantDto;
    private int rowNumber;
    // getters/setters/constructors
}