CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL, -- Sera haché pour la sécurité
    telephone VARCHAR(20),
    adresse TEXT,
    ville VARCHAR(100),
    role VARCHAR(50) DEFAULT 'utilisateur',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    ALTER TABLE clients 
    ADD reset_token VARCHAR(255) NULL, 
    ADD reset_expires DATETIME NULL;