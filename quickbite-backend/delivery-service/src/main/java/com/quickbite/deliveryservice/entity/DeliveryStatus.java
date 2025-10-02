package com.quickbite.deliveryservice.entity;

public enum DeliveryStatus {
    ASSIGNED,           // Order assigned to delivery partner
    ACCEPTED,           // Partner accepted the delivery
    HEADING_TO_PICKUP,  // Partner is going to restaurant
    ARRIVED_AT_PICKUP,  // Partner arrived at restaurant
    PICKED_UP,          // Order picked up from restaurant
    HEADING_TO_DELIVERY, // Partner is going to customer
    ARRIVED_AT_DELIVERY, // Partner arrived at delivery location
    DELIVERED,          // Order delivered successfully
    CANCELLED,          // Delivery cancelled
    FAILED              // Delivery failed
}
