package com.quickbite.orderservice.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantOrderCountDto {
    private Long restaurantId;
    private String restaurantName;
    private Long orderCount;
    private BigDecimal revenue;
}
