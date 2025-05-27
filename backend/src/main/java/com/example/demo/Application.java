package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
	@GetMapping("/hello")
	public String hello(@RequestParam(defaultValue = "World") String name) {
		return String.format("Hello %s!", name);
	}
}
