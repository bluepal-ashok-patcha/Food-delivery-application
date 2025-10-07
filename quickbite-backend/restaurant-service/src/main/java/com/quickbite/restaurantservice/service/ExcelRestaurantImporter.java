package com.quickbite.restaurantservice.service;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import com.quickbite.restaurantservice.dto.MenuCategoryDto;
import com.quickbite.restaurantservice.dto.MenuItemDto;
import com.quickbite.restaurantservice.dto.ParsedRestaurant;
import com.quickbite.restaurantservice.dto.RestaurantDto;
import com.quickbite.restaurantservice.entity.RestaurantStatus;

@Component
public class ExcelRestaurantImporter {

    public List<ParsedRestaurant> parse(InputStream excelStream) throws IOException {
        Workbook wb = new XSSFWorkbook(excelStream);
        Sheet restaurantsSheet = wb.getSheet("Restaurants");
        Sheet menusSheet = wb.getSheet("Menus");

        if (restaurantsSheet == null) {
            throw new IllegalArgumentException("Restaurants sheet is missing");
        }

        // Map key = name.trim().toLowerCase() + "|" + contactNumber.trim()
        Map<String, ParsedRestaurant> map = new LinkedHashMap<>();

        // Parse Restaurants sheet: header -> colIndex
        Map<String, Integer> restHeader = buildHeaderIndex(restaurantsSheet);
        for (int r = restaurantsSheet.getFirstRowNum() + 1; r <= restaurantsSheet.getLastRowNum(); r++) {
            Row row = restaurantsSheet.getRow(r);
            if (row == null) continue;
            String name = getCellString(row, restHeader.get("name"));
            String contactNumber = getCellString(row, restHeader.get("contactnumber"));
            if (isBlank(name) && isBlank(contactNumber)) continue;

            RestaurantDto dto = new RestaurantDto();
            // Important: do not set dto.id
            dto.setName(name);
            dto.setAddress(getCellString(row, restHeader.get("address")));
            dto.setContactNumber(contactNumber);
            dto.setCuisineType(getCellString(row, restHeader.get("cuisinetype")));
            dto.setOpeningTime(parseLocalTime(getCellString(row, restHeader.get("openingtime"))));
            dto.setClosingTime(parseLocalTime(getCellString(row, restHeader.get("closingtime"))));
            dto.setDescription(getCellString(row, restHeader.get("description")));
            dto.setImage(getCellString(row, restHeader.get("image")));
            dto.setCoverImage(getCellString(row, restHeader.get("coverimage")));
            dto.setRating(parseDoubleOrNull(getCellString(row, restHeader.get("rating"))));
            dto.setTotalRatings(parseIntegerOrNull(getCellString(row, restHeader.get("totalratings"))));
            dto.setDeliveryTime(getCellString(row, restHeader.get("deliverytime")));
            dto.setDeliveryFee(parseDoubleOrNull(getCellString(row, restHeader.get("deliveryfee"))));
            dto.setMinimumOrder(parseDoubleOrNull(getCellString(row, restHeader.get("minimumorder"))));
            dto.setIsOpen(parseBooleanOrNull(getCellString(row, restHeader.get("isopen"))));
            dto.setIsActive(parseBooleanOrNull(getCellString(row, restHeader.get("isactive"))));
            dto.setIsVeg(parseBooleanOrNull(getCellString(row, restHeader.get("isveg"))));
            dto.setIsPureVeg(parseBooleanOrNull(getCellString(row, restHeader.get("ispureveg"))));
            dto.setOpeningHours(getCellString(row, restHeader.get("openinghours")));
            dto.setDeliveryRadiusKm(parseIntegerOrNull(getCellString(row, restHeader.get("deliveryradiuskm"))));
            dto.setLatitude(parseDoubleOrNull(getCellString(row, restHeader.get("latitude"))));
            dto.setLongitude(parseDoubleOrNull(getCellString(row, restHeader.get("longitude"))));
            dto.setTags(getCellString(row, restHeader.get("tags")));
            dto.setOwnerId(parseLongOrNull(getCellString(row, restHeader.get("ownerid"))));
            dto.setStatus(parseRestaurantStatus(getCellString(row, restHeader.get("status"))));

            // We'll attach menuCategories after parsing Menus sheet.
            dto.setMenuCategories(new ArrayList<>());

            String key = makeKey(name, contactNumber);
            ParsedRestaurant pr = new ParsedRestaurant();
            pr.setRestaurantDto(dto);
            pr.setRowNumber(r + 1); // +1 to match Excel's 1-based row numbers
            map.put(key, pr);
        }

        // Parse Menus sheet (if present)
        if (menusSheet != null) {
            Map<String, Integer> menuHeader = buildHeaderIndex(menusSheet);
            for (int r = menusSheet.getFirstRowNum() + 1; r <= menusSheet.getLastRowNum(); r++) {
                Row row = menusSheet.getRow(r);
                if (row == null) continue;
                String restaurantName = getCellString(row, menuHeader.get("restaurantname"));
                String restaurantContact = getCellString(row, menuHeader.get("restaurantcontactnumber"));
                if (isBlank(restaurantName) && isBlank(restaurantContact)) continue;
                String key = makeKey(restaurantName, restaurantContact);
                ParsedRestaurant pr = map.get(key);
                if (pr == null) {
                    // skip or collect as error — for now attach to a phantom key? We'll skip and caller will notice menu orphaned
                    continue;
                }

                String categoryName = getCellString(row, menuHeader.get("categoryname"));
                String itemName = getCellString(row, menuHeader.get("itemname"));
                if (isBlank(categoryName) || isBlank(itemName)) continue;

                MenuItemDto item = new MenuItemDto();
                item.setName(itemName);
                item.setDescription(getCellString(row, menuHeader.get("itemdescription")));
                item.setPrice(parseDoubleOrNull(getCellString(row, menuHeader.get("price"))));
                item.setImageUrl(getCellString(row, menuHeader.get("imageurl")));
                Boolean inStock = parseBooleanOrNull(getCellString(row, menuHeader.get("instock")));
                if (inStock != null) item.setInStock(inStock);
                item.setOriginalPrice(parseDoubleOrNull(getCellString(row, menuHeader.get("originalprice"))));
                item.setIsVeg(parseBooleanOrNull(getCellString(row, menuHeader.get("isveg"))));
                item.setIsPopular(parseBooleanOrNull(getCellString(row, menuHeader.get("ispopular"))));
                item.setPreparationTime(parseIntegerOrNull(getCellString(row, menuHeader.get("preparationtime"))));
                item.setCustomizationJson(getCellString(row, menuHeader.get("customizationjson")));
                item.setNutritionJson(getCellString(row, menuHeader.get("nutritionjson")));

                // Find (or create) the category in pr.getRestaurantDto().getMenuCategories()
                List<MenuCategoryDto> categories = pr.getRestaurantDto().getMenuCategories();
                Optional<MenuCategoryDto> catOpt = categories.stream()
                        .filter(c -> categoryName.equalsIgnoreCase(c.getName()))
                        .findFirst();
                MenuCategoryDto category;
                if (catOpt.isPresent()) {
                    category = catOpt.get();
                } else {
                    category = new MenuCategoryDto();
                    category.setName(categoryName);
                    category.setMenuItems(new ArrayList<>());
                    categories.add(category);
                }
                category.getMenuItems().add(item);
            }
        }

        wb.close();
        return new ArrayList<>(map.values());
    }

