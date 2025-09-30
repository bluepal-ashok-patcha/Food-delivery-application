package com.quickbite.service;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.quickbite.entity.User;
import com.quickbite.repository.UserRepository;


@Service
public class CustomUserServiceImplementation implements UserDetailsService {

  @Autowired
  private UserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
      User user = userRepository.findByEmail(username);

      if (user == null) {
          throw new UsernameNotFoundException("User Not Found with email: " + username);
      }
      
      //String role = (user.getRole() == null) ? "USER" : user.getRole();
      String role = (user.getRole() == null) ? "CUSTOMER" : user.getRole().name();

      String springRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;

      List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(springRole));

      return new org.springframework.security.core.userdetails.User(
          user.getEmail(),
          user.getPassword(),
          authorities
      );
  }
}
