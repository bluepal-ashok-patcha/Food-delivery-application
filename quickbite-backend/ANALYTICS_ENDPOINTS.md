# Analytics Endpoints Documentation

This document describes the analytics endpoints implemented across all microservices to support the frontend analytics requirements.

## Overview

Analytics endpoints have been implemented in the following services:
- **Restaurant Service**: Restaurant-specific analytics
- **Order Service**: Order and transaction analytics  
- **Delivery Service**: Delivery performance analytics
- **Payment Service**: Payment and revenue analytics

## Restaurant Service Analytics

### Endpoints

#### Get Restaurant Analytics
```
GET /api/restaurants/{restaurantId}/analytics?period={period}
```

**Authorization**: `RESTAURANT_OWNER`, `ADMIN`

**Parameters**:
- `restaurantId` (path): Restaurant ID
- `period` (query, optional): Time period (`today`, `week`, `month`, `year`). Default: `week`

**Response**: `AnalyticsDto`

**Features**:
- Order statistics (total, today, completion rate)
- Revenue analytics (total, today, average order value)
- Popular items analysis
- Order status distribution
- Rating analytics
- Time-based analytics (hourly, daily)
- Performance metrics (completion rate, cancellation rate, on-time delivery)

#### Get Restaurant Analytics Summary
```
GET /api/restaurants/analytics/summary?period={period}
```

**Authorization**: `ADMIN`

**Parameters**:
- `period` (query, optional): Time period. Default: `week`

**Response**: Summary analytics for all restaurants

## Order Service Analytics

### Endpoints

#### Get Order Analytics
```
GET /api/orders/analytics?period={period}
```

**Authorization**: `ADMIN`

**Parameters**:
- `period` (query, optional): Time period. Default: `week`

**Response**: `OrderAnalyticsDto`

**Features**:
- Order statistics (total, today, pending, completed, cancelled)
- Revenue statistics (total, today, average order value)
- Performance metrics (completion rate, cancellation rate, average delivery time)
- Order status distribution
- Time-based analytics (hourly, daily)
- Top restaurants by orders
- Customer analytics (total, new, average orders per customer)

#### Get Order Analytics Summary
```
GET /api/orders/analytics/summary?period={period}
```

**Authorization**: `ADMIN`

**Parameters**:
- `period` (query, optional): Time period. Default: `week`

**Response**: Summary analytics for orders

## Delivery Service Analytics

### Endpoints

#### Get Delivery Analytics
```
GET /api/delivery/analytics?period={period}
```

**Authorization**: `ADMIN`, `DELIVERY_PARTNER`

**Parameters**:
- `period` (query, optional): Time period. Default: `week`

**Response**: `DeliveryAnalyticsDto`

**Features**:
- Delivery statistics (total, today, active, completed, cancelled)
- Partner statistics (total, active, online, available)
- Performance metrics (average delivery time, on-time rate, completion rate)
- Earnings analytics (total, today, average per delivery/partner)
- Rating analytics (average rating, distribution)
- Time-based analytics (hourly, daily)
- Top performers
- Geographic analytics (zone-based delivery stats)

#### Get Delivery Analytics Summary
```
GET /api/delivery/analytics/summary?period={period}
```

**Authorization**: `ADMIN`

**Parameters**:
- `period` (query, optional): Time period. Default: `week`

**Response**: Summary analytics for delivery

## Payment Service Analytics

### Endpoints

#### Get Payment Analytics
```
GET /api/payments/analytics?period={period}
```

**Authorization**: `ADMIN`

**Parameters**:
- `period` (query, optional): Time period. Default: `week`

**Response**: `PaymentAnalyticsDto`

**Features**:
- Payment statistics (total, today, successful, failed, pending)
- Revenue statistics (total, today, average transaction value, fees, net revenue)
- Payment method analytics (distribution, success rates)
- Transaction status distribution
- Time-based analytics (hourly, daily)
- Refund analytics (total refunds, amount, rate)
- Coupon analytics (usage, discount amounts)
- Performance metrics (success rate, failure rate, processing time)

#### Get Payment Analytics Summary
```
GET /api/payments/analytics/summary?period={period}
```

**Authorization**: `ADMIN`

**Parameters**:
- `period` (query, optional): Time period. Default: `week`

**Response**: Summary analytics for payments

## Data Transfer Objects (DTOs)

### AnalyticsDto (Restaurant Service)
```java
{
  "restaurantId": Long,
  "restaurantName": String,
  "periodStart": LocalDateTime,
  "periodEnd": LocalDateTime,
  "totalOrders": Long,
  "todayOrders": Long,
  "totalRevenue": BigDecimal,
  "todayRevenue": BigDecimal,
  "averageOrderValue": Double,
  "averagePreparationTime": Double,
  "popularItems": List<PopularItemDto>,
  "orderStatusDistribution": List<OrderStatusDistributionDto>,
  "averageRating": Double,
  "totalReviews": Long,
  "ratingDistribution": List<RatingDistributionDto>,
  "hourlyOrders": List<HourlyOrderDto>,
  "dailyRevenue": List<DailyRevenueDto>,
  "completionRate": Double,
  "cancellationRate": Double,
  "onTimeDeliveryRate": Double
}
```

