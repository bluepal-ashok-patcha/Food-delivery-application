package com.quickbite.deliveryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private PageMeta page;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageMeta {
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private int size;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}