package com.quickbite.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quickbite.entity.PasswordResetToken;
import com.quickbite.entity.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
	
//	Optional<PasswordResetToken> findByToken(String email);
//	void deleteByUser(User user);
//	Optional<PasswordResetToken> findByUser(User user);
//	
//	
//	
//	//PasswordResetToken findByToken(String token);
	
//    PasswordResetToken findByUserEmail(String email);
	   // ✅ Find token by OTP/token value
    Optional<PasswordResetToken> findByToken(String otp);

    // ✅ Delete token when user resets password
    void deleteByUser(User user);

    // ✅ Find token by user entity
    Optional<PasswordResetToken> findByUser(User user);

    // ✅ Find token directly by user email
   // Optional<PasswordResetToken> findByUserEmail(String email);


}
