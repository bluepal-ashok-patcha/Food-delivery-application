package com.quickbite.restaurantservice.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopularItemDto {
    private Long itemId;
    private String itemName;
    private Long orderCount;
    private BigDecimal revenue;
    private Double percentage;
}
