package com.quickbite.restaurantservice.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;



import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.quickbite.restaurantservice.dto.ImportReportDto;
import com.quickbite.restaurantservice.dto.MenuCategoryDto;
import com.quickbite.restaurantservice.dto.MenuItemDto;
import com.quickbite.restaurantservice.dto.ParsedMenuCategory;
import com.quickbite.restaurantservice.dto.ParsedMenuItem;
import com.quickbite.restaurantservice.dto.ParsedRestaurant;
import com.quickbite.restaurantservice.dto.RestaurantDto;
import com.quickbite.restaurantservice.dto.RestaurantReviewDto;
import com.quickbite.restaurantservice.entity.MenuCategory;
import com.quickbite.restaurantservice.entity.MenuItem;
import com.quickbite.restaurantservice.entity.Restaurant;
import com.quickbite.restaurantservice.entity.RestaurantReview;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import com.quickbite.restaurantservice.repository.CrossServiceJdbcRepository;
import com.quickbite.restaurantservice.repository.MenuCategoryRepository;
import com.quickbite.restaurantservice.repository.MenuItemRepository;
import com.quickbite.restaurantservice.repository.RestaurantRepository;
import com.quickbite.restaurantservice.repository.RestaurantReviewRepository;
import com.quickbite.restaurantservice.dto.MenuItemDto;
import com.quickbite.restaurantservice.dto.RestaurantDto;
import com.quickbite.restaurantservice.dto.RestaurantReviewDto;
import com.quickbite.restaurantservice.entity.MenuCategory;
import com.quickbite.restaurantservice.entity.MenuItem;
import com.quickbite.restaurantservice.entity.Restaurant;
import com.quickbite.restaurantservice.entity.RestaurantReview;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import com.quickbite.restaurantservice.repository.MenuCategoryRepository;
import com.quickbite.restaurantservice.repository.MenuItemRepository;
import com.quickbite.restaurantservice.repository.RestaurantRepository;
import com.quickbite.restaurantservice.repository.RestaurantReviewRepository;
import com.quickbite.restaurantservice.repository.CrossServiceJdbcRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    private static final Logger log = LoggerFactory.getLogger(RestaurantService.class);

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuCategoryRepository menuCategoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantReviewRepository restaurantReviewRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private CrossServiceJdbcRepository crossServiceRepository;

    // --- Restaurant Management ---

    @Transactional
    public RestaurantDto createRestaurant(RestaurantDto restaurantDto) {
        restaurantDto.setStatus(RestaurantStatus.PENDING_APPROVAL);
        Restaurant restaurant = convertToEntity(restaurantDto);
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        log.info("New restaurant '{}' created with PENDING_APPROVAL status.", savedRestaurant.getName());
        
        // Send pending approval notification
        sendPendingApprovalNotification(savedRestaurant);
        
        return convertToDto(savedRestaurant);
    }

    @Transactional(readOnly = true)
    public RestaurantDto getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        return convertToDto(restaurant);
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getMyRestaurants(Long ownerId) {
        return restaurantRepository.findAll().stream()
                .filter(r -> ownerId.equals(r.getOwnerId()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    public Page<Restaurant> getAllRestaurantsPage(int page, int size, String sortBy, String sortDir, String search, Boolean isPureVeg) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // repository handles null/empty search and null isPureVeg
        return restaurantRepository.searchByNameCuisineOrMenuItems(search, isPureVeg, pageable);
    }
    
    @Transactional
    public RestaurantDto updateRestaurantStatus(Long id, RestaurantStatus status) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        RestaurantStatus previousStatus = restaurant.getStatus();
        restaurant.setStatus(status);
        // Keep isActive in sync with APPROVED/ACTIVE
        restaurant.setIsActive(status == RestaurantStatus.APPROVED || status == RestaurantStatus.ACTIVE);
        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);

        // Elevate owner role if status is APPROVED or ACTIVE
        if (status == RestaurantStatus.APPROVED || status == RestaurantStatus.ACTIVE) {
            try {
                crossServiceRepository.updateUserRole(updatedRestaurant.getOwnerId(), "RESTAURANT_OWNER");
            } catch (Exception e) {
                log.warn("Failed to elevate user role for ownerId {} to RESTAURANT_OWNER: {}",
                        updatedRestaurant.getOwnerId(), e.getMessage());
            }
        }

        log.info("Restaurant '{}' status updated from {} to {}.", updatedRestaurant.getName(), previousStatus, status);
        return convertToDto(updatedRestaurant);
    }

    @Transactional
    public RestaurantDto updateRestaurantProfile(Long id, RestaurantDto restaurantDto) {
        Restaurant existingRestaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        BeanUtils.copyProperties(restaurantDto, existingRestaurant, "id", "ownerId", "status", "menuCategories");
        Restaurant updatedRestaurant = restaurantRepository.save(existingRestaurant);
        log.info("Restaurant '{}' profile updated.", updatedRestaurant.getName());
        return convertToDto(updatedRestaurant);
    }

    @Transactional
    public RestaurantDto setRestaurantOpen(Long id, boolean isOpen) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        restaurant.setIsOpen(isOpen);
        Restaurant saved = restaurantRepository.save(restaurant);
        log.info("Restaurant '{}' isOpen set to {}.", saved.getName(), isOpen);
        return convertToDto(saved);
    }

    @Transactional
    public RestaurantDto setRestaurantActive(Long id, boolean isActive) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        restaurant.setIsActive(isActive);
        // Optionally sync status with ACTIVE/INACTIVE without requiring other fields
        if (isActive && restaurant.getStatus() == RestaurantStatus.INACTIVE) {
            restaurant.setStatus(RestaurantStatus.ACTIVE);
        } else if (!isActive && restaurant.getStatus() == RestaurantStatus.ACTIVE) {
            restaurant.setStatus(RestaurantStatus.INACTIVE);
        }
        Restaurant saved = restaurantRepository.save(restaurant);
        log.info("Restaurant '{}' isActive set to {}.", saved.getName(), isActive);
        return convertToDto(saved);
    }

    // --- Menu Management ---

    @Transactional
    public MenuCategoryDto addMenuCategory(Long restaurantId, MenuCategoryDto categoryDto) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        MenuCategory toSave = convertToEntity(categoryDto);
        MenuCategory savedCategory = menuCategoryRepository.save(toSave);
        if (restaurant.getMenuCategories() == null) {
            restaurant.setMenuCategories(new java.util.ArrayList<>());
        }
        restaurant.getMenuCategories().add(savedCategory);
        restaurantRepository.save(restaurant);
        log.info("Added menu category '{}' to restaurant '{}'.", savedCategory.getName(), restaurant.getName());
        return convertToDto(savedCategory);
    }

    @Transactional
    public MenuItemDto addMenuItemToCategory(Long categoryId, MenuItemDto itemDto) {
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Menu category not found"));
        MenuItem menuItem = convertToEntity(itemDto);
        category.getMenuItems().add(menuItem);
        menuCategoryRepository.save(category);
        log.info("Added menu item '{}' to category '{}'.", menuItem.getName(), category.getName());
        return convertToDto(menuItem);
    }

    @Transactional
    public void deleteMenuItem(Long itemId) {
        menuItemRepository.deleteById(itemId);
        log.info("Deleted menu item with id: {}", itemId);
    }

    @Transactional
    public MenuCategoryDto updateMenuCategory(Long categoryId, MenuCategoryDto categoryDto) {
        MenuCategory existing = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Menu category not found"));
        BeanUtils.copyProperties(categoryDto, existing, "id", "menuItems");
        MenuCategory saved = menuCategoryRepository.save(existing);
        log.info("Updated menu category with id: {}", categoryId);
        return convertToDto(saved);
    }

    @Transactional
    public void deleteMenuCategory(Long categoryId) {
        menuCategoryRepository.deleteById(categoryId);
        log.info("Deleted menu category with id: {}", categoryId);
    }

    @Transactional
    public MenuItemDto updateMenuItem(Long itemId, MenuItemDto itemDto) {
        MenuItem existing = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        BeanUtils.copyProperties(itemDto, existing, "id");
        MenuItem saved = menuItemRepository.save(existing);
        log.info("Updated menu item with id: {}", itemId);
        return convertToDto(saved);
    }

    // --- DTO Conversion Utilities ---

    private RestaurantDto convertToDto(Restaurant restaurant) {
        RestaurantDto dto = new RestaurantDto();
        BeanUtils.copyProperties(restaurant, dto);
        if (restaurant.getMenuCategories() != null) {
            dto.setMenuCategories(restaurant.getMenuCategories().stream().map(this::convertToDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private MenuCategoryDto convertToDto(MenuCategory category) {
        MenuCategoryDto dto = new MenuCategoryDto();
        BeanUtils.copyProperties(category, dto);
        if (category.getMenuItems() != null) {
            dto.setMenuItems(category.getMenuItems().stream().map(this::convertToDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private MenuItemDto convertToDto(MenuItem item) {
        MenuItemDto dto = new MenuItemDto();
        BeanUtils.copyProperties(item, dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<MenuCategoryDto> getCategoriesByRestaurantId(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        if (restaurant.getMenuCategories() == null) return java.util.Collections.emptyList();
        return restaurant.getMenuCategories().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemDto> getItemsByRestaurantId(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        if (restaurant.getMenuCategories() == null) return java.util.Collections.emptyList();
        return restaurant.getMenuCategories().stream()
                .filter(c -> c.getMenuItems() != null)
                .flatMap(c -> c.getMenuItems().stream())
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuItemDto getMenuItemById(Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        return convertToDto(item);
    }

    private Restaurant convertToEntity(RestaurantDto dto) {
        Restaurant entity = new Restaurant();
        BeanUtils.copyProperties(dto, entity, "menuCategories");
        if (dto.getMenuCategories() != null) {
            entity.setMenuCategories(dto.getMenuCategories().stream().map(this::convertToEntity).collect(Collectors.toList()));
        }
        return entity;
    }

    private MenuCategory convertToEntity(MenuCategoryDto dto) {
        MenuCategory entity = new MenuCategory();
        BeanUtils.copyProperties(dto, entity, "menuItems");
        if (dto.getMenuItems() != null) {
            entity.setMenuItems(dto.getMenuItems().stream().map(this::convertToEntity).collect(Collectors.toList()));
        }
        return entity;
    }

    private MenuItem convertToEntity(MenuItemDto dto) {
        MenuItem entity = new MenuItem();
        BeanUtils.copyProperties(dto, entity);
        return entity;
    }

    // --- Reviews ---

    @Transactional
    public RestaurantReviewDto addReview(RestaurantReviewDto dto) {
        RestaurantReview entity = new RestaurantReview();
        BeanUtils.copyProperties(dto, entity, "id");
        RestaurantReview saved = restaurantReviewRepository.save(entity);
        
        // Update restaurant rating and totalRatings
        updateRestaurantRating(dto.getRestaurantId());
        
        RestaurantReviewDto out = new RestaurantReviewDto();
        BeanUtils.copyProperties(saved, out);
        return out;
    }

    @Transactional(readOnly = true)
    public List<RestaurantReviewDto> listReviews(Long restaurantId) {
        return restaurantReviewRepository.findByRestaurantId(restaurantId).stream().map(r -> {
            RestaurantReviewDto d = new RestaurantReviewDto();
            BeanUtils.copyProperties(r, d);
            return d;
        }).collect(Collectors.toList());
    }

    @Transactional
    public RestaurantReviewDto updateReview(Long reviewId, RestaurantReviewDto dto) {
        RestaurantReview existing = restaurantReviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Store restaurantId before updating
        Long restaurantId = existing.getRestaurantId();
        
        BeanUtils.copyProperties(dto, existing, "id", "restaurantId", "userId");
        RestaurantReview saved = restaurantReviewRepository.save(existing);
        
        // Update restaurant rating and totalRatings
        updateRestaurantRating(restaurantId);
        
        RestaurantReviewDto out = new RestaurantReviewDto();
        BeanUtils.copyProperties(saved, out);
        return out;
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        RestaurantReview review = restaurantReviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        Long restaurantId = review.getRestaurantId();
        restaurantReviewRepository.deleteById(reviewId);
        
        // Update restaurant rating and totalRatings
        updateRestaurantRating(restaurantId);
        
        log.info("Deleted review {} for restaurant {}", reviewId, restaurantId);
    }

    // --- Rating Management ---

    /**
     * Updates restaurant rating and totalRatings based on current reviews
     */
    @Transactional
    public void updateRestaurantRating(Long restaurantId) {
        try {
            // Calculate average rating and total count
            Double avgRating = calculateAverageRating(restaurantId);
            Long totalRatings = calculateTotalRatings(restaurantId);
            
            // Update restaurant entity
            Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + restaurantId));
            
            restaurant.setRating(avgRating);
            restaurant.setTotalRatings(totalRatings.intValue());
            restaurantRepository.save(restaurant);
            
            log.info("Updated rating for restaurant {}: {} ({} reviews)", 
                restaurantId, avgRating, totalRatings);
                
        } catch (Exception e) {
            log.error("Failed to update rating for restaurant {}: {}", restaurantId, e.getMessage());
            // Don't throw exception to avoid breaking the review creation process
        }
    }

    /**
     * Calculates average rating for a restaurant
     */
    private Double calculateAverageRating(Long restaurantId) {
        List<RestaurantReview> reviews = restaurantReviewRepository.findByRestaurantId(restaurantId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        
        double sum = reviews.stream()
            .mapToInt(RestaurantReview::getRating)
            .sum();
        
        return Math.round((sum / reviews.size()) * 10.0) / 10.0; // Round to 1 decimal place
    }

    /**
     * Calculates total number of ratings for a restaurant
     */
    private Long calculateTotalRatings(Long restaurantId) {
        return restaurantReviewRepository.countByRestaurantId(restaurantId);
    }

    /**
     * Initializes ratings for all restaurants that don't have ratings set
     * This is useful for restaurants created before the rating system was implemented
     */
    @Transactional
    public void initializeAllRestaurantRatings() {
        List<Restaurant> restaurantsWithoutRatings = restaurantRepository.findByRatingIsNull();
        
        for (Restaurant restaurant : restaurantsWithoutRatings) {
            updateRestaurantRating(restaurant.getId());
        }
        
        log.info("Initialized ratings for {} restaurants", restaurantsWithoutRatings.size());
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getRestaurantsByStatus(RestaurantStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Restaurant> restaurants = restaurantRepository.findByStatus(status, pageable);
        return restaurants.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getAllRestaurants(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Restaurant> restaurants = restaurantRepository.findAll(pageable);
        return restaurants.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private void sendPendingApprovalNotification(Restaurant restaurant) {
        try {
            // Get owner details from auth service
            Map<String, Object> ownerData = crossServiceRepository.findAuthUserById(restaurant.getOwnerId());
            if (ownerData != null) {
                String ownerEmail = (String) ownerData.get("email");
                String ownerName = (String) ownerData.get("name");
                
                if (ownerEmail != null && ownerName != null) {
                    emailService.sendRestaurantApprovalEmail(
                        ownerEmail, 
                        ownerName, 
                        restaurant.getName(), 
                        "PENDING_APPROVAL", 
                        null
                    );
                } else {
                    log.warn("Owner email or name is null for restaurant {}", restaurant.getId());
                }
            } else {
                log.warn("Owner data not found for restaurant {} with ownerId {}", restaurant.getId(), restaurant.getOwnerId());
            }
        } catch (Exception e) {
            log.error("Failed to send pending approval notification for restaurant {}", restaurant.getId(), e);
        }
    }
      
 // ====================== IMPORT / EXPORT ======================

    public ResponseEntity<byte[]> exportRestaurantsToExcel(Long ownerId) throws IOException {
        List<RestaurantDto> restaurants = (ownerId == null)
                ? getAllRestaurants()
                : getMyRestaurants(ownerId);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Restaurants");

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Name", "CuisineType", "Address", "ContactNumber", "OwnerId", "Status", "IsActive"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
        }

        // Data
        int rowIdx = 1;
        for (RestaurantDto dto : restaurants) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(dto.getId() != null ? dto.getId() : 0);
            row.createCell(1).setCellValue(dto.getName());
            row.createCell(2).setCellValue(dto.getCuisineType());
            row.createCell(3).setCellValue(dto.getAddress());
            row.createCell(4).setCellValue(dto.getContactNumber());
            row.createCell(5).setCellValue(dto.getOwnerId() != null ? dto.getOwnerId() : 0);
            row.createCell(6).setCellValue(dto.getStatus() != null ? dto.getStatus().name() : "");
            row.createCell(7).setCellValue(Boolean.TRUE.equals(dto.getIsActive()) ? "Yes" : "No");
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        HttpHeaders headersResp = new HttpHeaders();
        headersResp.add("Content-Disposition", "attachment; filename=restaurants.xlsx");
        return ResponseEntity.ok()
                .headers(headersResp)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(out.toByteArray());
    }

    public ResponseEntity<byte[]> exportRestaurantsToPdf(Long ownerId) throws IOException {
        List<RestaurantDto> restaurants = (ownerId == null)
                ? getAllRestaurants()
                : getMyRestaurants(ownerId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("Restaurant Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("\n"));

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2, 3, 3, 3, 2});

        // Headers
        String[] headers = {"ID", "Name", "Cuisine", "Contact", "Status"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        // Rows
        for (RestaurantDto dto : restaurants) {
            table.addCell(String.valueOf(dto.getId()));
            table.addCell(dto.getName());
            table.addCell(dto.getCuisineType());
            table.addCell(dto.getContactNumber());
            table.addCell(dto.getStatus() != null ? dto.getStatus().name() : "");
        }

        document.add(table);
        document.close();

        HttpHeaders headersResp = new HttpHeaders();
        headersResp.add("Content-Disposition", "attachment; filename=restaurants.pdf");
        return ResponseEntity.ok()
                .headers(headersResp)
                .contentType(MediaType.APPLICATION_PDF)
                .body(out.toByteArray());
    }

    /**
     * Import restaurants from parsed Excel data
     */
    @Transactional
    public ImportReportDto importRestaurants(List<ParsedRestaurant> parsedList) {
        int success = 0;
        int fail = 0;
        List<String> errors = new ArrayList();

        for (ParsedRestaurant parsed : parsedList) {
            try {
                Restaurant restaurant = new Restaurant();
                restaurant.setName(parsed.getName());
                restaurant.setCuisineType(parsed.getCuisineType());
                restaurant.setAddress(parsed.getAddress());
                restaurant.setContactNumber(parsed.getContactNumber());
                restaurant.setDescription(parsed.getDescription());
                restaurant.setImage(parsed.getImage());
                restaurant.setCoverImage(parsed.getCoverImage());
                restaurant.setRating(parsed.getRating());
                restaurant.setTotalRatings(parsed.getTotalRatings());
                restaurant.setDeliveryTime(parsed.getDeliveryTime());
                restaurant.setDeliveryFee(parsed.getDeliveryFee());
                restaurant.setMinimumOrder(parsed.getMinimumOrder());
                restaurant.setIsOpen(parsed.getIsOpen());
                restaurant.setIsActive(parsed.getIsActive());
                restaurant.setIsVeg(parsed.getIsVeg());
                restaurant.setIsPureVeg(parsed.getIsPureVeg());
                restaurant.setOpeningHours(parsed.getOpeningHours());
                restaurant.setDeliveryRadiusKm(parsed.getDeliveryRadiusKm());
                restaurant.setLatitude(parsed.getLatitude());
                restaurant.setLongitude(parsed.getLongitude());
                restaurant.setTags(parsed.getTags());
                restaurant.setOpeningTime(parsed.getOpeningTime());
                restaurant.setClosingTime(parsed.getClosingTime());
                restaurant.setOwnerId(parsed.getOwnerId());
                restaurant.setStatus(RestaurantStatus.APPROVED);
                
//                ✅ Set ownerId from Excel or fallback
//                restaurant.setOwnerId(parsed.getOwnerId());


                
                List<MenuCategory> categories = new ArrayList<>();
                for (ParsedMenuCategory catDto : parsed.getMenuCategories()) {
                    MenuCategory category = new MenuCategory();
                    category.setName(catDto.getName());
                   

                    List<MenuItem> items = new ArrayList<>();
                    for (ParsedMenuItem itemDto : catDto.getMenuItems()) {
                        MenuItem item = new MenuItem();
                        item.setName(itemDto.getName());
                        item.setDescription(itemDto.getDescription());
                        item.setPrice(itemDto.getPrice());
                        item.setImageUrl(itemDto.getImageUrl());
                        item.setInStock(itemDto.getInStock() != null ? itemDto.getInStock() : true);
                        item.setOriginalPrice(itemDto.getOriginalPrice());
                        item.setIsVeg(itemDto.getIsVeg());
                        item.setIsPopular(itemDto.getIsPopular());
                        item.setPreparationTime(itemDto.getPreparationTime());
                        item.setCustomizationJson(itemDto.getCustomizationJson());
                        item.setNutritionJson(itemDto.getNutritionJson());
                        items.add(item);
                    }
                    category.setMenuItems(items);
                    categories.add(category);
                }

                restaurant.setMenuCategories(categories);
                restaurantRepository.save(restaurant);
                success++;

            } catch (Exception e) {
                fail++;
                errors.add("Failed: " + parsed.getName() + " -> " + e.getMessage());
            }
        }

        ImportReportDto report = new ImportReportDto();
        report.setTotal(parsedList.size());
        report.setSuccess(success);
        report.setFailed(fail);
        report.setErrors(errors);
        return report;
    }

   
    /**
     * Generate Excel Template for Admin Reference
     */
    public ResponseEntity<byte[]> generateRestaurantTemplate() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Restaurants");

        String[] headers = {
            "Name", "CuisineType", "Address", "ContactNumber", "Description",
            "DeliveryTime", "DeliveryFee", "MinimumOrder", "OpeningTime", "ClosingTime",
            "OwnerId", "Status" 
        };

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        HttpHeaders headersResp = new HttpHeaders();
        headersResp.add("Content-Disposition", "attachment; filename=restaurant_import_template.xlsx");
        return ResponseEntity.ok()
                .headers(headersResp)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(out.toByteArray());
    }

}