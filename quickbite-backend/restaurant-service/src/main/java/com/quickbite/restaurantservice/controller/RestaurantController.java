package com.quickbite.restaurantservice.controller;

import com.quickbite.restaurantservice.dto.MenuCategoryDto;
import com.quickbite.restaurantservice.dto.MenuItemDto;
import com.quickbite.restaurantservice.dto.RestaurantDto;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import com.quickbite.restaurantservice.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    // --- Public Endpoints ---

    @GetMapping
    public ResponseEntity<List<RestaurantDto>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantDto> getRestaurantById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    // --- Restaurant Owner Endpoints ---

    @PostMapping
    public ResponseEntity<RestaurantDto> createRestaurant(@Valid @RequestBody RestaurantDto restaurantDto, Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        restaurantDto.setOwnerId(ownerId); // Set ownerId from the authenticated token
        RestaurantDto createdRestaurant = restaurantService.createRestaurant(restaurantDto);
        return new ResponseEntity<>(createdRestaurant, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<RestaurantDto> updateRestaurantProfile(@PathVariable Long id, @Valid @RequestBody RestaurantDto restaurantDto) {
        // Authorization logic (e.g., check if authenticated user owns this restaurant) would be handled in the service layer
        RestaurantDto updatedRestaurant = restaurantService.updateRestaurantProfile(id, restaurantDto);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @PostMapping("/{restaurantId}/categories")
    public ResponseEntity<MenuCategoryDto> addMenuCategory(@PathVariable Long restaurantId, @Valid @RequestBody MenuCategoryDto menuCategoryDto) {
        MenuCategoryDto newCategory = restaurantService.addMenuCategory(restaurantId, menuCategoryDto);
        return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
    }

    @PostMapping("/categories/{categoryId}/items")
    public ResponseEntity<MenuItemDto> addMenuItem(@PathVariable Long categoryId, @Valid @RequestBody MenuItemDto menuItemDto) {
        MenuItemDto newItem = restaurantService.addMenuItemToCategory(categoryId, menuItemDto);
        return new ResponseEntity<>(newItem, HttpStatus.CREATED);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long itemId) {
        restaurantService.deleteMenuItem(itemId);
        return ResponseEntity.noContent().build();
    }


    // --- Admin Endpoints ---

    @PutMapping("/{id}/status")
    public ResponseEntity<RestaurantDto> updateRestaurantStatus(@PathVariable Long id, @RequestParam RestaurantStatus status) {
        RestaurantDto updatedRestaurant = restaurantService.updateRestaurantStatus(id, status);
        return ResponseEntity.ok(updatedRestaurant);
    }
}