package com.quickbite.paymentservice.service;

import com.quickbite.paymentservice.dto.CouponDto;
import com.quickbite.paymentservice.dto.CouponValidationRequest;
import com.quickbite.paymentservice.dto.CouponValidationResponse;
import com.quickbite.paymentservice.entity.Coupon;
import com.quickbite.paymentservice.entity.CouponType;
import com.quickbite.paymentservice.entity.CouponUsage;
import com.quickbite.paymentservice.repository.CouponRepository;
import com.quickbite.paymentservice.repository.CouponUsageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponUsageRepository couponUsageRepository;

    @Transactional
    public CouponDto createCoupon(CouponDto couponDto, Long createdBy) {
        // Check if coupon code already exists
        if (couponRepository.findByCodeAndIsActiveTrue(couponDto.getCode()).isPresent()) {
            throw new RuntimeException("Coupon code already exists");
        }

        Coupon coupon = new Coupon();
        BeanUtils.copyProperties(couponDto, coupon, "id", "createdAt", "updatedAt", "currentUsageCount");
        coupon.setCreatedBy(createdBy);
        coupon.setCurrentUsageCount(0);
        coupon.setIsActive(true);

        Coupon savedCoupon = couponRepository.save(coupon);
        log.info("Created coupon: {} by user: {}", savedCoupon.getCode(), createdBy);

        CouponDto result = new CouponDto();
        BeanUtils.copyProperties(savedCoupon, result);
        return result;
    }

    @Transactional
    public CouponDto updateCoupon(Long couponId, CouponDto couponDto) {
        Coupon existingCoupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        // Don't allow changing code if coupon has been used
        if (!existingCoupon.getCode().equals(couponDto.getCode()) && existingCoupon.getCurrentUsageCount() > 0) {
            throw new RuntimeException("Cannot change coupon code after it has been used");
        }

        BeanUtils.copyProperties(couponDto, existingCoupon, "id", "createdAt", "updatedAt", "currentUsageCount", "createdBy");
        Coupon savedCoupon = couponRepository.save(existingCoupon);

        CouponDto result = new CouponDto();
        BeanUtils.copyProperties(savedCoupon, result);
        return result;
    }

    @Transactional
    public void deactivateCoupon(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        coupon.setIsActive(false);
        couponRepository.save(coupon);
        log.info("Deactivated coupon: {}", coupon.getCode());
    }

    @Transactional(readOnly = true)
    public CouponDto getCouponById(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        CouponDto result = new CouponDto();
        BeanUtils.copyProperties(coupon, result);
        return result;
    }

    @Transactional(readOnly = true)
    public List<CouponDto> getAllCoupons(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Coupon> coupons = couponRepository.findByIsActiveTrue(pageable);
        return coupons.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CouponDto> getApplicableCoupons(Long restaurantId, Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<Coupon> coupons = couponRepository.findApplicableCoupons(restaurantId, userId, now);
        return coupons.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(CouponValidationRequest request) {
        try {
            Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(request.getCode())
                    .orElse(null);

            if (coupon == null) {
                return CouponValidationResponse.builder()
                        .valid(false)
                        .message("Invalid coupon code")
                        .discountAmount(BigDecimal.ZERO)
                        .finalAmount(request.getOrderAmount())
                        .build();
            }

            // Check if coupon is valid for current time
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(coupon.getValidFrom()) || now.isAfter(coupon.getValidUntil())) {
                return CouponValidationResponse.builder()
                        .valid(false)
                        .message("Coupon has expired or not yet valid")
                        .discountAmount(BigDecimal.ZERO)
                        .finalAmount(request.getOrderAmount())
                        .build();
            }

            // Check restaurant restriction
            if (coupon.getRestaurantId() != null && !coupon.getRestaurantId().equals(request.getRestaurantId())) {
                return CouponValidationResponse.builder()
                        .valid(false)
                        .message("Coupon not valid for this restaurant")
                        .discountAmount(BigDecimal.ZERO)
                        .finalAmount(request.getOrderAmount())
                        .build();
            }

            // Check user restriction
            if (coupon.getUserId() != null && !coupon.getUserId().equals(request.getUserId())) {
                return CouponValidationResponse.builder()
                        .valid(false)
                        .message("Coupon not valid for this user")
                        .discountAmount(BigDecimal.ZERO)
                        .finalAmount(request.getOrderAmount())
                        .build();
            }

            // Check minimum order amount
            if (coupon.getMinimumOrderAmount() != null && 
                request.getOrderAmount().compareTo(coupon.getMinimumOrderAmount()) < 0) {
                return CouponValidationResponse.builder()
                        .valid(false)
                        .message(String.format("Minimum order amount of $%.2f required", coupon.getMinimumOrderAmount()))
                        .discountAmount(BigDecimal.ZERO)
                        .finalAmount(request.getOrderAmount())
                        .build();
            }

            // Check total usage limit
            if (coupon.getCurrentUsageCount() >= coupon.getTotalUsageLimit()) {
                return CouponValidationResponse.builder()
                        .valid(false)
                        .message("Coupon usage limit exceeded")
                        .discountAmount(BigDecimal.ZERO)
                        .finalAmount(request.getOrderAmount())
                        .build();
            }

            // Check per-user usage limit
            Long userUsageCount = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), request.getUserId());
            if (userUsageCount >= coupon.getUsagePerUserLimit()) {
                return CouponValidationResponse.builder()
                        .valid(false)
                        .message("You have already used this coupon the maximum number of times")
                        .discountAmount(BigDecimal.ZERO)
                        .finalAmount(request.getOrderAmount())
                        .build();
            }

            // Calculate discount
            BigDecimal discountAmount = calculateDiscount(coupon, request.getOrderAmount());
            BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);

            return CouponValidationResponse.builder()
                    .valid(true)
                    .message("Coupon applied successfully")
                    .discountAmount(discountAmount)
                    .finalAmount(finalAmount)
                    .couponCode(coupon.getCode())
                    .discountType(coupon.getType().toString())
                    .couponId(coupon.getId())
                    .build();

        } catch (Exception e) {
            log.error("Error validating coupon: {}", request.getCode(), e);
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Error validating coupon")
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(request.getOrderAmount())
                    .build();
        }
    }

    @Transactional
    public void applyCoupon(Long couponId, Long userId, Long orderId, Long restaurantId, 
                           BigDecimal orderAmount, BigDecimal discountAmount) {
        // Update coupon usage count
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        coupon.setCurrentUsageCount(coupon.getCurrentUsageCount() + 1);
        couponRepository.save(coupon);

        // Record usage
        CouponUsage usage = CouponUsage.builder()
                .couponId(couponId)
                .userId(userId)
                .orderId(orderId)
                .restaurantId(restaurantId)
                .orderAmount(orderAmount)
                .discountAmount(discountAmount)
                .build();
        couponUsageRepository.save(usage);

        log.info("Applied coupon {} for user {} on order {}", coupon.getCode(), userId, orderId);
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount = BigDecimal.ZERO;

        switch (coupon.getType()) {
            case PERCENTAGE:
                discount = orderAmount.multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                break;
            case FIXED_AMOUNT:
                discount = coupon.getDiscountValue();
                break;
            case FREE_DELIVERY:
                // This would need to be handled differently based on delivery fee
                discount = BigDecimal.valueOf(3.00); // Default delivery fee
                break;
            case BOGO:
                // 50% off - simplified implementation
                discount = orderAmount.multiply(BigDecimal.valueOf(0.5));
                break;
            case COMBO_DEAL:
                discount = coupon.getDiscountValue();
                break;
        }

        // Apply maximum discount limit
        if (coupon.getMaximumDiscountAmount() != null && 
            discount.compareTo(coupon.getMaximumDiscountAmount()) > 0) {
            discount = coupon.getMaximumDiscountAmount();
        }

        // Ensure discount doesn't exceed order amount
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        return discount;
    }

    private CouponDto convertToDto(Coupon coupon) {
        CouponDto dto = new CouponDto();
        BeanUtils.copyProperties(coupon, dto);
        return dto;
    }
}
