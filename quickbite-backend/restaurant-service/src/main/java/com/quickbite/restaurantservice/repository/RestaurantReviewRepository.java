package com.quickbite.restaurantservice.repository;

import com.quickbite.restaurantservice.entity.RestaurantReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantReviewRepository extends JpaRepository<RestaurantReview, Long> {
    List<RestaurantReview> findByRestaurantId(Long restaurantId);
    Long countByRestaurantId(Long restaurantId);
}


