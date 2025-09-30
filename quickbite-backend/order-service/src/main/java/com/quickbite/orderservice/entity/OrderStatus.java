package com.quickbite.orderservice.entity;

public enum OrderStatus {
    PENDING,        // Order placed, awaiting restaurant confirmation
    ACCEPTED,       // Restaurant has accepted the order
    PREPARING,      // Order is being prepared
    READY_FOR_PICKUP, // Order is ready for the delivery partner
    OUT_FOR_DELIVERY, // Delivery partner is on the way
    DELIVERED,      // Order has been delivered
    CANCELLED,      // Order was cancelled
    REJECTED        // Restaurant rejected the order
}