### OrderAnalyticsDto (Order Service)
```java
{
  "periodStart": LocalDateTime,
  "periodEnd": LocalDateTime,
  "totalOrders": Long,
  "todayOrders": Long,
  "pendingOrders": Long,
  "completedOrders": Long,
  "cancelledOrders": Long,
  "totalRevenue": BigDecimal,
  "todayRevenue": BigDecimal,
  "averageOrderValue": BigDecimal,
  "completionRate": Double,
  "cancellationRate": Double,
  "averageDeliveryTime": Double,
  "statusDistribution": List<OrderStatusCountDto>,
  "hourlyOrders": List<HourlyOrderCountDto>,
  "dailyOrders": List<DailyOrderCountDto>,
  "topRestaurants": List<RestaurantOrderCountDto>,
  "totalCustomers": Long,
  "newCustomers": Long,
  "averageOrdersPerCustomer": Double
}
```

### DeliveryAnalyticsDto (Delivery Service)
```java
{
  "periodStart": LocalDateTime,
  "periodEnd": LocalDateTime,
  "totalDeliveries": Long,
  "todayDeliveries": Long,
  "activeDeliveries": Long,
  "completedDeliveries": Long,
  "cancelledDeliveries": Long,
  "totalPartners": Long,
  "activePartners": Long,
  "onlinePartners": Long,
  "availablePartners": Long,
  "averageDeliveryTime": Double,
  "onTimeDeliveryRate": Double,
  "completionRate": Double,
  "cancellationRate": Double,
  "totalEarnings": BigDecimal,
  "todayEarnings": BigDecimal,
  "averageEarningsPerDelivery": BigDecimal,
  "averageEarningsPerPartner": BigDecimal,
  "averageRating": Double,
  "totalReviews": Long,
  "ratingDistribution": List<RatingDistributionDto>,
  "hourlyDeliveries": List<HourlyDeliveryDto>,
  "dailyDeliveries": List<DailyDeliveryDto>,
  "topPerformers": List<PartnerPerformanceDto>,
  "zoneDeliveries": List<ZoneDeliveryDto>
}
```

### PaymentAnalyticsDto (Payment Service)
```java
{
  "periodStart": LocalDateTime,
  "periodEnd": LocalDateTime,
  "totalTransactions": Long,
  "todayTransactions": Long,
  "successfulTransactions": Long,
  "failedTransactions": Long,
  "pendingTransactions": Long,
  "totalRevenue": BigDecimal,
  "todayRevenue": BigDecimal,
  "averageTransactionValue": BigDecimal,
  "totalFees": BigDecimal,
  "netRevenue": BigDecimal,
  "paymentMethodStats": List<PaymentMethodStatsDto>,
  "statusDistribution": List<TransactionStatusDto>,
  "hourlyTransactions": List<HourlyTransactionDto>,
  "dailyRevenue": List<DailyRevenueDto>,
  "totalRefunds": Long,
  "totalRefundAmount": BigDecimal,
  "refundRate": Double,
  "totalCouponsUsed": Long,
  "totalDiscountAmount": BigDecimal,
  "averageDiscountPercentage": Double,
  "successRate": Double,
  "failureRate": Double,
  "averageProcessingTime": Double
}
```

## Implementation Details

### Database Queries
All analytics services use JDBC Template for efficient database queries with:
- Aggregation functions (COUNT, SUM, AVG)
- Time-based grouping (HOUR, DATE)
- Conditional counting with CASE statements
- Percentage calculations
- Ranking and top-N queries

### Performance Considerations
- Queries are optimized for common time periods
- Indexes should be created on frequently queried columns:
  - `created_at`, `updated_at` for time-based queries
  - `restaurant_id`, `customer_id`, `partner_id` for filtering
  - `status` for status-based aggregations

### Error Handling
- Default values provided for missing data
- Graceful handling of division by zero
- Fallback values for optional fields

## Frontend Integration

These endpoints support the analytics requirements identified in the React frontend:

### Restaurant Dashboard
- Popular items analysis
- Order status distribution
- Revenue metrics
- Performance indicators

### Admin Dashboard
- System-wide analytics
- Cross-service metrics
- Performance monitoring

### Delivery Dashboard
- Partner performance metrics
- Earnings analytics
- Geographic distribution

## Usage Examples

### Get Restaurant Analytics for Current Week
```bash
GET /api/restaurants/1/analytics?period=week
Authorization: Bearer <restaurant_owner_token>
```

### Get System-wide Order Analytics for Current Month
```bash
GET /api/orders/analytics?period=month
Authorization: Bearer <admin_token>
```

### Get Delivery Analytics for Today
```bash
GET /api/delivery/analytics?period=today
Authorization: Bearer <delivery_partner_token>
```

## Security

All analytics endpoints are protected by JWT authentication and role-based authorization:
- Restaurant analytics: Restaurant owners can only access their own data
- System analytics: Admin-only access
- Delivery analytics: Admin and delivery partners can access

## Future Enhancements

1. **Real-time Analytics**: WebSocket integration for live updates
2. **Advanced Filtering**: Date range, custom filters
3. **Export Functionality**: CSV/PDF export of analytics data
4. **Caching**: Redis integration for improved performance
5. **Machine Learning**: Predictive analytics and recommendations
