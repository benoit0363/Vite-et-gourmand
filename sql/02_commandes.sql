DROP TABLE IF EXISTS commandes;

CREATE TABLE commandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_client VARCHAR(255) NOT NULL,
    email_client VARCHAR(255) NULL,
    telephone VARCHAR(50) NULL,
    adresse TEXT NULL,
    ville VARCHAR(255) DEFAULT NULL,
    date_prestation DATE NULL,
    heure_prestation VARCHAR(10) NULL,
    details_panier JSON NULL,
    total DECIMAL(10,2) DEFAULT 0.00,
    prix_total DECIMAL(10,2) DEFAULT 0.00,
    statut VARCHAR(50) DEFAULT 'En attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);