package com.quickbite.userservice.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class UserProfileDto {

    private Long id;
    private Long userId;

    @NotEmpty(message = "First name cannot be empty")
    private String firstName;

    @NotEmpty(message = "Last name cannot be empty")
    private String lastName;

    private String phoneNumber;

    private List<AddressDto> addresses;
}