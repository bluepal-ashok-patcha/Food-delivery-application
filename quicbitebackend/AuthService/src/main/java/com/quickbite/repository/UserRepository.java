package com.quickbite.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quickbite.entity.User;


public interface UserRepository extends JpaRepository<User,Long> {

	public User findByEmail(String email);

	//Optional<User> findByFullName(String fullName);
	User findByName(String Name); 
}