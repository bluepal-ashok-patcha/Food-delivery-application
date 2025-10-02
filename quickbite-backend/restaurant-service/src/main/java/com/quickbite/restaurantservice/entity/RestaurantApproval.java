package com.quickbite.restaurantservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "restaurant_approvals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long restaurantId;

    @Column(nullable = false)
    private Long adminUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RestaurantStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RestaurantStatus newStatus;

    @Column(length = 500)
    private String approvalNotes;

    @Column(length = 500)
    private String rejectionReason;

    @Column(length = 1000)
    private String adminComments;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
