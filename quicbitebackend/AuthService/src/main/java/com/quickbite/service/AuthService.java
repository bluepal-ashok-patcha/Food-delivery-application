package com.quickbite.service;


import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.quickbite.config.JwtProvider;
import com.quickbite.dto.AuthResponse;
import com.quickbite.dto.LoginRequest;
import com.quickbite.dto.UserRequestDto;
import com.quickbite.dto.UserResponseDto;
import com.quickbite.entity.PasswordResetToken;
import com.quickbite.entity.User;
import com.quickbite.exception.EmailAlreadyExistsException;
import com.quickbite.repository.PasswordResetTokenRepository;
import com.quickbite.repository.UserRepository;
import com.quickbite.utils.OtpUtils;

import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;


@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtProvider jwtProvider;
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;
   
    public UserResponseDto register(UserRequestDto userRequest) {
        User existingUser = userRepository.findByEmail(userRequest.getEmail());

        if (existingUser != null) {
            throw new EmailAlreadyExistsException("Email is already used with another account");
        }

        User user = new User();
        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setPhone(userRequest.getPhone()); 
        

        userRepository.save(user);

        return new UserResponseDto("User registered successfully!");
    }
    

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        String token = jwtProvider.generateToken(authentication);
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        
        
        // Extract the first role (or default to USER)
		/*
		 * String role = authorities.stream() .map(GrantedAuthority::getAuthority)
		 * .findFirst() .orElse("CUSTOMER");
		 */
        
        // ✅ Strip "ROLE_" prefix if present
        String role = authorities.stream()
                                 .map(GrantedAuthority::getAuthority)
                                 .map(r -> r.startsWith("ROLE_") ? r.substring(5) : r) // Remove "ROLE_"
                                 .findFirst()
                                 .orElse("CUSTOMER");
        
        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(token);
        authResponse.setMessage("Login Success");
        authResponse.setStatus(true);
        authResponse.setRole(role);
     

        return authResponse;
        

    }
    
    @Transactional
    public String forgotPassword(String email) throws MessagingException {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return "User not found with email: " + email;
        }

        // ✅ Generate OTP
        String otp = OtpUtils.generateOTP();

        // ✅ Check if a token already exists for this user
        Optional<PasswordResetToken> optionalToken = tokenRepository.findByUser(user);

        PasswordResetToken token;
        if (optionalToken.isPresent()) {
            // ✅ Update existing token
            token = optionalToken.get();
            token.setToken(otp);
            token.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        } else {
            // ✅ Create new token
            token = new PasswordResetToken();
            token.setUser(user);
            token.setToken(otp);
            token.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        }

       // tokenRepository.save(token);// save updated or new token
        PasswordResetToken savedToken = tokenRepository.save(token);
        System.out.println("Saved Token ID = " + savedToken.getId());

        // ✅ Send OTP email
        String subject = "Your OTP for Password Reset";
        String content = "<p>Hello " + user.getName() + ",</p>"
                + "<p>Your OTP is:</p><h2>" + otp + "</h2><p>It expires in 15 minutes.</p>";

        emailService.sendVerificationOtpEmail(email, "", subject, content);

        return "OTP has been sent to your email address.";
    }


   

}


