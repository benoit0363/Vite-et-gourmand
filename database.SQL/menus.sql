DROP TABLE IF EXISTS menus;

-- 2. On la recrée exactement comme ton PHP l'attend
CREATE TABLE menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    starter VARCHAR(255) DEFAULT NULL,
    main_course VARCHAR(255) DEFAULT NULL,
    dessert VARCHAR(255) DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    min_people INT DEFAULT 1,
    remaining_quantity INT DEFAULT 10,
    image VARCHAR(255) DEFAULT 'default.jpg',
    theme VARCHAR(100) DEFAULT 'Classique',
    allergens VARCHAR(255) DEFAULT 'Aucun',
    is_active TINYINT(1) DEFAULT 1
);