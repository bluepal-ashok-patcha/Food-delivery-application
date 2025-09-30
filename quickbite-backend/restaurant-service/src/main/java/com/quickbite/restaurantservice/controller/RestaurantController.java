package com.quickbite.restaurantservice.controller;

import com.quickbite.restaurantservice.dto.ApiResponse;
import com.quickbite.restaurantservice.dto.MenuCategoryDto;
import com.quickbite.restaurantservice.dto.MenuItemDto;
import com.quickbite.restaurantservice.dto.RestaurantDto;
import com.quickbite.restaurantservice.dto.PageMeta;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import com.quickbite.restaurantservice.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
    public ResponseEntity<ApiResponse<List<RestaurantDto>>> getAllRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search
    ) {
        Page<com.quickbite.restaurantservice.entity.Restaurant> pageData = restaurantService.getAllRestaurantsPage(page, size, sortBy, sortDir, search);
        List<RestaurantDto> data = pageData.getContent().stream().map(r -> {
            RestaurantDto dto = new RestaurantDto();
            org.springframework.beans.BeanUtils.copyProperties(r, dto);
            if (r.getMenuCategories() != null) {
                dto.setMenuCategories(r.getMenuCategories().stream().map(mc -> {
                    com.quickbite.restaurantservice.dto.MenuCategoryDto mcd = new com.quickbite.restaurantservice.dto.MenuCategoryDto();
                    org.springframework.beans.BeanUtils.copyProperties(mc, mcd);
                    if (mc.getMenuItems() != null) {
                        mcd.setMenuItems(mc.getMenuItems().stream().map(mi -> {
                            com.quickbite.restaurantservice.dto.MenuItemDto mid = new com.quickbite.restaurantservice.dto.MenuItemDto();
                            org.springframework.beans.BeanUtils.copyProperties(mi, mid);
                            return mid;
                        }).collect(java.util.stream.Collectors.toList()));
                    }
                    return mcd;
                }).collect(java.util.stream.Collectors.toList()));
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());
        ApiResponse<List<RestaurantDto>> body = ApiResponse.<List<RestaurantDto>>builder()
                .success(true)
                .message("Restaurants fetched successfully")
                .data(data)
                .page(PageMeta.builder()
                        .page(pageData.getNumber())
                        .size(pageData.getSize())
                        .totalElements(pageData.getTotalElements())
                        .totalPages(pageData.getTotalPages())
                        .build())
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RestaurantDto>> getRestaurantById(@PathVariable Long id) {
        RestaurantDto dto = restaurantService.getRestaurantById(id);
        ApiResponse<RestaurantDto> body = ApiResponse.<RestaurantDto>builder()
                .success(true)
                .message("Restaurant fetched successfully")
                .data(dto)
                .build();
        return ResponseEntity.ok(body);
    }

    // --- Restaurant Owner Endpoints ---

    @PostMapping
    public ResponseEntity<ApiResponse<RestaurantDto>> createRestaurant(@Valid @RequestBody RestaurantDto restaurantDto, Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        restaurantDto.setOwnerId(ownerId); // Set ownerId from the authenticated token
        RestaurantDto createdRestaurant = restaurantService.createRestaurant(restaurantDto);
        ApiResponse<RestaurantDto> body = ApiResponse.<RestaurantDto>builder()
                .success(true)
                .message("Restaurant created successfully")
                .data(createdRestaurant)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<RestaurantDto>> updateRestaurantProfile(@PathVariable Long id, @Valid @RequestBody RestaurantDto restaurantDto) {
        // Authorization logic (e.g., check if authenticated user owns this restaurant) would be handled in the service layer
        RestaurantDto updatedRestaurant = restaurantService.updateRestaurantProfile(id, restaurantDto);
        ApiResponse<RestaurantDto> body = ApiResponse.<RestaurantDto>builder()
                .success(true)
                .message("Restaurant updated successfully")
                .data(updatedRestaurant)
                .build();
        return ResponseEntity.ok(body);
    }

    @PostMapping("/{restaurantId}/categories")
    public ResponseEntity<ApiResponse<MenuCategoryDto>> addMenuCategory(@PathVariable Long restaurantId, @Valid @RequestBody MenuCategoryDto menuCategoryDto) {
        MenuCategoryDto newCategory = restaurantService.addMenuCategory(restaurantId, menuCategoryDto);
        ApiResponse<MenuCategoryDto> body = ApiResponse.<MenuCategoryDto>builder()
                .success(true)
                .message("Menu category created successfully")
                .data(newCategory)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @PostMapping("/categories/{categoryId}/items")
    public ResponseEntity<ApiResponse<MenuItemDto>> addMenuItem(@PathVariable Long categoryId, @Valid @RequestBody MenuItemDto menuItemDto) {
        MenuItemDto newItem = restaurantService.addMenuItemToCategory(categoryId, menuItemDto);
        ApiResponse<MenuItemDto> body = ApiResponse.<MenuItemDto>builder()
                .success(true)
                .message("Menu item created successfully")
                .data(newItem)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<ApiResponse<MenuCategoryDto>> updateMenuCategory(@PathVariable Long categoryId, @Valid @RequestBody MenuCategoryDto menuCategoryDto) {
        MenuCategoryDto updated = restaurantService.updateMenuCategory(categoryId, menuCategoryDto);
        return ResponseEntity.ok(ApiResponse.<MenuCategoryDto>builder()
                .success(true)
                .message("Menu category updated successfully")
                .data(updated)
                .build());
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteMenuCategory(@PathVariable Long categoryId) {
        restaurantService.deleteMenuCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Menu category deleted successfully")
                .data(null)
                .build());
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<MenuItemDto>> updateMenuItem(@PathVariable Long itemId, @Valid @RequestBody MenuItemDto menuItemDto) {
        MenuItemDto updated = restaurantService.updateMenuItem(itemId, menuItemDto);
        return ResponseEntity.ok(ApiResponse.<MenuItemDto>builder()
                .success(true)
                .message("Menu item updated successfully")
                .data(updated)
                .build());
    }
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable Long itemId) {
        restaurantService.deleteMenuItem(itemId);
        ApiResponse<Void> body = ApiResponse.<Void>builder()
                .success(true)
                .message("Menu item deleted successfully")
                .data(null)
                .build();
        return ResponseEntity.ok(body);
    }


    // --- Admin Endpoints ---

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RestaurantDto>> updateRestaurantStatus(@PathVariable Long id, @RequestParam RestaurantStatus status) {
        RestaurantDto updatedRestaurant = restaurantService.updateRestaurantStatus(id, status);
        ApiResponse<RestaurantDto> body = ApiResponse.<RestaurantDto>builder()
                .success(true)
                .message("Restaurant status updated successfully")
                .data(updatedRestaurant)
                .build();
        return ResponseEntity.ok(body);
    }
}