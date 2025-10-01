package com.quickbite.restaurantservice.service;

import com.quickbite.restaurantservice.dto.MenuCategoryDto;
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

    // --- Restaurant Management ---

    @Transactional
    public RestaurantDto createRestaurant(RestaurantDto restaurantDto) {
        restaurantDto.setStatus(RestaurantStatus.PENDING_APPROVAL);
        Restaurant restaurant = convertToEntity(restaurantDto);
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        log.info("New restaurant '{}' created with PENDING_APPROVAL status.", savedRestaurant.getName());
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
        restaurant.setStatus(status);
        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant '{}' status updated to {}.", updatedRestaurant.getName(), status);
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
}