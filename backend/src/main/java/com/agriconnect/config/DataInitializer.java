package com.agriconnect.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.agriconnect.catalog.Category;
import com.agriconnect.catalog.CategoryRepository;
import com.agriconnect.user.Role;
import com.agriconnect.user.User;
import com.agriconnect.user.UserRepository;

/**
 * Seeds reference data on startup: default produce categories, and an admin
 * account when ADMIN_EMAIL / ADMIN_PASSWORD are provided. There is deliberately
 * no public endpoint that creates admins.
 */
@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    static final List<String> DEFAULT_CATEGORIES = List.of(
            "Vegetables", "Fruits", "Legumes", "Oilseeds", "Grains", "Tuber Crops", "Spices", "Ornamental");

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties properties;

    public DataInitializer(CategoryRepository categoryRepository, UserRepository userRepository,
                           PasswordEncoder passwordEncoder, AppProperties properties) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() == 0) {
            DEFAULT_CATEGORIES.forEach(name -> categoryRepository.save(new Category(name, true)));
            log.info("Seeded {} default categories", DEFAULT_CATEGORIES.size());
        }

        String email = properties.admin().email();
        String password = properties.admin().password();
        if (StringUtils.hasText(email) && StringUtils.hasText(password)
                && !userRepository.existsByEmailIgnoreCase(email)) {
            User admin = new User();
            admin.setName("Administrator");
            admin.setEmail(email.trim().toLowerCase());
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            log.info("Created bootstrap admin account {}", admin.getEmail());
        }
    }
}
