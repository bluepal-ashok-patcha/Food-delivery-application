//package com.quickbite.authservice.service;
//
//import java.awt.Color;
//import java.io.ByteArrayOutputStream;
//import java.util.ArrayList;
//import java.util.Comparator;
//import java.util.List;
//import java.util.stream.Collectors;
//
//import org.apache.poi.ss.usermodel.Cell;
//import org.apache.poi.ss.usermodel.CellType;
//import org.apache.poi.ss.usermodel.Row;
//import org.apache.poi.ss.usermodel.Sheet;
//import org.apache.poi.ss.usermodel.Workbook;
//import org.apache.poi.ss.usermodel.WorkbookFactory;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import com.lowagie.text.Document;
//import com.lowagie.text.Element;
//import com.lowagie.text.Font;
//import com.lowagie.text.PageSize;
//import com.lowagie.text.Paragraph;
//import com.lowagie.text.Phrase;
//import com.lowagie.text.pdf.PdfPCell;
//import com.lowagie.text.pdf.PdfPTable;
//import com.lowagie.text.pdf.PdfWriter;
//import com.quickbite.authservice.dto.AdminUserUpdateRequest;
//import com.quickbite.authservice.dto.ApiResponse;
//import com.quickbite.authservice.dto.AuthResponseDto;
//import com.quickbite.authservice.dto.UserDto;
//import com.quickbite.authservice.dto.UserLoginRequestDto;
//import com.quickbite.authservice.dto.UserRegistrationRequestDto;
//import com.quickbite.authservice.entity.User;
//import com.quickbite.authservice.exception.DuplicateEmailException;
//import com.quickbite.authservice.repository.UserRepository;
//import com.quickbite.authservice.util.JwtUtil;
//
//@Service
//public class AuthService {
//
//	private static final Logger log = LoggerFactory.getLogger(AuthService.class);
//
//	@Autowired
//	private UserRepository userRepository;
//
//	@Autowired
//	private PasswordEncoder passwordEncoder;
//
//	@Autowired
//	private JwtUtil jwtUtil;
//
//	@Autowired
//	private AuthenticationManager authenticationManager;
//
//	public AuthResponseDto registerUser(UserRegistrationRequestDto requestDto) {
//		if (userRepository.findByEmail(requestDto.getEmail()).isPresent()) {
//			log.warn("Registration attempt with existing email: {}", requestDto.getEmail());
//			throw new DuplicateEmailException("User with this email already exists");
//		}
//
//		User user = User.builder().email(requestDto.getEmail())
//				.password(passwordEncoder.encode(requestDto.getPassword())).role("CUSTOMER").name(requestDto.getName())
//				.phone(requestDto.getPhone()).build();
//
//		User savedUser = userRepository.save(user);
//		log.info("User registered successfully: {}", savedUser.getEmail());
//
//		String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
//		UserDto userDto = UserDto.builder().id(savedUser.getId()).email(savedUser.getEmail()).role(savedUser.getRole())
//				.name(savedUser.getName()).phone(savedUser.getPhone()).build();
//		return AuthResponseDto.builder().token(token).message("User registered successfully").user(userDto).build();
//	}
//
//	public AuthResponseDto loginUser(UserLoginRequestDto requestDto) {
//		Authentication authentication = authenticationManager
//				.authenticate(new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword()));
//
//		SecurityContextHolder.getContext().setAuthentication(authentication);
//
//		User user = userRepository.findByEmail(requestDto.getEmail())
//				.orElseThrow(() -> new RuntimeException("User not found"));
//		log.info("User logged in successfully: {}", user.getEmail());
//
//		String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
//		UserDto userDto = UserDto.builder().id(user.getId()).email(user.getEmail()).role(user.getRole())
//				.name(user.getName()).phone(user.getPhone()).build();
//		return AuthResponseDto.builder().token(token).message("User logged in successfully").user(userDto).build();
//	}
//
//	// List all users
//	public ResponseEntity<ApiResponse<List<User>>> listUsers() {
//		List<User> users = userRepository.findAll();
//		return ResponseEntity.ok(ApiResponse.<List<User>>builder().success(true).message("Users fetched successfully")
//				.data(users).build());
//	}
//
//	// Update a user
//	public ResponseEntity<ApiResponse<User>> updateUser(Long id, AdminUserUpdateRequest req) {
//		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
//
//		if (req.getName() != null)
//			user.setName(req.getName());
//		if (req.getEmail() != null)
//			user.setEmail(req.getEmail());
//		if (req.getPhone() != null)
//			user.setPhone(req.getPhone());
//		if (req.getRole() != null)
//			user.setRole(req.getRole());
//		if (req.getActive() != null)
//			user.setActive(req.getActive());
//
//		User saved = userRepository.save(user);
//
//		return ResponseEntity
//				.ok(ApiResponse.<User>builder().success(true).message("User updated successfully").data(saved).build());
//	}
//
//	// Create a new user
//	public ResponseEntity<ApiResponse<User>> createUser(UserRegistrationRequestDto req, String role) {
//		if (userRepository.findByEmail(req.getEmail()).isPresent()) {
//			return new ResponseEntity<>(ApiResponse.<User>builder().success(false)
//					.message("User with this email already exists").data(null).build(), HttpStatus.CONFLICT);
//		}
//
//		User user = User.builder().email(req.getEmail()).password(passwordEncoder.encode(req.getPassword()))
//				.role(role != null ? role : "CUSTOMER").name(req.getName()).phone(req.getPhone()).active(true).build();
//
//		User saved = userRepository.save(user);
//
//		return new ResponseEntity<>(
//				ApiResponse.<User>builder().success(true).message("User created successfully").data(saved).build(),
//				HttpStatus.CREATED);
//	}
//
//	// Activate user
//	public ResponseEntity<ApiResponse<User>> activateUser(Long id) {
//		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
//		user.setActive(true);
//
//		return ResponseEntity.ok(ApiResponse.<User>builder().success(true).message("User activated")
//				.data(userRepository.save(user)).build());
//	}
//
//	// Deactivate user
//	public ResponseEntity<ApiResponse<User>> deactivateUser(Long id) {
//		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
//		user.setActive(false);
//
//		return ResponseEntity.ok(ApiResponse.<User>builder().success(true).message("User deactivated")
//				.data(userRepository.save(user)).build());
//	}
//
//	// ============================
//	// 1️⃣ Import Users from Excel
//	// ============================
//	public ResponseEntity<ApiResponse<String>> importUsers(MultipartFile file) {
//		if (file.isEmpty()) {
//			return ResponseEntity.badRequest().body(
//					ApiResponse.<String>builder().success(false).message("Please upload a valid Excel file.").build());
//		}
//
//		try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
//			Sheet sheet = workbook.getSheetAt(0);
//			List<User> users = new ArrayList<>();
//
//			for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skip header
//				Row row = sheet.getRow(i);
//				if (row == null)
//					continue;
//
//				String name = getCellValue(row.getCell(0));
//				String email = getCellValue(row.getCell(1));
//				String password = getCellValue(row.getCell(2));
//				String phone = getCellValue(row.getCell(3));
//				String role = getCellValue(row.getCell(4));
//
//				if (email == null || userRepository.findByEmail(email).isPresent())
//					continue;
//
//				User user = User.builder().name(name).email(email).password(passwordEncoder.encode(password))
//						.phone(phone).role(role != null ? role.toUpperCase() : "CUSTOMER").active(true).build();
//
//				users.add(user);
//			}
//
//			userRepository.saveAll(users);
//
//			return ResponseEntity.ok(ApiResponse.<String>builder().success(true)
//					.message(users.size() + " users imported successfully").build());
//
//		} catch (Exception e) {
//			return ResponseEntity.internalServerError().body(ApiResponse.<String>builder().success(false)
//					.message("Error importing users: " + e.getMessage()).build());
//		}
//	}
//
//	private String getCellValue(Cell cell) {
//		if (cell == null)
//			return null;
//		cell.setCellType(CellType.STRING);
//		return cell.getStringCellValue().trim();
//	}
//
//	// ============================
//	// 2️⃣ Export All Users (Grouped by Role)
//	// ============================
//	public ResponseEntity<byte[]> exportAllUsersToPdf() {
//		List<User> users = userRepository.findAll().stream().sorted(Comparator.comparing(User::getRole))
//				.collect(Collectors.toList());
//
//		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
//			Document document = new Document(PageSize.A4);
//			PdfWriter.getInstance(document, out);
//			document.open();
//
//			Paragraph title = new Paragraph("User Report (Grouped by Role)", new Font(Font.HELVETICA, 18, Font.BOLD));
//			title.setAlignment(Element.ALIGN_CENTER);
//			document.add(title);
//			document.add(new Paragraph("Generated on: " + java.time.LocalDateTime.now()));
//			document.add(new Paragraph(" "));
//
//			List<String> distinctRoles = users.stream().map(User::getRole).distinct().sorted().toList();
//
//			for (String role : distinctRoles) {
//				List<User> roleUsers = users.stream().filter(u -> u.getRole().equalsIgnoreCase(role)).toList();
//
//				Paragraph roleHeader = new Paragraph(role.toUpperCase() + " USERS",
//						new Font(Font.HELVETICA, 14, Font.BOLD, new Color(0, 102, 204)));
//				roleHeader.setSpacingBefore(15);
//				roleHeader.setSpacingAfter(8);
//				document.add(roleHeader);
//
//				float[] columnWidths = { 1.0f, 3.0f, 4.0f, 2.5f, 1.0f };
//				PdfPTable table = new PdfPTable(columnWidths);
//				table.setWidthPercentage(100);
//
//				Color headerColor = switch (role.toUpperCase()) {
//				case "ADMIN" -> new Color(255, 153, 51);
//				case "CUSTOMER" -> new Color(102, 204, 255);
//				case "DELIVERY_PARTNER" -> new Color(153, 255, 153);
//				case "RESTAURANT_OWNER" -> new Color(255, 204, 204);
//				default -> new Color(220, 220, 220);
//				};
//
//				Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD);
//				addHeaderCell(table, "ID", headerFont, headerColor);
//				addHeaderCell(table, "Name", headerFont, headerColor);
//				addHeaderCell(table, "Email", headerFont, headerColor);
//				addHeaderCell(table, "Role", headerFont, headerColor);
//				addHeaderCell(table, "Active", headerFont, headerColor);
//
//				Font cellFont = new Font(Font.HELVETICA, 11);
//				for (User user : roleUsers) {
//					table.addCell(new Phrase(String.valueOf(user.getId()), cellFont));
//					table.addCell(new Phrase(user.getName() != null ? user.getName() : "-", cellFont));
//					table.addCell(new Phrase(user.getEmail(), cellFont));
//					table.addCell(new Phrase(user.getRole(), cellFont));
//					table.addCell(new Phrase(user.isActive() ? "Yes" : "No", cellFont));
//				}
//
//				document.add(table);
//			}
//
//			document.close();
//			return ResponseEntity.ok().header("Content-Disposition", "attachment; filename=users_grouped_by_role.pdf")
//					.body(out.toByteArray());
//
//		} catch (Exception e) {
//			e.printStackTrace();
//			return ResponseEntity.internalServerError().build();
//		}
//	}
//
//	private void addHeaderCell(PdfPTable table, String text, Font font, Color bgColor) {
//		PdfPCell cell = new PdfPCell(new Phrase(text, font));
//		cell.setBackgroundColor(bgColor);
//		cell.setHorizontalAlignment(Element.ALIGN_CENTER);
//		cell.setPadding(6);
//		table.addCell(cell);
//	}
//
//	// ============================
//	// 3️⃣ Export Users by Role
//	// ============================
//	public ResponseEntity<byte[]> exportUsersByRole(String role) {
//		List<User> users = userRepository.findByRoleIgnoreCase(role);
//
//		if (users.isEmpty()) {
//			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(("No users found for role: " + role).getBytes());
//		}
//
//		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
//			Document document = new Document(PageSize.A4);
//			PdfWriter.getInstance(document, out);
//			document.open();
//
//			Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.WHITE);
//			PdfPTable titleTable = new PdfPTable(1);
//			titleTable.setWidthPercentage(100);
//			PdfPCell titleCell = new PdfPCell(new Phrase("User List for Role: " + role.toUpperCase(), titleFont));
//			titleCell.setBackgroundColor(new Color(44, 62, 80));
//			titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
//			titleCell.setPadding(15f);
//			titleTable.addCell(titleCell);
//			document.add(titleTable);
//
//			document.add(new Paragraph("Generated Report — Role: " + role.toUpperCase()));
//			document.add(new Paragraph(" "));
//
//			float[] columnWidths = { 2.5f, 3.5f, 2.5f, 1.2f };
//			PdfPTable table = new PdfPTable(columnWidths);
//			table.setWidthPercentage(100);
//
//			Font headerFont = new Font(Font.HELVETICA, 13, Font.BOLD, Color.WHITE);
//			String[] headers = { "Name", "Email", "Phone", "Active" };
//			Color headerColor = new Color(52, 152, 219);
//
//			for (String header : headers) {
//				PdfPCell headerCell = new PdfPCell(new Phrase(header, headerFont));
//				headerCell.setBackgroundColor(headerColor);
//				headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
//				headerCell.setPadding(10f);
//				headerCell.setBorderColor(Color.WHITE);
//				table.addCell(headerCell);
//			}
//
//			Font cellFont = new Font(Font.HELVETICA, 12);
//			Color evenRowColor = new Color(236, 240, 241);
//			boolean alternate = false;
//
//			for (User user : users) {
//				Color bgColor = alternate ? evenRowColor : Color.WHITE;
//				addStyledCell(table, user.getName(), cellFont, bgColor);
//				addStyledCell(table, user.getEmail(), cellFont, bgColor);
//				addStyledCell(table, user.getPhone(), cellFont, bgColor);
//				addStyledCell(table, user.isActive() ? "Yes" : "No", cellFont, bgColor);
//				alternate = !alternate;
//			}
//
//			document.add(table);
//			document.close();
//
//			return ResponseEntity.ok()
//					.header("Content-Disposition", "attachment; filename=users_" + role.toLowerCase() + ".pdf")
//					.body(out.toByteArray());
//
//		} catch (Exception e) {
//			return ResponseEntity.internalServerError().build();
//		}
//	}
//
//	private void addStyledCell(PdfPTable table, String text, Font font, Color bgColor) {
//		PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
//		cell.setBackgroundColor(bgColor);
//		cell.setHorizontalAlignment(Element.ALIGN_CENTER);
//		cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
//		cell.setPadding(8f);
//		cell.setBorderColor(Color.LIGHT_GRAY);
//		table.addCell(cell);
//	}
//
//}

