package com.quickbite.authservice.controller;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.quickbite.authservice.dto.AdminUserUpdateRequest;
import com.quickbite.authservice.dto.ApiResponse;
import com.quickbite.authservice.dto.UserRegistrationRequestDto;
import com.quickbite.authservice.entity.User;
import com.quickbite.authservice.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> listUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.<List<User>>builder()
            .success(true)
            .message("Users fetched successfully")
            .data(users)
            .build());
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest req) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (req.getName() != null) user.setName(req.getName());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getRole() != null) user.setRole(req.getRole());
        if (req.getActive() != null) user.setActive(req.getActive());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.<User>builder()
            .success(true)
            .message("User updated successfully")
            .data(saved)
            .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody UserRegistrationRequestDto req, @RequestParam(defaultValue = "CUSTOMER") String role) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return new ResponseEntity<>(ApiResponse.<User>builder()
                .success(false)
                .message("User with this email already exists")
                .data(null)
                .build(), HttpStatus.CONFLICT);
        }
        User user = User.builder()
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .role(role)
            .name(req.getName())
            .phone(req.getPhone())
            .active(true)
            .build();
        User saved = userRepository.save(user);
        return new ResponseEntity<>(ApiResponse.<User>builder()
            .success(true)
            .message("User created successfully")
            .data(saved)
            .build(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> activate(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        return new ResponseEntity<>(ApiResponse.<User>builder()
            .success(true)
            .message("User activated")
            .data(userRepository.save(user))
            .build(), HttpStatus.OK);
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> deactivate(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        return new ResponseEntity<>(ApiResponse.<User>builder()
            .success(true)
            .message("User deactivated")
            .data(userRepository.save(user))
            .build(), HttpStatus.OK);
    }
    
    // new method added -----------------------------------------------------------------------------------
    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> importUsers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                    .success(false)
                    .message("Please upload a valid Excel file.")
                    .build());
        }

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<User> users = new ArrayList<>();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skip header row
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String name = row.getCell(0).getStringCellValue();
                String email = row.getCell(1).getStringCellValue();
                String password = row.getCell(2).getStringCellValue();
                String phone = row.getCell(3).getStringCellValue();
                String role = row.getCell(4).getStringCellValue();

                if (userRepository.findByEmail(email).isPresent()) continue; // skip existing

                User user = User.builder()
                        .name(name)
                        .email(email)
                        .password(passwordEncoder.encode(password))
                        .phone(phone)
                        .role(role != null ? role.toUpperCase() : "CUSTOMER")
                        .active(true)
                        .build();
                users.add(user);
            }

            userRepository.saveAll(users);

            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message(users.size() + " users imported successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.<String>builder()
                    .success(false)
                    .message("Error importing users: " + e.getMessage())
                    .build());
        }
    }
      
    @GetMapping("/export/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportUsersToPdf() {
        List<User> users = userRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(User::getRole))
                .toList();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Paragraph title = new Paragraph("User Report (Grouped by Role)", new Font(Font.HELVETICA, 18, Font.BOLD));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("Generated on: " + java.time.LocalDateTime.now()));
            document.add(new Paragraph(" "));
            
            // Distinct roles
            List<String> distinctRoles = users.stream()
                    .map(User::getRole)
                    .distinct()
                    .sorted()
                    .toList();

            for (String role : distinctRoles) {
                List<User> roleUsers = users.stream()
                        .filter(u -> u.getRole().equalsIgnoreCase(role))
                        .toList();

                // Role section header
                Paragraph roleHeader = new Paragraph(role.toUpperCase() + " USERS", new Font(Font.HELVETICA, 14, Font.BOLD, new Color(0, 102, 204)));
                roleHeader.setSpacingBefore(15);
                roleHeader.setSpacingAfter(8);
                document.add(roleHeader);

                // Create table (5 columns, custom widths)
                float[] columnWidths = {1.2f, 3.0f, 4.0f, 2.5f, 1.2f};
                PdfPTable table = new PdfPTable(columnWidths);
                table.setWidthPercentage(100);

                // Header background color depends on role
                Color headerColor = switch (role.toUpperCase()) {
                    case "ADMIN" -> new Color(255, 153, 51); // Orange
                    case "CUSTOMER" -> new Color(102, 204, 255); // Light blue
                    case "DELIVERY_PARTNER" -> new Color(153, 255, 153); // Light green
                    case "RESTAURANT_OWNER" -> new Color(255, 204, 204); // Light pink
                    default -> new Color(230, 230, 230); // Gray fallback
                };

                Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.BLACK);

                // Add headers
                addHeaderCell(table, "ID", headerFont, headerColor);
                addHeaderCell(table, "Name", headerFont, headerColor);
                addHeaderCell(table, "Email", headerFont, headerColor);
                addHeaderCell(table, "Role", headerFont, headerColor);
                addHeaderCell(table, "Active", headerFont, headerColor);

                Font cellFont = new Font(Font.HELVETICA, 11);

                for (User user : roleUsers) {
                    table.addCell(new Phrase(String.valueOf(user.getId()), cellFont));
                    table.addCell(new Phrase(user.getName() != null ? user.getName() : "-", cellFont));
                    table.addCell(new Phrase(user.getEmail(), cellFont));
                    table.addCell(new Phrase(user.getRole(), cellFont));
                    table.addCell(new Phrase(user.isActive() ? "Yes" : "No", cellFont));
                }

                document.add(table);
            }

            document.close();
            byte[] pdfBytes = out.toByteArray();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=users_grouped_by_role.pdf")
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // helper method
    private void addHeaderCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        table.addCell(cell);
    }


    @GetMapping("/export/pdf/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportUsersByRole(@PathVariable String role) {
        List<User> users = userRepository.findByRoleIgnoreCase(role);

        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(("No users found for role: " + role).getBytes());
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // ===== Title =====
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.WHITE);
            PdfPTable titleTable = new PdfPTable(1);
            titleTable.setWidthPercentage(100);
            PdfPCell titleCell = new PdfPCell(new Phrase("User List for Role: " + role.toUpperCase(), titleFont));
            titleCell.setBackgroundColor(new Color(44, 62, 80));
            titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            titleCell.setPadding(15f);
            titleCell.setBorderColor(Color.WHITE);
            titleTable.addCell(titleCell);
            document.add(titleTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Generated Report — Role: " + role.toUpperCase()));
            document.add(new Paragraph(" "));

            // ===== Table Setup =====
            float[] columnWidths = {2.5f, 3.5f, 2.5f, 1.2f};
            PdfPTable table = new PdfPTable(columnWidths);
            table.setWidthPercentage(100);

            // ===== Table Header =====
            Font headerFont = new Font(Font.HELVETICA, 13, Font.BOLD, Color.WHITE);
            String[] headers = {"Name", "Email", "Phone", "Active"};
            Color headerColor = new Color(52, 152, 219);

            for (String header : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(header, headerFont));
                headerCell.setBackgroundColor(headerColor);
                headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                headerCell.setPadding(10f);
                headerCell.setBorderColor(Color.WHITE);
                table.addCell(headerCell);
            }

            // ===== Table Rows =====
            Font cellFont = new Font(Font.HELVETICA, 12, Font.NORMAL, Color.BLACK);
            Color evenRowColor = new Color(236, 240, 241);
            boolean alternate = false;

            for (User user : users) {
                Color bgColor = alternate ? evenRowColor : Color.WHITE;
                addStyledCell(table, user.getName(), cellFont, bgColor);
                addStyledCell(table, user.getEmail(), cellFont, bgColor);
                addStyledCell(table, user.getPhone(), cellFont, bgColor);
                addStyledCell(table, user.isActive() ? "Yes" : "No", cellFont, bgColor);
                alternate = !alternate;
            }

            document.add(table);
            document.close();

            byte[] pdfBytes = out.toByteArray();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=users_" + role.toLowerCase() + ".pdf")
                    .body(pdfBytes);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Utility method to style a PDF cell consistently.
     */
    private void addStyledCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(8f);
        cell.setBorderColor(Color.LIGHT_GRAY);
        table.addCell(cell);
    }

}


