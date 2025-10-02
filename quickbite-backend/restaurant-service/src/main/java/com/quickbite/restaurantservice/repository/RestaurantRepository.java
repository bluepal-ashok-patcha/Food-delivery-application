package com.quickbite.restaurantservice.repository;

import com.quickbite.restaurantservice.entity.Restaurant;
import com.quickbite.restaurantservice.entity.RestaurantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    Optional<Restaurant> findByOwnerId(Long ownerId);
    List<Restaurant> findByStatus(RestaurantStatus status);
    Page<Restaurant> findByStatus(RestaurantStatus status, Pageable pageable);
    Page<Restaurant> findByNameContainingIgnoreCaseOrCuisineTypeContainingIgnoreCase(String name, String cuisineType, Pageable pageable);
}