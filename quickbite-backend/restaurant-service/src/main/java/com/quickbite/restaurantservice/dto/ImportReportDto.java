package com.quickbite.restaurantservice.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class ImportReportDto {
    private int total;
    private List<ImportSuccess> successes = new ArrayList<>();
    private List<ImportFailure> failures = new ArrayList<>();

    public void addSuccess(int rowNumber, RestaurantDto created) {
        successes.add(new ImportSuccess(rowNumber, created));
    }
    public void addFailure(int rowNumber, String reason) {
        failures.add(new ImportFailure(rowNumber, reason));
    }
}
