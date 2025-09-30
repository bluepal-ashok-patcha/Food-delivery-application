package com.quickbite.deliveryservice.dto;

import com.quickbite.deliveryservice.entity.DeliveryPartnerStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryPartnerDto {

    private Long id;

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotEmpty(message = "Name cannot be empty")
    private String name;

    @NotEmpty(message = "Phone number cannot be empty")
    private String phoneNumber;

    private String vehicleDetails;

    @NotNull(message = "Status cannot be null")
    private DeliveryPartnerStatus status;

    private Double latitude;
    private Double longitude;
}