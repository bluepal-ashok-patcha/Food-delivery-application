package com.quickbite.entity;



import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "restaurant_owners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantOwner extends User {

    private Long restaurantId;
}

