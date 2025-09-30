package com.quickbite.entity;


import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "delivery_partners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartner extends User {

    private String vehicleType;
    private String vehicleNumber;
    private Boolean isOnline;
    private Boolean isAvailable;

    @Embedded
    private Location currentLocation;
}

