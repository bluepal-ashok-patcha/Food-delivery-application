package com.quickbite.restaurantservice.entity;

public enum RestaurantStatus {
    PENDING_APPROVAL,
    APPROVED,
    REJECTED,
    ACTIVE,  // Open for business
    INACTIVE // Temporarily closed
}