package com.quickbite.authservice.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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
import com.quickbite.authservice.dto.AuthResponseDto;
import com.quickbite.authservice.dto.UserDto;
import com.quickbite.authservice.dto.UserLoginRequestDto;
import com.quickbite.authservice.dto.UserRegistrationRequestDto;
import com.quickbite.authservice.entity.User;
import com.quickbite.authservice.exception.DuplicateEmailException;
import com.quickbite.authservice.repository.UserRepository;
import com.quickbite.authservice.util.JwtUtil;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponseDto registerUser(UserRegistrationRequestDto requestDto) {
        if (userRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            log.warn("Registration attempt with existing email: {}", requestDto.getEmail());
            throw new DuplicateEmailException("User with this email already exists");
        }

        User user = User.builder().email(requestDto.getEmail())
                .password(passwordEncoder.encode(requestDto.getPassword())).role("CUSTOMER").name(requestDto.getName())
                .phone(requestDto.getPhone()).build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
        UserDto userDto = UserDto.builder().id(savedUser.getId()).email(savedUser.getEmail()).role(savedUser.getRole())
                .name(savedUser.getName()).phone(savedUser.getPhone()).build();
        return AuthResponseDto.builder().token(token).message("User registered successfully").user(userDto).build();
    }

    public AuthResponseDto loginUser(UserLoginRequestDto requestDto) {
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        log.info("User logged in successfully: {}", user.getEmail());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        UserDto userDto = UserDto.builder().id(user.getId()).email(user.getEmail()).role(user.getRole())
                .name(user.getName()).phone(user.getPhone()).build();
        return AuthResponseDto.builder().token(token).message("User logged in successfully").user(userDto).build();
    }

    // List all users
    public ResponseEntity<ApiResponse<List<User>>> listUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.<List<User>>builder().success(true).message("Users fetched successfully")
                .data(users).build());
    }

    // Update a user
    public ResponseEntity<ApiResponse<User>> updateUser(Long id, AdminUserUpdateRequest req) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getName() != null)
            user.setName(req.getName());
        if (req.getEmail() != null)
            user.setEmail(req.getEmail());
        if (req.getPhone() != null)
            user.setPhone(req.getPhone());
        if (req.getRole() != null)
            user.setRole(req.getRole());
        if (req.getActive() != null)
            user.setActive(req.getActive());

        User saved = userRepository.save(user);

        return ResponseEntity
                .ok(ApiResponse.<User>builder().success(true).message("User updated successfully").data(saved).build());
    }

    // Create a new user
    public ResponseEntity<ApiResponse<User>> createUser(UserRegistrationRequestDto req, String role) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return new ResponseEntity<>(ApiResponse.<User>builder().success(false)
                    .message("User with this email already exists").data(null).build(), HttpStatus.CONFLICT);
        }

        User user = User.builder().email(req.getEmail()).password(passwordEncoder.encode(req.getPassword()))
                .role(role != null ? role : "CUSTOMER").name(req.getName()).phone(req.getPhone()).active(true).build();

        User saved = userRepository.save(user);

        return new ResponseEntity<>(
                ApiResponse.<User>builder().success(true).message("User created successfully").data(saved).build(),
                HttpStatus.CREATED);
    }

    // Activate user
    public ResponseEntity<ApiResponse<User>> activateUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);

        return ResponseEntity.ok(ApiResponse.<User>builder().success(true).message("User activated")
                .data(userRepository.save(user)).build());
    }

    // Deactivate user
    public ResponseEntity<ApiResponse<User>> deactivateUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);

        return ResponseEntity.ok(ApiResponse.<User>builder().success(true).message("User deactivated")
                .data(userRepository.save(user)).build());
    }

    // Import Users from Excel
    public ResponseEntity<ApiResponse<String>> importUsers(MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.<String>builder().success(false).message("Please upload a valid Excel file.").build());
        }

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<User> users = new ArrayList<>();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skip header
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                String name = getCellValue(row.getCell(0));
                String email = getCellValue(row.getCell(1));
                String password = getCellValue(row.getCell(2));
                String phone = getCellValue(row.getCell(3));
                String role = getCellValue(row.getCell(4));

                if (email == null || userRepository.findByEmail(email).isPresent())
                    continue;

                User user = User.builder().name(name).email(email).password(passwordEncoder.encode(password))
                        .phone(phone).role(role != null ? role.toUpperCase() : "CUSTOMER").active(true).build();

                users.add(user);
            }

            userRepository.saveAll(users);

            return ResponseEntity.ok(ApiResponse.<String>builder().success(true)
                    .message(users.size() + " users imported successfully").build());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.<String>builder().success(false)
                    .message("Error importing users: " + e.getMessage()).build());
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return null;
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }

    // Export All Users to PDF (Grouped by Role)
    public ResponseEntity<byte[]> exportAllUsersToPdf() {
        List<User> users = userRepository.findAll().stream().sorted(Comparator.comparing(User::getRole))
                .collect(Collectors.toList());

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("User Report (Grouped by Role)", new Font(Font.HELVETICA, 18, Font.BOLD));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("Generated on: " + java.time.LocalDateTime.now()));
            document.add(new Paragraph(" "));

            List<String> distinctRoles = users.stream().map(User::getRole).distinct().sorted().toList();

            for (String role : distinctRoles) {
                List<User> roleUsers = users.stream().filter(u -> u.getRole().equalsIgnoreCase(role)).toList();

                Paragraph roleHeader = new Paragraph(role.toUpperCase() + " USERS",
                        new Font(Font.HELVETICA, 14, Font.BOLD, new Color(0, 102, 204)));
                roleHeader.setSpacingBefore(15);
                roleHeader.setSpacingAfter(8);
                document.add(roleHeader);

                float[] columnWidths = { 1.0f, 3.0f, 4.0f, 2.5f, 1.0f };
                PdfPTable table = new PdfPTable(columnWidths);
                table.setWidthPercentage(100);

                Color headerColor = switch (role.toUpperCase()) {
                    case "ADMIN" -> new Color(255, 153, 51);
                    case "CUSTOMER" -> new Color(102, 204, 255);
                    case "DELIVERY_PARTNER" -> new Color(153, 255, 153);
                    case "RESTAURANT_OWNER" -> new Color(255, 204, 204);
                    default -> new Color(220, 220, 220);
                };

                Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD);
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
            return ResponseEntity.ok().header("Content-Disposition", "attachment; filename=users_grouped_by_role.pdf")
                    .body(out.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        table.addCell(cell);
    }

    // Export Users by Role to PDF
    public ResponseEntity<byte[]> exportUsersByRole(String role) {
        List<User> users = userRepository.findByRoleIgnoreCase(role);

        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(("No users found for role: " + role).getBytes());
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.WHITE);
            PdfPTable titleTable = new PdfPTable(1);
            titleTable.setWidthPercentage(100);
            PdfPCell titleCell = new PdfPCell(new Phrase("User List for Role: " + role.toUpperCase(), titleFont));
            titleCell.setBackgroundColor(new Color(44, 62, 80));
            titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            titleCell.setPadding(15f);
            titleTable.addCell(titleCell);
            document.add(titleTable);

            document.add(new Paragraph("Generated Report — Role: " + role.toUpperCase()));
            document.add(new Paragraph(" "));

            float[] columnWidths = { 2.5f, 3.5f, 2.5f, 1.2f };
            PdfPTable table = new PdfPTable(columnWidths);
            table.setWidthPercentage(100);

            Font headerFont = new Font(Font.HELVETICA, 13, Font.BOLD, Color.WHITE);
            String[] headers = { "Name", "Email", "Phone", "Active" };
            Color headerColor = new Color(52, 152, 219);

            for (String header : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(header, headerFont));
                headerCell.setBackgroundColor(headerColor);
                headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                headerCell.setPadding(10f);
                headerCell.setBorderColor(Color.WHITE);
                table.addCell(headerCell);
            }

            Font cellFont = new Font(Font.HELVETICA, 12);
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

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=users_" + role.toLowerCase() + ".pdf")
                    .body(out.toByteArray());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private void addStyledCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(8f);
        cell.setBorderColor(Color.LIGHT_GRAY);
        table.addCell(cell);
    }

    public ResponseEntity<byte[]> exportAllUsersToExcel() {
        List<User> users = userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getRole))
                .collect(Collectors.toList());

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            List<String> distinctRoles = users.stream().map(User::getRole).distinct().sorted().toList();

            for (String role : distinctRoles) {
                List<User> roleUsers = users.stream().filter(u -> u.getRole().equalsIgnoreCase(role)).toList();
                Sheet sheet = workbook.createSheet(role.toUpperCase() + "_USERS");

                // Header row style
                CellStyle headerStyle = workbook.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);
                headerStyle.setAlignment(HorizontalAlignment.CENTER);

                // Header row
                Row headerRow = sheet.createRow(0);
                String[] headers = {"ID", "Name", "Email", "Role", "Phone", "Active"};
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }

                // Data rows
                CellStyle cellStyle = workbook.createCellStyle();
                cellStyle.setAlignment(HorizontalAlignment.CENTER);

                int rowNum = 1;
                for (User user : roleUsers) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(user.getId());
                    row.createCell(1).setCellValue(user.getName() != null ? user.getName() : "-");
                    row.createCell(2).setCellValue(user.getEmail());
                    row.createCell(3).setCellValue(user.getRole());
                    row.createCell(4).setCellValue(user.getPhone() != null ? user.getPhone() : "-");
                    row.createCell(5).setCellValue(user.isActive() ? "Yes" : "No");

                    for (int i = 0; i < headers.length; i++) {
                        row.getCell(i).setCellStyle(cellStyle);
                    }
                }

                // Auto-size columns
                for (int i = 0; i < headers.length; i++) {
                    sheet.autoSizeColumn(i);
                }
            }

            workbook.write(out);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=users_grouped_by_role.xlsx")
                    .body(out.toByteArray());

        } catch (Exception e) {
            log.error("Error exporting users to Excel: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Export Users by Role to Excel
    public ResponseEntity<byte[]> exportUsersByRoleToExcel(String role) {
        List<User> users = userRepository.findByRoleIgnoreCase(role);

        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(("No users found for role: " + role).getBytes());
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(role.toUpperCase() + "_USERS");

            // Header row style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Name", "Email", "Phone", "Active"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            CellStyle cellStyle = workbook.createCellStyle();
            cellStyle.setAlignment(HorizontalAlignment.CENTER);

            int rowNum = 1;
            for (User user : users) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(user.getName() != null ? user.getName() : "-");
                row.createCell(1).setCellValue(user.getEmail());
                row.createCell(2).setCellValue(user.getPhone() != null ? user.getPhone() : "-");
                row.createCell(3).setCellValue(user.isActive() ? "Yes" : "No");

                for (int i = 0; i < headers.length; i++) {
                    row.getCell(i).setCellStyle(cellStyle);
                }
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=users_" + role.toLowerCase() + ".xlsx")
                    .body(out.toByteArray());

        } catch (Exception e) {
            log.error("Error exporting users by role to Excel: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    
    public byte[] generateUserImportTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("User Import Template");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Name", "Email", "Password", "Phone", "Role"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating user import template", e);
        }
    }

    
    
}

