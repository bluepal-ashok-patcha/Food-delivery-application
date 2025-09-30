package com.quickbite.deliveryservice.entity;

public enum DeliveryPartnerStatus {
    AVAILABLE,      // Online and waiting for orders
    ON_DELIVERY,    // Currently delivering an order
    OFFLINE         // Not available for deliveries
}