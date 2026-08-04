CREATE TABLE `commande_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `commande_id` INT NOT NULL,
  `menu_id` INT DEFAULT NULL,
  `nom_menu` VARCHAR(255) NOT NULL,
  `quantite` INT NOT NULL,
  `prix_unitaire` DECIMAL(10, 2) NOT NULL,
  -- Clé étrangère : Si on supprime une commande, ses détails sont supprimés automatiquement
  FOREIGN KEY (`commande_id`) REFERENCES `commandes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;