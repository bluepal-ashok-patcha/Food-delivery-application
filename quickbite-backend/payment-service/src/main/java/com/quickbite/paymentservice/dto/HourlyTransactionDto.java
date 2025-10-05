package com.quickbite.paymentservice.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HourlyTransactionDto {
    private Integer hour;
    private Long transactionCount;
    private BigDecimal totalAmount;
}