    // ------------------- helpers --------------------
    private Map<String,Integer> buildHeaderIndex(Sheet sheet) {
        Map<String,Integer> map = new HashMap<>();
        Row header = sheet.getRow(sheet.getFirstRowNum());
        if (header == null) return map;
        for (Cell c : header) {
            String h = c.getStringCellValue().trim().toLowerCase();
            map.put(h, c.getColumnIndex());
        }
        return map;
    }

    private String getCellString(Row row, Integer colIdx) {
        if (colIdx == null) return null;
        Cell cell = row.getCell(colIdx);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            if (DateUtil.isCellDateFormatted(cell)) {
                // turn into HH:mm:ss if it is a time
                LocalTime t = cell.getLocalDateTimeCellValue().toLocalTime();
                return t.toString();
            } else {
                // remove trailing .0 for integer-like numbers if needed
                double d = cell.getNumericCellValue();
                if (d == (long) d) {
                    return String.valueOf((long) d);
                } else {
                    return String.valueOf(d);
                }
            }
        } else if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        } else if (cell.getCellType() == CellType.FORMULA) {
            try { return cell.getStringCellValue(); } catch (Exception e) { return String.valueOf(cell.getNumericCellValue()); }
        } else {
            return null;
        }
    }

    private String makeKey(String name, String contact) {
        return (name == null ? "" : name.trim().toLowerCase()) + "|" + (contact == null ? "" : contact.trim());
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }

    private LocalTime parseLocalTime(String s) {
        if (isBlank(s)) return null;
        try {
            if (s.length() <=5) { // HH:mm
                return LocalTime.parse(s, DateTimeFormatter.ofPattern("H:mm"));
            } else if (s.length() == 8) { // HH:mm:ss
                return LocalTime.parse(s);
            } else {
                return LocalTime.parse(s); // fallback
            }
        } catch (Exception e) {
            try {
                return LocalTime.parse(s, DateTimeFormatter.ofPattern("h:mm a")); // e.g. 9:00 AM
            } catch (Exception ex) {
                return null;
            }
        }
    }

    private Double parseDoubleOrNull(String s) {
        if (isBlank(s)) return null;
        try { return Double.parseDouble(s); } catch (Exception e) { return null; }
    }

    private Integer parseIntegerOrNull(String s) {
        if (isBlank(s)) return null;
        try { return Integer.parseInt(s); } catch (Exception e) { Double d = parseDoubleOrNull(s); return d == null ? null : d.intValue(); }
    }

    private Long parseLongOrNull(String s) {
        if (isBlank(s)) return null;
        try { return Long.parseLong(s); } catch (Exception e) { Double d = parseDoubleOrNull(s); return d == null ? null : d.longValue(); }
    }

    private Boolean parseBooleanOrNull(String s) {
        if (isBlank(s)) return null;
        s = s.trim().toLowerCase();
        if (s.equals("true") || s.equals("yes") || s.equals("1")) return true;
        if (s.equals("false") || s.equals("no") || s.equals("0")) return false;
        return null;
    }

    private RestaurantStatus parseRestaurantStatus(String s) {
        if (isBlank(s)) return null;
        try { return RestaurantStatus.valueOf(s.trim().toUpperCase()); } catch (Exception e) { return null; }
    }
}

