package com.quickbite.deliveryservice.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneDeliveryDto {
    private String zone;
    private Long deliveryCount;
    private BigDecimal earnings;
    private Double averageDeliveryTime;
}
