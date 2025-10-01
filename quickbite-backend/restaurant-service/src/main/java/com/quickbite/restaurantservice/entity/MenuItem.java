package com.quickbite.restaurantservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "menu_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean inStock = true;

    // Frontend metadata alignment
    private Double originalPrice;
    private Boolean isVeg;
    private Boolean isPopular;
    private Integer preparationTime; // minutes

    @Column(length = 2000)
    private String customizationJson; // JSON array of customization options

    @Column(length = 1000)
    private String nutritionJson; // JSON object with calories, protein, carbs, fat
}