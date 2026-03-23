package com.yong.yonghealth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class YonghealthApplication {

	public static void main(String[] args) {
		SpringApplication.run(YonghealthApplication.class, args);
	}

}
