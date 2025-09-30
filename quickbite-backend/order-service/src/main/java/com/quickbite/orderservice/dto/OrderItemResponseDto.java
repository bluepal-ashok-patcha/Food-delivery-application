package com.quickbite.orderservice.dto;

import lombok.Data;

@Data
public class OrderItemResponseDto {
    private Long menuItemId;
    private String name;
    private Integer quantity;
    private Double price;
}