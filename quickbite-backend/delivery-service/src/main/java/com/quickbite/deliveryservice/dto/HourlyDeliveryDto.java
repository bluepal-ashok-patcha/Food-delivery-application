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
public class HourlyDeliveryDto {
    private Integer hour;
    private Long deliveryCount;
    private BigDecimal earnings;
}
