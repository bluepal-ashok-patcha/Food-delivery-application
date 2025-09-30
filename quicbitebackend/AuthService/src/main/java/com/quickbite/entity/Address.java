package com.quickbite.entity;



import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String address;
    private Double latitude;
    private Double longitude;
    private Boolean isDefault;
    private String landmark;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

