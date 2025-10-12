package com.quickbite.restaurantservice.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportReportDto {
    private int total;
    private int success;
    private int failed;
    private List<String> errors;
}
