package com.quickbite.restaurantservice.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusDistributionDto {
    private String status;
    private Long count;
    private Double percentage;
}
