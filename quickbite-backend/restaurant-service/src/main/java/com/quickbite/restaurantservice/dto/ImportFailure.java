package com.quickbite.restaurantservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImportFailure {
    private int rowNumber;
    private String reason;
}
