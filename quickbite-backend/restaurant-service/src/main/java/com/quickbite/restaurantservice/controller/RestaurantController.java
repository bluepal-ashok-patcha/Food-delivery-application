package com.quickbite.restaurantservice.controller;


import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.quickbite.restaurantservice.dto.ApiResponse;
import com.quickbite.restaurantservice.dto.ImportReportDto;
import com.quickbite.restaurantservice.dto.MenuCategoryDto;
import com.quickbite.restaurantservice.dto.MenuItemDto;
import com.quickbite.restaurantservice.dto.ParsedRestaurant;
import com.quickbite.restaurantservice.dto.RestaurantDto;
import com.quickbite.restaurantservice.dto.RestaurantReviewDto;
import com.quickbite.restaurantservice.entity.Restaurant;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import com.quickbite.restaurantservice.service.ExcelRestaurantImporter;
import com.quickbite.restaurantservice.service.RestaurantService;
import com.quickbite.restaurantservice.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;





@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private JwtUtil jwtUtil;

    // --- Public Endpoints ---

//    @GetMapping
//    public ResponseEntity<ApiResponse<List<RestaurantDto>>> getAllRestaurants(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size,
//            @RequestParam(defaultValue = "id") String sortBy,
//            @RequestParam(defaultValue = "asc") String sortDir,
//            @RequestParam(required = false) String search
//    ) {
//        Page<com.quickbite.restaurantservice.entity.Restaurant> pageData = restaurantService.getAllRestaurantsPage(page, size, sortBy, sortDir, search)
//                .map(r -> r); // keep as is
//        List<RestaurantDto> data = pageData.getContent().stream()
//                .filter(r -> r.getStatus() == com.quickbite.restaurantservice.entity.RestaurantStatus.ACTIVE
//                        || r.getStatus() == com.quickbite.restaurantservice.entity.RestaurantStatus.APPROVED)
//                .map(r -> {
//            RestaurantDto dto = new RestaurantDto();
//            org.springframework.beans.BeanUtils.copyProperties(r, dto);
//            if (r.getMenuCategories() != null) {
//                dto.setMenuCategories(r.getMenuCategories().stream().map(mc -> {
//                    com.quickbite.restaurantservice.dto.MenuCategoryDto mcd = new com.quickbite.restaurantservice.dto.MenuCategoryDto();
//                    org.springframework.beans.BeanUtils.copyProperties(mc, mcd);
//                    if (mc.getMenuItems() != null) {
//                        mcd.setMenuItems(mc.getMenuItems().stream().map(mi -> {
//                            com.quickbite.restaurantservice.dto.MenuItemDto mid = new com.quickbite.restaurantservice.dto.MenuItemDto();
//                            org.springframework.beans.BeanUtils.copyProperties(mi, mid);
//                            return mid;
//                        }).collect(java.util.stream.Collectors.toList()));
//                    }
//                    return mcd;
//                }).collect(java.util.stream.Collectors.toList()));
//            }
//            return dto;
//        }).collect(java.util.stream.Collectors.toList());
//        ApiResponse<List<RestaurantDto>> body = ApiResponse.<List<RestaurantDto>>builder()
//                .success(true)
//                .message("Restaurants fetched successfully")
//                .data(data)
//                .page(ApiResponse.PageMeta.builder()
//                        .currentPage(pageData.getNumber())
//                        .size(pageData.getSize())
//                        .totalElements(pageData.getTotalElements())
//                        .totalPages(pageData.getTotalPages())
//                        .hasNext(pageData.hasNext())
//                        .hasPrevious(pageData.hasPrevious())
//                        .build())
//                .build();
//        return ResponseEntity.ok(body);
//    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<RestaurantDto>>> getAllRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isPureVeg // <-- boolean param
    ) {
        Page<Restaurant> pageData = restaurantService.getAllRestaurantsPage(page, size, sortBy, sortDir, search, isPureVeg);

        List<RestaurantDto> data = pageData.getContent().stream()
                .filter(r -> r.getStatus() == RestaurantStatus.ACTIVE || r.getStatus() == RestaurantStatus.APPROVED)
                .map(r -> {
                    RestaurantDto dto = new RestaurantDto();
                    org.springframework.beans.BeanUtils.copyProperties(r, dto);
                    // convert menu categories/items to DTOs if needed...
                    return dto;
                }).collect(Collectors.toList());

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

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<RestaurantReviewDto>> updateReview(@PathVariable Long reviewId, @Valid @RequestBody RestaurantReviewDto reviewDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        reviewDto.setUserId(userId);
        RestaurantReviewDto updated = restaurantService.updateReview(reviewId, reviewDto);
        return ResponseEntity.ok(ApiResponse.<RestaurantReviewDto>builder()
                .success(true)
                .message("Review updated successfully")
                .data(updated)
                .build());
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long reviewId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        // TODO: Add authorization check to ensure user can only delete their own reviews
        restaurantService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Review deleted successfully")
                .data(null)
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

    // Lightweight owner/admin toggle: isOpen
    @PutMapping("/{id}/open")
    public ResponseEntity<ApiResponse<RestaurantDto>> setRestaurantOpen(@PathVariable Long id, @RequestParam boolean isOpen) {
        RestaurantDto updated = restaurantService.setRestaurantOpen(id, isOpen);
        return ResponseEntity.ok(ApiResponse.<RestaurantDto>builder()
                .success(true)
                .message("Restaurant open flag updated")
                .data(updated)
                .build());
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
    

 // ✅ Export Restaurant to PDF
 	@GetMapping("/{id}/export/pdf")
 	public ResponseEntity<byte[]> exportRestaurantPdf(@PathVariable Long id) {
 		return restaurantService.exportRestaurantPdf(id);
 	}

 	// 🟥 NEW: Export All Restaurants as Excel
 	@GetMapping("/export/excel")
 	public ResponseEntity<byte[]> exportRestaurantsExcel() {
 		return restaurantService.exportRestaurantsToExcel();
 	}

 	@GetMapping("/export/admin/all/pdf")
 	public ResponseEntity<byte[]> adminExportAllRestaurantsPdf() {
 		return restaurantService.adminDownloadAllRestaurantsPdf();
 	}

 	@Autowired
 	private ExcelRestaurantImporter excelImporter;

 	@PostMapping("/import/excel")
 	public ResponseEntity<ApiResponse<ImportReportDto>> importRestaurantsFromExcel(
 			@RequestParam("file") MultipartFile file, HttpServletRequest request) throws IOException {

 		String userRole = extractUserRole(request); // your existing helper
 		if (!"ADMIN".equals(userRole)) {
 			ApiResponse<ImportReportDto> body = ApiResponse.<ImportReportDto>builder().success(false)
 					.message("Only ADMIN can import restaurants").data(null).build();
 			return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
 		}

 		if (file == null || file.isEmpty()) {
 			ApiResponse<ImportReportDto> body = ApiResponse.<ImportReportDto>builder().success(false)
 					.message("File is required").data(null).build();
 			return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
 		}

 		if (!file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
 			ApiResponse<ImportReportDto> body = ApiResponse.<ImportReportDto>builder().success(false)
 					.message("Only .xlsx files are supported").data(null).build();
 			return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
 		}

 		List<ParsedRestaurant> parsed;
 		try (InputStream is = file.getInputStream()) {
 			parsed = excelImporter.parse(is);
 		} catch (Exception ex) {
 			ApiResponse<ImportReportDto> body = ApiResponse.<ImportReportDto>builder().success(false)
 					.message("Failed to parse Excel: " + ex.getMessage()).data(null).build();
 			return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
 		}

 		ImportReportDto report = new ImportReportDto();
 		report.setTotal(parsed.size());

 		for (ParsedRestaurant pr : parsed) {
 			try {
 // Ensure ownerId present (ADMIN requirement)
 				if (pr.getRestaurantDto().getOwnerId() == null) {
 					report.addFailure(pr.getRowNumber(),
 							"ownerId is required for ADMIN-created restaurant (Restaurants sheet, row "
 									+ pr.getRowNumber() + ")");
 					continue;
 				}
 // Do not set IDs (explicitly null)
 				pr.getRestaurantDto().setId(null);
 				if (pr.getRestaurantDto().getMenuCategories() != null) {
 					pr.getRestaurantDto().getMenuCategories().forEach(cat -> {
 						cat.setId(null);
 						if (cat.getMenuItems() != null) {
 							cat.getMenuItems().forEach(item -> item.setId(null));
 						}
 					});
 				}

 				RestaurantDto created = restaurantService.createRestaurant(pr.getRestaurantDto());
 				report.addSuccess(pr.getRowNumber(), created);
 			} catch (Exception e) {
 				report.addFailure(pr.getRowNumber(), e.getMessage());
 			}
 		}

 		ApiResponse<ImportReportDto> body = ApiResponse.<ImportReportDto>builder().success(true)
 				.message("Import completed").data(report).build();

 		return new ResponseEntity<>(body, HttpStatus.OK);
 	}

 	@GetMapping("/export/pdf/{ownerId}")
 	public ResponseEntity<byte[]> exportByOwnerPdf(@PathVariable Long ownerId,HttpServletRequest request) {
 	    return restaurantService.exportRestaurantsByOwnerPdf(ownerId);
 	}


}