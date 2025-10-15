package com.quickbite.restaurantservice.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
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
import org.springframework.web.multipart.MultipartFile;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.quickbite.restaurantservice.dto.MenuCategoryDto;
import com.quickbite.restaurantservice.dto.MenuItemDto;
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

//Import at top if missing
import java.time.format.DateTimeFormatter;
import java.time.LocalTime;
import java.util.Locale;
import java.util.Date;



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

    public Page<Restaurant> getAllRestaurantsPageWithLocation(int page, int size, String sortBy, String sortDir, String search, Boolean isPureVeg, Double latitude, Double longitude, Double radiusKm) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Use location-based search if location parameters are provided
        if (latitude != null && longitude != null && radiusKm != null) {
            return restaurantRepository.searchByNameCuisineOrMenuItemsWithLocation(search, isPureVeg, latitude, longitude, radiusKm, pageable);
        } else {
            // Fall back to regular search if no location parameters
            return restaurantRepository.searchByNameCuisineOrMenuItems(search, isPureVeg, pageable);
        }
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
        // Check if review already exists for this order and user
        if (dto.getOrderId() != null) {
            Optional<RestaurantReview> existingReview = restaurantReviewRepository
                .findByRestaurantIdAndUserIdAndOrderId(dto.getRestaurantId(), dto.getUserId(), dto.getOrderId());
            if (existingReview.isPresent()) {
                throw new RuntimeException("You have already reviewed this order");
            }
        }
        
        RestaurantReview entity = new RestaurantReview();
        BeanUtils.copyProperties(dto, entity, "id", "createdAt");
        // Set createdAt to current time if not already set
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(Instant.now());
        }
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

      
    private static final String RESTAURANT_SHEET = "Restaurants";
    private static final String CATEGORY_SHEET = "MenuCategories";
    private static final String ITEM_SHEET = "MenuItems";
    
    @Transactional
    public void importRestaurants(MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet restaurantSheet = workbook.getSheet(RESTAURANT_SHEET);
            Sheet categorySheet = workbook.getSheet(CATEGORY_SHEET);
            Sheet itemSheet = workbook.getSheet(ITEM_SHEET);

            // 1️⃣ Parse all restaurants
            Map<String, Restaurant> restaurantMap = parseRestaurants(restaurantSheet);

            // 2️⃣ Parse all categories and attach to restaurants
            Map<String, List<MenuCategory>> categoryMap = parseCategories(categorySheet, restaurantMap);

            // 3️⃣ Parse all items and attach to categories
            parseMenuItems(itemSheet, categoryMap);

            // 4️⃣ Save all restaurants
            for (Restaurant restaurant : restaurantMap.values()) {
                restaurantRepository.save(restaurant);
            }

            System.out.println("✅ Imported " + restaurantMap.size() + " restaurants successfully!");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to import restaurant data: " + e.getMessage());
        }
    }

    
    private Map<String, Restaurant> parseRestaurants(Sheet sheet) {
        Map<String, Restaurant> map = new HashMap<>();
        DataFormatter formatter = new DataFormatter(); // <--- Add this

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            Restaurant restaurant = new Restaurant();

            restaurant.setName(formatter.formatCellValue(row.getCell(0)));
            restaurant.setCuisineType(formatter.formatCellValue(row.getCell(1)));
            restaurant.setAddress(formatter.formatCellValue(row.getCell(2)));
            restaurant.setContactNumber(formatter.formatCellValue(row.getCell(3)));
            restaurant.setDescription(formatter.formatCellValue(row.getCell(4)));
            restaurant.setImage(formatter.formatCellValue(row.getCell(5)));      // image URL safe
            restaurant.setCoverImage(formatter.formatCellValue(row.getCell(6))); // cover image safe

            // Numeric fields
            String ratingStr = formatter.formatCellValue(row.getCell(7));
            restaurant.setRating(ratingStr.isEmpty() ? 0 : Double.parseDouble(ratingStr));

            String totalRatingsStr = formatter.formatCellValue(row.getCell(8));
            restaurant.setTotalRatings(totalRatingsStr.isEmpty() ? 0 : Integer.parseInt(totalRatingsStr));

            restaurant.setDeliveryTime(formatter.formatCellValue(row.getCell(9)));

            String deliveryFeeStr = formatter.formatCellValue(row.getCell(10));
            restaurant.setDeliveryFee(deliveryFeeStr.isEmpty() ? 0 : Double.parseDouble(deliveryFeeStr));

            String minOrderStr = formatter.formatCellValue(row.getCell(11));
            restaurant.setMinimumOrder(minOrderStr.isEmpty() ? 0 : Double.parseDouble(minOrderStr));

            restaurant.setIsOpen(formatter.formatCellValue(row.getCell(12)).equalsIgnoreCase("Yes"));
            restaurant.setIsActive(formatter.formatCellValue(row.getCell(13)).equalsIgnoreCase("Yes"));
            restaurant.setIsVeg(formatter.formatCellValue(row.getCell(14)).equalsIgnoreCase("Yes"));
            restaurant.setIsPureVeg(formatter.formatCellValue(row.getCell(15)).equalsIgnoreCase("Yes"));
            restaurant.setOpeningHours(formatter.formatCellValue(row.getCell(16)));

            // Delivery radius
            String radiusStr = formatter.formatCellValue(row.getCell(17));
            try {
                restaurant.setDeliveryRadiusKm(radiusStr.isEmpty() ? 0 : Integer.parseInt(radiusStr));
            } catch (NumberFormatException e) {
                restaurant.setDeliveryRadiusKm(0);
            }

            // Latitude & Longitude
            String latStr = formatter.formatCellValue(row.getCell(18));
            restaurant.setLatitude(latStr.isEmpty() ? 0 : Double.parseDouble(latStr));

            String lonStr = formatter.formatCellValue(row.getCell(19));
            restaurant.setLongitude(lonStr.isEmpty() ? 0 : Double.parseDouble(lonStr));

            restaurant.setTags(formatter.formatCellValue(row.getCell(20)));

            // Opening / Closing Time
            restaurant.setOpeningTime(parseTimeCell(row.getCell(21), formatter));
            restaurant.setClosingTime(parseTimeCell(row.getCell(22), formatter));

            String ownerIdStr = formatter.formatCellValue(row.getCell(23));
            restaurant.setOwnerId(ownerIdStr.isEmpty() ? null : Long.parseLong(ownerIdStr));

            restaurant.setStatus(RestaurantStatus.APPROVED);
            restaurant.setMenuCategories(new ArrayList<>());

            map.put(restaurant.getName(), restaurant);
        }

        return map;
    }

    // Helper method to safely parse time
    private LocalTime parseTimeCell(Cell cell, DataFormatter formatter) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                Date timeValue = DateUtil.getJavaDate(cell.getNumericCellValue());
                return timeValue.toInstant().atZone(ZoneId.systemDefault()).toLocalTime().withSecond(0).withNano(0);
            } else {
                String timeStr = formatter.formatCellValue(cell).trim();
                DateTimeFormatter fmt = timeStr.toUpperCase().contains("AM") || timeStr.toUpperCase().contains("PM")
                        ? DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH)
                        : DateTimeFormatter.ofPattern("HH:mm", Locale.ENGLISH);
                return LocalTime.parse(timeStr, fmt);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not parse time: " + cell + " → " + e.getMessage());
            return null;
        }
    }

    
    
    private Map<String, List<MenuCategory>> parseCategories(Sheet sheet, Map<String, Restaurant> restaurantMap) {
        Map<String, List<MenuCategory>> categoryMap = new HashMap<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String restaurantName = row.getCell(0).getStringCellValue();
            String categoryName = row.getCell(1).getStringCellValue();

            Restaurant restaurant = restaurantMap.get(restaurantName);
            if (restaurant == null) continue;

            MenuCategory category = new MenuCategory();
            category.setName(categoryName);
            category.setMenuItems(new ArrayList<>()); // Initialize list

            // Add category to restaurant list (handled by @JoinColumn)
            restaurant.getMenuCategories().add(category);

            categoryMap.computeIfAbsent(restaurantName, k -> new ArrayList<>()).add(category);
        }

        return categoryMap;
    }

    private void parseMenuItems(Sheet sheet, Map<String, List<MenuCategory>> categoryMap) {
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String restaurantName = row.getCell(0).getStringCellValue();
            String categoryName = row.getCell(1).getStringCellValue();

            List<MenuCategory> categories = categoryMap.get(restaurantName);
            if (categories == null) continue;

            MenuCategory category = categories.stream()
                    .filter(c -> c.getName().equalsIgnoreCase(categoryName))
                    .findFirst()
                    .orElse(null);

            if (category == null) continue;

            MenuItem item = new MenuItem();
            item.setName(row.getCell(2).getStringCellValue());
            item.setDescription(row.getCell(3).getStringCellValue());
            item.setPrice(row.getCell(4).getNumericCellValue());
            item.setImageUrl(row.getCell(5).getStringCellValue());
            item.setInStock(row.getCell(6).getStringCellValue().equalsIgnoreCase("Yes"));
            item.setOriginalPrice(row.getCell(7).getNumericCellValue());
            item.setIsVeg(row.getCell(8).getStringCellValue().equalsIgnoreCase("Yes"));
            item.setIsPopular(row.getCell(9).getStringCellValue().equalsIgnoreCase("Yes"));
            item.setPreparationTime((int) row.getCell(10).getNumericCellValue());
            item.setCustomizationJson(row.getCell(11).getStringCellValue());
            item.setNutritionJson(row.getCell(12).getStringCellValue());

            // Add item to category list (handled by @JoinColumn)
            category.getMenuItems().add(item);
        }
    }

    /**
     * Generate Excel Template for Admin Reference
     */
    public ResponseEntity<byte[]> generateRestaurantTemplate() throws IOException {
        Workbook workbook = new XSSFWorkbook();

        /**
         * ======================
         * Sheet 1: Restaurants
         * ======================
         */
        Sheet restaurantSheet = workbook.createSheet("Restaurants");
        String[] restaurantHeaders = {
            "Name", "CuisineType", "Address", "ContactNumber", "Description",
            "Image", "CoverImage", "Rating", "TotalRatings", "DeliveryTime",
            "DeliveryFee", "MinimumOrder", "IsOpen (Yes/No)", "IsActive (Yes/No)",
            "IsVeg (Yes/No)", "IsPureVeg (Yes/No)", "OpeningHours",
            "DeliveryRadiusKm", "Latitude", "Longitude", "Tags",
            "OpeningTime (HH:mm)", "ClosingTime (HH:mm)", "OwnerId", "Status"
        };

        Row restaurantHeaderRow = restaurantSheet.createRow(0);
        for (int i = 0; i < restaurantHeaders.length; i++) {
            Cell cell = restaurantHeaderRow.createCell(i);
            cell.setCellValue(restaurantHeaders[i]);
        }

        /**
         * ======================
         * Sheet 2: MenuCategories
         * ======================
         */
        Sheet categorySheet = workbook.createSheet("MenuCategories");
        String[] categoryHeaders = {
            "RestaurantName", "CategoryName"
        };

        Row categoryHeaderRow = categorySheet.createRow(0);
        for (int i = 0; i < categoryHeaders.length; i++) {
            Cell cell = categoryHeaderRow.createCell(i);
            cell.setCellValue(categoryHeaders[i]);
        }

        /**
         * ======================
         * Sheet 3: MenuItems
         * ======================
         */
        Sheet itemSheet = workbook.createSheet("MenuItems");
        String[] itemHeaders = {
            "RestaurantName", "CategoryName", "ItemName", "Description", "Price",
            "ImageUrl", "InStock (Yes/No)", "OriginalPrice", "IsVeg (Yes/No)",
            "IsPopular (Yes/No)", "PreparationTime (mins)", "CustomizationJson", "NutritionJson"
        };

        Row itemHeaderRow = itemSheet.createRow(0);
        for (int i = 0; i < itemHeaders.length; i++) {
            Cell cell = itemHeaderRow.createCell(i);
            cell.setCellValue(itemHeaders[i]);
        }

        // Auto-size all columns for each sheet
        for (Sheet sheet : List.of(restaurantSheet, categorySheet, itemSheet)) {
            for (int i = 0; i < sheet.getRow(0).getLastCellNum(); i++) {
                sheet.autoSizeColumn(i);
            }
        }

        // Write to byte array
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        // Set response headers
        HttpHeaders headersResp = new HttpHeaders();
        headersResp.add("Content-Disposition", "attachment; filename=restaurant_import_template.xlsx");

        return ResponseEntity.ok()
                .headers(headersResp)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(out.toByteArray());
    }

}