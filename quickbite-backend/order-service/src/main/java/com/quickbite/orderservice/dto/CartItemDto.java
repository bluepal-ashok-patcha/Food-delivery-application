package com.quickbite.orderservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {

    @NotNull(message = "Menu item ID is required")
    private Long menuItemId;

    // These fields are optional - will be fetched automatically from database
    private String menuItemName;
    private Double price;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    private String customization; // JSON string for customization options
    private String specialInstructions;
}
