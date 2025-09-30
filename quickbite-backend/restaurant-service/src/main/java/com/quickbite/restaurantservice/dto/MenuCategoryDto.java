package com.quickbite.restaurantservice.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class MenuCategoryDto {

    private Long id;

    @NotEmpty(message = "Category name cannot be empty")
    private String name;

    private List<MenuItemDto> menuItems;
}