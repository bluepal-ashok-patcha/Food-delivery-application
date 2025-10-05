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
public class PartnerPerformanceDto {
    private Long partnerId;
    private String partnerName;
    private Long deliveryCount;
    private BigDecimal earnings;
    private Double averageRating;
    private Double onTimeRate;
}
