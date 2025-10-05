package com.quickbite.restaurantservice.controller;

import com.quickbite.restaurantservice.dto.ApiResponse;
import com.quickbite.restaurantservice.dto.MenuCategoryDto;
import com.quickbite.restaurantservice.dto.MenuItemDto;
import com.quickbite.restaurantservice.dto.RestaurantDto;
import com.quickbite.restaurantservice.dto.RestaurantReviewDto;
import com.quickbite.restaurantservice.dto.PageMeta;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import com.quickbite.restaurantservice.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import com.quickbite.restaurantservice.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private JwtUtil jwtUtil;

    // --- Public Endpoints ---

    @GetMapping
    public ResponseEntity<ApiResponse<List<RestaurantDto>>> getAllRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search
    ) {
        Page<com.quickbite.restaurantservice.entity.Restaurant> pageData = restaurantService.getAllRestaurantsPage(page, size, sortBy, sortDir, search)
                .map(r -> r); // keep as is
        List<RestaurantDto> data = pageData.getContent().stream()
                .filter(r -> r.getStatus() == com.quickbite.restaurantservice.entity.RestaurantStatus.ACTIVE
                        || r.getStatus() == com.quickbite.restaurantservice.entity.RestaurantStatus.APPROVED)
                .map(r -> {
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
                .page(ApiResponse.PageMeta.builder()
                        .currentPage(pageData.getNumber())
                        .size(pageData.getSize())
                        .totalElements(pageData.getTotalElements())
                        .totalPages(pageData.getTotalPages())
                        .hasNext(pageData.hasNext())
                        .hasPrevious(pageData.hasPrevious())
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

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RestaurantDto>>> getMyRestaurants(HttpServletRequest request) {
        Long userId = extractUserId(request);
        List<RestaurantDto> list = restaurantService.getMyRestaurants(userId);
        return ResponseEntity.ok(ApiResponse.<List<RestaurantDto>>builder()
                .success(true)
                .message("My restaurants fetched successfully")
                .data(list)
                .build());
    }

    // --- Reviews ---

    @PostMapping("/{restaurantId}/reviews")
    public ResponseEntity<ApiResponse<RestaurantReviewDto>> addReview(@PathVariable Long restaurantId, @Valid @RequestBody RestaurantReviewDto reviewDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        reviewDto.setRestaurantId(restaurantId);
        reviewDto.setUserId(userId);
        RestaurantReviewDto saved = restaurantService.addReview(reviewDto);
        return new ResponseEntity<>(ApiResponse.<RestaurantReviewDto>builder()
                .success(true)
                .message("Review added successfully")
                .data(saved)
                .build(), HttpStatus.CREATED);
    }

    @GetMapping("/{restaurantId}/reviews")
    public ResponseEntity<ApiResponse<List<RestaurantReviewDto>>> listReviews(@PathVariable Long restaurantId) {
        List<RestaurantReviewDto> list = restaurantService.listReviews(restaurantId);
        return ResponseEntity.ok(ApiResponse.<List<RestaurantReviewDto>>builder()
                .success(true)
                .message("Reviews fetched successfully")
                .data(list)
                .build());
    }

    // --- Restaurant Owner Endpoints ---

    @PostMapping("/owners/apply")
    public ResponseEntity<ApiResponse<RestaurantDto>> applyAsOwner(@Valid @RequestBody RestaurantDto restaurantDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        restaurantDto.setOwnerId(userId);
        RestaurantDto createdRestaurant = restaurantService.createRestaurant(restaurantDto);
        ApiResponse<RestaurantDto> body = ApiResponse.<RestaurantDto>builder()
                .success(true)
                .message("Restaurant application submitted successfully")
                .data(createdRestaurant)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RestaurantDto>> createRestaurant(@Valid @RequestBody RestaurantDto restaurantDto, HttpServletRequest request) {
        String userRole = extractUserRole(request);
        Long userId = extractUserId(request);
        
        if ("ADMIN".equals(userRole)) {
            if (restaurantDto.getOwnerId() == null) {
                return new ResponseEntity<>(ApiResponse.<RestaurantDto>builder()
                        .success(false)
                        .message("ownerId is required when creating a restaurant as ADMIN")
                        .data(null)
                        .build(), HttpStatus.BAD_REQUEST);
            }
            // use ownerId from request body
        } else {
            restaurantDto.setOwnerId(userId);
        }
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

    // List categories for a restaurant
    @GetMapping("/{restaurantId}/categories")
    public ResponseEntity<ApiResponse<List<MenuCategoryDto>>> listCategories(@PathVariable Long restaurantId) {
        List<MenuCategoryDto> list = restaurantService.getCategoriesByRestaurantId(restaurantId);
        return ResponseEntity.ok(ApiResponse.<List<MenuCategoryDto>>builder()
                .success(true)
                .message("Categories fetched successfully")
                .data(list)
                .build());
    }

    // List items for a restaurant
    @GetMapping("/{restaurantId}/items")
    public ResponseEntity<ApiResponse<List<MenuItemDto>>> listItems(@PathVariable Long restaurantId) {
        List<MenuItemDto> list = restaurantService.getItemsByRestaurantId(restaurantId);
        return ResponseEntity.ok(ApiResponse.<List<MenuItemDto>>builder()
                .success(true)
                .message("Items fetched successfully")
                .data(list)
                .build());
    }

    // Get single item by id
    @GetMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<MenuItemDto>> getItemById(@PathVariable Long itemId) {
        MenuItemDto item = restaurantService.getMenuItemById(itemId);
        return ResponseEntity.ok(ApiResponse.<MenuItemDto>builder()
                .success(true)
                .message("Item fetched successfully")
                .data(item)
                .build());
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

    private Long extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                return jwtUtil.getAllClaimsFromToken(token).get("userId", Long.class);
            } catch (Exception ignored) {}
        }
        throw new RuntimeException("Unauthorized");
    }

    private String extractUserRole(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                return jwtUtil.getAllClaimsFromToken(token).get("role", String.class);
            } catch (Exception ignored) {}
        }
        throw new RuntimeException("Unauthorized");
    }
}