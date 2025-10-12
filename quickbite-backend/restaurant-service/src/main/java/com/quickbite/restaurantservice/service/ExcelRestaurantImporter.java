package com.quickbite.restaurantservice.service;


import com.quickbite.restaurantservice.dto.*;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.LocalTime;
import java.util.*;

@Component
public class ExcelRestaurantImporter {

    public List<ParsedRestaurant> parse(InputStream inputStream) throws Exception {
        Workbook workbook = WorkbookFactory.create(inputStream);
        Sheet sheet = workbook.getSheet("Restaurants");
        if (sheet == null) {
            throw new RuntimeException("Restaurants sheet is missing");
        }

        Iterator<Row> rows = sheet.iterator();
        if (!rows.hasNext()) return List.of();
        rows.next(); // skip header

        Map<String, ParsedRestaurant> restaurantMap = new LinkedHashMap<>();

        while (rows.hasNext()) {
            Row row = rows.next();

            String restaurantName = getString(row, 0);
            if (restaurantName == null || restaurantName.isEmpty()) continue;

            ParsedRestaurant restaurant = restaurantMap.computeIfAbsent(restaurantName, k -> {
                ParsedRestaurant r = new ParsedRestaurant();
                r.setName(getString(row, 0));
                r.setCuisineType(getString(row, 1));
                r.setAddress(getString(row, 2));
                r.setContactNumber(getString(row, 3));
                r.setDescription(getString(row, 4));
                r.setImage(getString(row, 5));
                r.setCoverImage(getString(row, 6));
                r.setRating(getDouble(row, 7));
                r.setTotalRatings(getInt(row, 8));
                r.setDeliveryTime(getString(row, 9));
                r.setDeliveryFee(getDouble(row, 10));
                r.setMinimumOrder(getDouble(row, 11));
                r.setIsOpen(getBoolean(row, 12));
                r.setIsActive(getBoolean(row, 13));
                r.setIsVeg(getBoolean(row, 14));
                r.setIsPureVeg(getBoolean(row, 15));
                r.setOpeningHours(getString(row, 16));
                r.setDeliveryRadiusKm(getInt(row, 17));
                r.setLatitude(getDouble(row, 18));
                r.setLongitude(getDouble(row, 19));
                r.setTags(getString(row, 20));
                r.setOpeningTime(getLocalTime(row, 21));
                r.setClosingTime(getLocalTime(row, 22));
                r.setOwnerId(getLong(row, 23));
                r.setStatus(getString(row, 24));
                return r;
            });

            String categoryName = getString(row, 25);
            if (categoryName == null) continue;

            ParsedMenuCategory category = restaurant.getMenuCategories().stream()
                    .filter(c -> c.getName().equalsIgnoreCase(categoryName))
                    .findFirst()
                    .orElseGet(() -> {
                        ParsedMenuCategory newCat = new ParsedMenuCategory();
                        newCat.setName(categoryName);
                        restaurant.getMenuCategories().add(newCat);
                        return newCat;
                    });

            ParsedMenuItem item = new ParsedMenuItem();
            item.setName(getString(row, 26));
            item.setDescription(getString(row, 27));
            item.setPrice(getDouble(row, 28));
            item.setImageUrl(getString(row, 29));
            item.setInStock(getBoolean(row, 30));
            item.setOriginalPrice(getDouble(row, 31));
            item.setIsVeg(getBoolean(row, 32));
            item.setIsPopular(getBoolean(row, 33));
            item.setPreparationTime(getInt(row, 34));
            item.setCustomizationJson(getString(row, 35));
            item.setNutritionJson(getString(row, 36));

            category.getMenuItems().add(item);
        }

        workbook.close();
        return new ArrayList<>(restaurantMap.values());
    }

    private String getString(Row row, int index) {
        Cell cell = row.getCell(index);
        return (cell != null) ? cell.toString().trim() : null;
    }

    private Double getDouble(Row row, int index) {
        try {
            return row.getCell(index).getNumericCellValue();
        } catch (Exception e) {
            try { return Double.parseDouble(getString(row, index)); }
            catch (Exception ignored) { return null; }
        }
    }

    private Long getLong(Row row, int index) {
        Double val = getDouble(row, index);
        return val != null ? val.longValue() : null;
    }

    private Integer getInt(Row row, int index) {
        Double val = getDouble(row, index);
        return val != null ? val.intValue() : null;
    }

    private Boolean getBoolean(Row row, int index) {
        String val = getString(row, index);
        if (val == null) return null;
        return val.equalsIgnoreCase("true") || val.equalsIgnoreCase("yes") || val.equals("1");
    }

    private LocalTime getLocalTime(Row row, int index) {
        String val = getString(row, index);
        if (val == null) return null;
        try {
            return LocalTime.parse(val);
        } catch (Exception e) {
            return null;
        }
    }
}
