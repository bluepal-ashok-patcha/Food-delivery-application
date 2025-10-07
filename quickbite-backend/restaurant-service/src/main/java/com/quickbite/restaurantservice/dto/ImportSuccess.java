package com.quickbite.restaurantservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImportSuccess {
    private int rowNumber;
    private RestaurantDto restaurant;
}