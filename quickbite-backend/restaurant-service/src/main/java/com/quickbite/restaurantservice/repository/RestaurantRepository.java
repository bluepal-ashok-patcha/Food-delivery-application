package com.quickbite.restaurantservice.repository;

import com.quickbite.restaurantservice.entity.Restaurant;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    Optional<Restaurant> findByOwnerId(Long ownerId);
    List<Restaurant> findByStatus(RestaurantStatus status);
    Page<Restaurant> findByStatus(RestaurantStatus status, Pageable pageable);
    Page<Restaurant> findByNameContainingIgnoreCaseOrCuisineTypeContainingIgnoreCase(String name, String cuisineType, Pageable pageable);
    List<Restaurant> findByRatingIsNull();
    

    @Query(
    	      value = "SELECT DISTINCT r FROM Restaurant r " +
    	              "LEFT JOIN r.menuCategories mc " +
    	              "LEFT JOIN mc.menuItems mi " +
    	              "WHERE ( :search IS NULL OR :search = '' " +
    	              "   OR LOWER(r.name) LIKE CONCAT('%', LOWER(:search), '%') " +
    	              "   OR LOWER(r.cuisineType) LIKE CONCAT('%', LOWER(:search), '%') " +
    	              "   OR LOWER(mi.name) LIKE CONCAT('%', LOWER(:search), '%') " +
    	              "   OR LOWER(mi.description) LIKE CONCAT('%', LOWER(:search), '%') ) " +
    	              "AND ( :isPureVeg IS NULL OR r.isPureVeg = :isPureVeg )",
    	      countQuery = "SELECT COUNT(DISTINCT r.id) FROM Restaurant r " +
    	                   "LEFT JOIN r.menuCategories mc " +
    	                   "LEFT JOIN mc.menuItems mi " +
    	                   "WHERE ( :search IS NULL OR :search = '' " +
    	                   "   OR LOWER(r.name) LIKE CONCAT('%', LOWER(:search), '%') " +
    	                   "   OR LOWER(r.cuisineType) LIKE CONCAT('%', LOWER(:search), '%') " +
    	                   "   OR LOWER(mi.name) LIKE CONCAT('%', LOWER(:search), '%') " +
    	                   "   OR LOWER(mi.description) LIKE CONCAT('%', LOWER(:search), '%') ) " +
    	                   "AND ( :isPureVeg IS NULL OR r.isPureVeg = :isPureVeg )"
    	    )
    	    Page<Restaurant> searchByNameCuisineOrMenuItems(
    	            @Param("search") String search,
    	            @Param("isPureVeg") Boolean isPureVeg,
    	            Pageable pageable
    	    );
}