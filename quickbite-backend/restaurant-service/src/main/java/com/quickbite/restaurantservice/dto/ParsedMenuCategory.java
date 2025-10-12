package com.quickbite.restaurantservice.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class ParsedMenuCategory {
    private String name;
    private List<ParsedMenuItem> menuItems = new ArrayList<>();
}
