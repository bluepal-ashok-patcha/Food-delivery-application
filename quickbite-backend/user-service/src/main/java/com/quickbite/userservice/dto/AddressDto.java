package com.quickbite.userservice.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class AddressDto {

    private Long id;

    @NotEmpty(message = "Street cannot be empty")
    private String street;

    @NotEmpty(message = "City cannot be empty")
    private String city;

    @NotEmpty(message = "State cannot be empty")
    private String state;

    @NotEmpty(message = "Zip code cannot be empty")
    private String zipCode;

    @NotEmpty(message = "Address type cannot be empty")
    private String type; // e.g., "Home", "Work"
}