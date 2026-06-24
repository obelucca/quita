package com.quita.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class QuitaApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuitaApiApplication.class, args);
	}

}
