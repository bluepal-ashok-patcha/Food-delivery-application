package com.quickbite.restaurantservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MenuItemDto {

    private Long id;

    @NotEmpty(message = "Menu item name cannot be empty")
    private String name;

    private String description;

    @NotNull(message = "Price cannot be null")
    @Min(value = 0, message = "Price must be non-negative")
    private Double price;

    private String imageUrl;

    private boolean inStock = true;
}