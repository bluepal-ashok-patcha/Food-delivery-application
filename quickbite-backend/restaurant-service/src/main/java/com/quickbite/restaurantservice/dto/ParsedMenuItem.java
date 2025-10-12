package com.quickbite.restaurantservice.dto;

import lombok.Data;

@Data
public class ParsedMenuItem {
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private Boolean inStock;
    private Double originalPrice;
    private Boolean isVeg;
    private Boolean isPopular;
    private Integer preparationTime;
    private String customizationJson;
    private String nutritionJson;
}

