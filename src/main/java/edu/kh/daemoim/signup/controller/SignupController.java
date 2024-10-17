package edu.kh.daemoim.signup.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import edu.kh.daemoim.signup.service.SignupService;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class SignupController {
	
	private final SignupService service;

	
	@GetMapping("/signup")
	public String signup() {
		return "signup/signup";
	}
	
}
