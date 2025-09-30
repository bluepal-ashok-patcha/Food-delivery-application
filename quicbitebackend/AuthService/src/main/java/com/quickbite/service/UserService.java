package com.quickbite.service;

import java.util.List;

import com.quickbite.entity.User;

public interface UserService {
	
	public User getUserProfile(String jwt);
	public List<User> getAllUser();
}
