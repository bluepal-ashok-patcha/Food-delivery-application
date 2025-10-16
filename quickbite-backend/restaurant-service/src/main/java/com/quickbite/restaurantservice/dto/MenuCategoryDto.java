package com.quickbite.restaurantservice.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.io.Serializable;

import java.util.List;

@Data
public class MenuCategoryDto implements Serializable {

    private Long id;

    @NotEmpty(message = "Category name cannot be empty")
    private String name;

    private List<MenuItemDto> menuItems;
}