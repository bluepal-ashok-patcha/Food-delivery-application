package com.quickbite.orderservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {

    private Long id;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;

    private List<CartItemDto> items;

    @NotNull(message = "Subtotal is required")
    @Positive(message = "Subtotal must be positive")
    private Double subtotal;

    @NotNull(message = "Delivery fee is required")
    private Double deliveryFee;

    @NotNull(message = "Tax is required")
    private Double tax;

    @NotNull(message = "Total is required")
    @Positive(message = "Total must be positive")
    private Double total;

    private String appliedCouponCode;
    private String appliedCouponType;
    private Double discountAmount;
}
