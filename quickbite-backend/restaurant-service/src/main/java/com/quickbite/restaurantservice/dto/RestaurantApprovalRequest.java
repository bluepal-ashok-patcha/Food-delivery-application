package com.quickbite.restaurantservice.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantApprovalRequest {

    @Size(max = 500, message = "Approval notes cannot exceed 500 characters")
    private String approvalNotes;

    @Size(max = 500, message = "Rejection reason cannot exceed 500 characters")
    private String rejectionReason;

    private String adminComments;
}
