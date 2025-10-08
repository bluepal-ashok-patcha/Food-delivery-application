package com.quickbite.restaurantservice.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
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

    @Transactional(readOnly = true)
    public Page<Restaurant> getAllRestaurantsPage(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Restaurant> resultPage;
        if (search != null && !search.isBlank()) {
            resultPage = restaurantRepository.findByNameContainingIgnoreCaseOrCuisineTypeContainingIgnoreCase(search, search, pageable);
        } else {
            resultPage = restaurantRepository.findAll(pageable);
        }
        return resultPage;
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
        BeanUtils.copyProperties(dto, entity, "id", "createdAt");
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
        
        BeanUtils.copyProperties(dto, existing, "id", "createdAt", "restaurantId", "userId");
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
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Restaurant> restaurants = restaurantRepository.findByStatus(status, pageable);
        return restaurants.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getAllRestaurants(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
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
    
    
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportRestaurantPdf(Long restaurantId) {
        RestaurantDto restaurant = getRestaurantById(restaurantId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLACK);
            Paragraph title = new Paragraph("Restaurant Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("Generated on: " + java.time.LocalDateTime.now()));
            document.add(new Paragraph(" "));

            // Restaurant Info
            document.add(new Paragraph("Name: " + restaurant.getName()));
            document.add(new Paragraph("Cuisine: " + restaurant.getCuisineType()));
            document.add(new Paragraph("Address: " + restaurant.getAddress()));
            document.add(new Paragraph("Status: " + restaurant.getStatus()));
            document.add(new Paragraph("Rating: " + restaurant.getRating()));
            document.add(new Paragraph(" "));

            // Menu Categories + Items
            Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.BLUE);
            document.add(new Paragraph("Menu", sectionFont));
            document.add(new Paragraph(" "));

            if (restaurant.getMenuCategories() != null) {
                for (var category : restaurant.getMenuCategories()) {
                    Paragraph categoryHeader = new Paragraph(category.getName(),
                            new Font(Font.HELVETICA, 13, Font.BOLD, Color.DARK_GRAY));
                    categoryHeader.setSpacingBefore(10);
                    categoryHeader.setSpacingAfter(5);
                    document.add(categoryHeader);

                    float[] widths = {3f, 6f, 2f};
                    PdfPTable table = new PdfPTable(widths);
                    table.setWidthPercentage(100);

                    addHeaderCell(table, "Item");
                    addHeaderCell(table, "Description");
                    addHeaderCell(table, "Price");

                    if (category.getMenuItems() != null) {
                        for (var item : category.getMenuItems()) {
                            table.addCell(item.getName());
                            table.addCell(item.getDescription() != null ? item.getDescription() : "-");
                            table.addCell(item.getPrice() != null ? item.getPrice().toString() : "-");
                        }
                    }

                    document.add(table);
                }
            }

            document.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=restaurant_" + restaurantId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export PDF: " + e.getMessage());
        }
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 12, Font.BOLD)));
        cell.setBackgroundColor(new Color(230, 230, 230));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    
    
   
    
 // 🟥 NEW: Export Multiple Restaurants to Excel
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportRestaurantsToExcel() {
        List<RestaurantDto> restaurants = getAllRestaurants(); // already available in your service

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Restaurants");

            // 🟥 Header Row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Name", "Address", "Contact Number", "Cuisine Type", "Owner ID", "Status"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                org.apache.poi.ss.usermodel.CellStyle headerStyle = workbook.createCellStyle();
                org.apache.poi.ss.usermodel.Font font = workbook.createFont();
                font.setBold(true);
                headerStyle.setFont(font);
                cell.setCellStyle(headerStyle);
            }

            // 🟥 Data Rows
            int rowIdx = 1;
            for (RestaurantDto dto : restaurants) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dto.getId() != null ? dto.getId() : 0);
                row.createCell(1).setCellValue(dto.getName() != null ? dto.getName() : "");
                row.createCell(2).setCellValue(dto.getAddress() != null ? dto.getAddress() : "");
                row.createCell(3).setCellValue(dto.getContactNumber() != null ? dto.getContactNumber() : "");
                row.createCell(4).setCellValue(dto.getCuisineType() != null ? dto.getCuisineType() : "");
                row.createCell(5).setCellValue(dto.getOwnerId() != null ? dto.getOwnerId() : 0);
                row.createCell(6).setCellValue(dto.getStatus() != null ? dto.getStatus().name() : "");
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=restaurants.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel: " + e.getMessage());
        }
        
        
    }
    
    
 // 🟡 NEW: Export All Restaurants to One PDF (For Admin)
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportAllRestaurantsPdf() {
        List<RestaurantDto> restaurants = getAllRestaurants();  // Existing method to get all

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLACK);
            Paragraph title = new Paragraph("All Restaurants Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("Generated on: " + java.time.LocalDateTime.now()));
            document.add(new Paragraph(" "));

            Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.BLUE);
            Font infoFont = new Font(Font.HELVETICA, 12, Font.NORMAL, Color.BLACK);

            for (RestaurantDto restaurant : restaurants) {
                // Section header for each restaurant
                Paragraph restaurantHeader = new Paragraph("Restaurant: " + restaurant.getName(), sectionFont);
                restaurantHeader.setSpacingBefore(10);
                restaurantHeader.setSpacingAfter(5);
                document.add(restaurantHeader);

                // Basic Info
                document.add(new Paragraph("Cuisine: " + (restaurant.getCuisineType() != null ? restaurant.getCuisineType() : ""), infoFont));
                document.add(new Paragraph("Address: " + (restaurant.getAddress() != null ? restaurant.getAddress() : ""), infoFont));
                document.add(new Paragraph("Status: " + (restaurant.getStatus() != null ? restaurant.getStatus() : ""), infoFont));
                document.add(new Paragraph("Rating: " + (restaurant.getRating() != null ? restaurant.getRating() : "N/A"), infoFont));
                document.add(new Paragraph(" "));

                // Menu Table (if exists)
                if (restaurant.getMenuCategories() != null) {
                    for (var category : restaurant.getMenuCategories()) {
                        Paragraph categoryHeader = new Paragraph("Category: " + category.getName(),
                                new Font(Font.HELVETICA, 13, Font.BOLD, Color.DARK_GRAY));
                        categoryHeader.setSpacingBefore(5);
                        categoryHeader.setSpacingAfter(3);
                        document.add(categoryHeader);

                        float[] widths = {3f, 6f, 2f};
                        PdfPTable table = new PdfPTable(widths);
                        table.setWidthPercentage(100);

                        addHeaderCell(table, "Item");
                        addHeaderCell(table, "Description");
                        addHeaderCell(table, "Price");

                        if (category.getMenuItems() != null) {
                            for (var item : category.getMenuItems()) {
                                table.addCell(item.getName() != null ? item.getName() : "");
                                table.addCell(item.getDescription() != null ? item.getDescription() : "-");
                                table.addCell(item.getPrice() != null ? item.getPrice().toString() : "-");
                            }
                        }

                        document.add(table);
                    }
                }

                // Line separator between restaurants
                document.add(new Paragraph("------------------------------------------------------------"));
            }

            document.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=all_restaurants.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export all restaurants PDF: " + e.getMessage());
        }
    }

   
 // 🟡 NEW: Admin can download ALL Restaurants PDF in one go
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> adminDownloadAllRestaurantsPdf() {
        List<RestaurantDto> restaurants = getAllRestaurants();  // Existing method

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // 🟡 Title
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLACK);
            Paragraph title = new Paragraph("All Restaurants - Admin Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("Generated on: " + java.time.LocalDateTime.now()));
            document.add(new Paragraph(" "));

            Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.BLUE);
            Font infoFont = new Font(Font.HELVETICA, 12, Font.NORMAL, Color.BLACK);

            for (RestaurantDto restaurant : restaurants) {
                // 🟡 Restaurant Header
                Paragraph restaurantHeader = new Paragraph(restaurant.getName(), sectionFont);
                restaurantHeader.setSpacingBefore(10);
                restaurantHeader.setSpacingAfter(5);
                document.add(restaurantHeader);

                document.add(new Paragraph("Cuisine: " + safe(restaurant.getCuisineType()), infoFont));
                document.add(new Paragraph("Address: " + safe(restaurant.getAddress()), infoFont));
                document.add(new Paragraph("Status: " + (restaurant.getStatus() != null ? restaurant.getStatus().toString() : "N/A"), infoFont));
                document.add(new Paragraph("Rating: " + (restaurant.getRating() != null ? restaurant.getRating().toString() : "N/A"), infoFont));
                document.add(new Paragraph(" "));

                // 🟡 Menu Categories & Items
                if (restaurant.getMenuCategories() != null) {
                    for (var category : restaurant.getMenuCategories()) {
                        Paragraph catHeader = new Paragraph("Category: " + safe(category.getName()),
                                new Font(Font.HELVETICA, 13, Font.BOLD, Color.DARK_GRAY));
                        catHeader.setSpacingBefore(5);
                        catHeader.setSpacingAfter(3);
                        document.add(catHeader);

                        float[] widths = {3f, 6f, 2f};
                        PdfPTable table = new PdfPTable(widths);
                        table.setWidthPercentage(100);

                        addHeaderCell(table, "Item");
                        addHeaderCell(table, "Description");
                        addHeaderCell(table, "Price");

                        if (category.getMenuItems() != null) {
                            for (var item : category.getMenuItems()) {
                                table.addCell(safe(item.getName()));
                                table.addCell(safe(item.getDescription()));
                                table.addCell(item.getPrice() != null ? item.getPrice().toString() : "-");
                            }
                        }

                        document.add(table);
                    }
                }

                // Separator Line
                document.add(new Paragraph("------------------------------------------------------------"));
            }

            document.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=admin_all_restaurants.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate admin PDF: " + e.getMessage());
        }
    }

    private String safe(String value) {
        return value != null ? value : "-";
    }
    
    
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportRestaurantsByOwnerPdf(Long ownerId) {
        List<RestaurantDto> restaurants = getMyRestaurants(ownerId);

        if (restaurants == null || restaurants.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(("No restaurants found for owner ID: " + ownerId).getBytes());
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLACK);
            Paragraph title = new Paragraph("Owner Report - Restaurants for Owner ID: " + ownerId, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("Generated on: " + java.time.LocalDateTime.now()));
            document.add(new Paragraph(" "));

            Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.BLUE);
            Font infoFont = new Font(Font.HELVETICA, 12, Font.NORMAL, Color.BLACK);

            for (RestaurantDto restaurant : restaurants) {
                Paragraph restaurantHeader = new Paragraph(safe(restaurant.getName()), sectionFont);
                restaurantHeader.setSpacingBefore(10);
                restaurantHeader.setSpacingAfter(5);
                document.add(restaurantHeader);

                document.add(new Paragraph("Cuisine: " + safe(restaurant.getCuisineType()), infoFont));
                document.add(new Paragraph("Address: " + safe(restaurant.getAddress()), infoFont));
                document.add(new Paragraph("Status: " + (restaurant.getStatus() != null ? restaurant.getStatus().toString() : "N/A"), infoFont));
                document.add(new Paragraph("Rating: " + (restaurant.getRating() != null ? restaurant.getRating().toString() : "N/A"), infoFont));
                document.add(new Paragraph(" "));

                if (restaurant.getMenuCategories() != null) {
                    for (var category : restaurant.getMenuCategories()) {
                        Paragraph catHeader = new Paragraph("Category: " + safe(category.getName()),
                                new Font(Font.HELVETICA, 13, Font.BOLD, Color.DARK_GRAY));
                        catHeader.setSpacingBefore(5);
                        catHeader.setSpacingAfter(3);
                        document.add(catHeader);

                        float[] widths = {3f, 6f, 2f};
                        PdfPTable table = new PdfPTable(widths);
                        table.setWidthPercentage(100);

                        addHeaderCell(table, "Item");
                        addHeaderCell(table, "Description");
                        addHeaderCell(table, "Price");

                        if (category.getMenuItems() != null) {
                            for (var item : category.getMenuItems()) {
                                table.addCell(safe(item.getName()));
                                table.addCell(safe(item.getDescription()));
                                table.addCell(item.getPrice() != null ? item.getPrice().toString() : "-");
                            }
                        }

                        document.add(table);
                    }
                }

                document.add(new Paragraph("------------------------------------------------------------"));
            }

            document.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=owner_" + ownerId + "_restaurants.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(out.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();  // 👈 This prints full error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain; charset=UTF-8")
                    .body(("Failed to generate owner PDF: " + e.getClass().getName() + " - " + e.getMessage()).getBytes());
        }

    }
}