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
public class PaymentDailyRevenueDto {
    private String date;
    private BigDecimal revenue;
    private Long transactionCount;
}
