package com.quickbite.paymentservice.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionStatusDto {
    private String status;
    private Long count;
    private Double percentage;
}
