-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 29 oct. 2026 à 17:16
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `vite et gourmand`
--

-- --------------------------------------------------------

--
-- Structure de la table `avis`
--

CREATE TABLE `avis` (
  `id` int(11) NOT NULL,
  `commande_id` int(11) NOT NULL,
  `email_client` varchar(255) NOT NULL,
  `note` int(11) NOT NULL,
  `commentaire` text NOT NULL,
  `date_avis` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `avis`
--

INSERT INTO `avis` (`id`, `commande_id`, `email_client`, `note`, `commentaire`, `date_avis`) VALUES
(3, 4, 'benoit.flament63@gmail.com', 5, 'excellent, je recommande', '2026-10-09 12:15:04'),
(4, 2, 'ericflament@gmail.com', 3, 'je suis déçut', '2026-10-09 12:15:56');

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'utilisateur',
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `telephone`, `adresse`, `ville`, `role`, `date_creation`, `reset_token`, `reset_expires`) VALUES
(1, 'Admin', 'Julie', 'julie@vite-et-gourmand.fr', '$2y$10$4nhjEHNM1TUEZRt6qJXZX.dS6ov9mHOSUh/rH1JeHJ7xxfGlw8Tpe', NULL, NULL, NULL, 'admin', '2026-10-08 12:03:33', NULL, NULL),
(2, 'Flament', 'Eric', 'ericflament@gmail.com', '$2y$10$AZ8DhO5I8fF5zfPgpwP4Pe8Mr1edKzWYDKJ3mi/uKTqkX0CYMMW6e', '0102030405', '21 avenue du porc', 'Bordeaux', 'utilisateur', '2026-10-08 12:13:44', NULL, NULL),
(16, 'Dupont', 'Henry', 'henrydupont@gmail.com', '$2y$10$K2zJ/aUxQCJO5yfHfCWLoO7VKUzrX/yspOY02PysmMKurpya1hqtW', '0102030405', NULL, NULL, 'employe', '2026-10-09 12:00:04', NULL, NULL),
(17, 'Flament', 'Benoit', 'benoit.flament63@gmail.com', '$2y$10$A9KB8Nt5tkzjKTAPoQFV2ecaoGgZnChdMpOzeiuRko0JVRZqkAD72', '0102030405', 'rue du port', 'Bordeaux', 'utilisateur', '2026-10-09 12:06:53', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id` int(11) NOT NULL,
  `nom_client` varchar(255) NOT NULL,
  `email_client` varchar(255) DEFAULT NULL,
  `telephone` varchar(50) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `ville` varchar(255) DEFAULT NULL,
  `date_prestation` date DEFAULT NULL,
  `heure_prestation` varchar(10) DEFAULT NULL,
  `details_panier` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details_panier`)),
  `total` decimal(10,2) DEFAULT 0.00,
  `prix_total` decimal(10,2) DEFAULT 0.00,
  `statut` varchar(50) DEFAULT 'En attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_commande` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `nom_client`, `email_client`, `telephone`, `adresse`, `ville`, `date_prestation`, `heure_prestation`, `details_panier`, `total`, `prix_total`, `statut`, `created_at`, `date_commande`) VALUES
(2, 'Flament Eric', 'ericflament@gmail.com', '0102030405', '21 avenue du porc', 'Bordeaux', '2026-10-09', '11h00', '{\"livraison\":\"21 avenue du porc\",\"articles\":[{\"0\":3,\"1\":\"Menu Terroir Sud-Ouest\",\"2\":\"Toute l\'authenticit\\u00e9 de la gastronomie bordelaise et de ses environs r\\u00e9unie dans une formule conviviale\\n\\n[Ingr\\u00e9dients] :\\n- Entr\\u00e9e : G\\u00e9siers de canard confits, salade folle, pignons de pin, vinaigre de framboise\\n- Plat : Magret de canard du Sud-Ouest, c\\u00e8pes de Bazas, persil frais, pommes de terre Sarladaises\\n- Dessert : Lait, \\u0153ufs, rhum brun vieux, vanille Bourbon, sucre de canne\",\"3\":\"Salade landaise aux g\\u00e9siers confits, pignons de pin et copeaux de comt\\u00e9\",\"4\":\"Magret de canard r\\u00f4ti sauce aux c\\u00e8pes et pommes Sarladaises \\u00e0 la graisse d\'oie\",\"5\":\"Duo de Canel\\u00e9s bordelais croustillants et leur glace artisanale \\u00e0 la vanille\",\"6\":\"32.00\",\"7\":1,\"8\":50,\"9\":\"roti.jpg\",\"10\":\"Classique\",\"11\":\"Aucun\",\"12\":1,\"id\":3,\"title\":\"Menu Terroir Sud-Ouest\",\"description\":\"Toute l\'authenticit\\u00e9 de la gastronomie bordelaise et de ses environs r\\u00e9unie dans une formule conviviale\\n\\n[Ingr\\u00e9dients] :\\n- Entr\\u00e9e : G\\u00e9siers de canard confits, salade folle, pignons de pin, vinaigre de framboise\\n- Plat : Magret de canard du Sud-Ouest, c\\u00e8pes de Bazas, persil frais, pommes de terre Sarladaises\\n- Dessert : Lait, \\u0153ufs, rhum brun vieux, vanille Bourbon, sucre de canne\",\"starter\":\"Salade landaise aux g\\u00e9siers confits, pignons de pin et copeaux de comt\\u00e9\",\"main_course\":\"Magret de canard r\\u00f4ti sauce aux c\\u00e8pes et pommes Sarladaises \\u00e0 la graisse d\'oie\",\"dessert\":\"Duo de Canel\\u00e9s bordelais croustillants et leur glace artisanale \\u00e0 la vanille\",\"price\":32,\"min_people\":1,\"remaining_quantity\":50,\"image\":\"roti.jpg\",\"theme\":\"Classique\",\"allergens\":\"Aucun\",\"is_active\":1,\"nom\":\"Menu Terroir Sud-Ouest\",\"titre\":\"Menu Terroir Sud-Ouest\",\"prix\":32,\"persMin\":1,\"quantite\":7}]}', 0.00, 201.60, 'Livré', '2026-10-09 09:30:44', '2026-10-09 09:30:44'),
(4, 'Flament Benoit', 'benoit.flament63@gmail.com', '0102030405', 'rue du port', 'Bordeaux', '2026-10-15', '11h30', '{\"livraison\":\"rue du port\",\"articles\":[{\"0\":6,\"1\":\"Menus de noel\",\"2\":\"C\\u00e9l\\u00e9brez le printemps avec une d\\u00e9clinaison gourmande autour de l\'agneau et des premiers l\\u00e9gumes de saison\\n\\n[Ingr\\u00e9dients] :\\n- Entr\\u00e9e : Foie gras de canard IGP Sud-Ouest, figues fra\\u00eeches, fleur de sel de Gu\\u00e9rande, pain d\'\\u00e9pices maison\\n- Plat : Poularde fermi\\u00e8re des Landes, morilles s\\u00e9ch\\u00e9es, cr\\u00e8me fra\\u00eeche d\'Isigny, pommes de terre Ratte, truffe noire Tuber melanosporum\\n- Dessert :  Chocolat noir Valrhona 70%, noisettes du P\\u00e9rigord, piment d\'Espelette, vanille de Madagascar\",\"3\":\"Foie gras de canard mi-cuit, chutney de figues au Floc de Gascogne et brioche toast\\u00e9e\",\"4\":\"Supr\\u00eame de poularde sauce aux morilles et son \\u00e9cras\\u00e9 de pommes de terre \\u00e0 la truffe\",\"5\":\"B\\u00fbche p\\u00e2tissi\\u00e8re artisanale au chocolat intense et pralin\\u00e9 croustillant\",\"6\":\"48.00\",\"7\":1,\"8\":18,\"9\":\"Noel.webp\",\"10\":\"Noel\",\"11\":\"Aucun\",\"12\":1,\"id\":6,\"title\":\"Menus de noel\",\"description\":\"C\\u00e9l\\u00e9brez le printemps avec une d\\u00e9clinaison gourmande autour de l\'agneau et des premiers l\\u00e9gumes de saison\\n\\n[Ingr\\u00e9dients] :\\n- Entr\\u00e9e : Foie gras de canard IGP Sud-Ouest, figues fra\\u00eeches, fleur de sel de Gu\\u00e9rande, pain d\'\\u00e9pices maison\\n- Plat : Poularde fermi\\u00e8re des Landes, morilles s\\u00e9ch\\u00e9es, cr\\u00e8me fra\\u00eeche d\'Isigny, pommes de terre Ratte, truffe noire Tuber melanosporum\\n- Dessert :  Chocolat noir Valrhona 70%, noisettes du P\\u00e9rigord, piment d\'Espelette, vanille de Madagascar\",\"starter\":\"Foie gras de canard mi-cuit, chutney de figues au Floc de Gascogne et brioche toast\\u00e9e\",\"main_course\":\"Supr\\u00eame de poularde sauce aux morilles et son \\u00e9cras\\u00e9 de pommes de terre \\u00e0 la truffe\",\"dessert\":\"B\\u00fbche p\\u00e2tissi\\u00e8re artisanale au chocolat intense et pralin\\u00e9 croustillant\",\"price\":\"48.00\",\"min_people\":1,\"remaining_quantity\":18,\"image\":\"Noel.webp\",\"theme\":\"Noel\",\"allergens\":\"Aucun\",\"is_active\":1,\"quantite\":6}]}', 0.00, 259.20, 'Livré', '2026-10-09 11:03:45', '2026-10-09 11:03:45');

-- --------------------------------------------------------

--
-- Structure de la table `commande_details`
--

CREATE TABLE `commande_details` (
  `id` int(11) NOT NULL,
  `commande_id` int(11) NOT NULL,
  `menu_id` int(11) DEFAULT NULL,
  `nom_menu` varchar(255) NOT NULL,
  `quantite` int(11) NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `commande_details`
--

INSERT INTO `commande_details` (`id`, `commande_id`, `menu_id`, `nom_menu`, `quantite`, `prix_unitaire`) VALUES
(4, 4, 6, 'Menus de noel', 6, 48.00);

-- --------------------------------------------------------

--
-- Structure de la table `horaires`
--

CREATE TABLE `horaires` (
  `id` int(11) NOT NULL,
  `jour_id` int(11) NOT NULL,
  `ouvert` tinyint(1) DEFAULT 1,
  `midi_debut` time DEFAULT '11:00:00',
  `midi_fin` time DEFAULT '14:00:00',
  `soir_debut` time DEFAULT '18:00:00',
  `soir_fin` time DEFAULT '22:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `horaires`
--

INSERT INTO `horaires` (`id`, `jour_id`, `ouvert`, `midi_debut`, `midi_fin`, `soir_debut`, `soir_fin`) VALUES
(1, 1, 1, '11:00:00', '14:00:00', '18:00:00', '22:00:00'),
(2, 2, 1, '11:00:00', '14:00:00', '18:00:00', '22:00:00'),
(3, 3, 1, '11:00:00', '14:00:00', '18:00:00', '22:00:00'),
(4, 4, 1, '11:00:00', '14:00:00', '18:00:00', '22:00:00'),
(5, 5, 1, '11:00:00', '14:00:00', '18:00:00', '23:00:00'),
(6, 6, 1, '11:00:00', '14:00:00', '18:00:00', '23:00:00'),
(7, 0, 0, '00:00:00', '00:00:00', '00:00:00', '00:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `menus`
--

CREATE TABLE `menus` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `starter` varchar(255) DEFAULT NULL,
  `main_course` varchar(255) DEFAULT NULL,
  `dessert` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_people` int(11) DEFAULT 1,
  `remaining_quantity` int(11) DEFAULT 10,
  `image` varchar(255) DEFAULT 'default.jpg',
  `theme` varchar(100) DEFAULT 'Classique',
  `allergens` varchar(255) DEFAULT 'Aucun',
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `menus`
--

INSERT INTO `menus` (`id`, `title`, `description`, `starter`, `main_course`, `dessert`, `price`, `min_people`, `remaining_quantity`, `image`, `theme`, `allergens`, `is_active`) VALUES
(2, 'Saveurs de paques', 'Célébrez le printemps avec une déclinaison gourmande autour de l\'agneau et des premiers légumes de saison\n\n[Ingrédients] :\n- Entrée : Asperges blanches du Blayais, œufs plein air, ciboulette, vinaigre de Xérès, huile d\'olive AOP\n- Plat : Epaule d\'agneau de Lacaune, ail de Lomagne, thym frais, carottes fane, pois gourmands\n- Dessert : Fraises de Dordogne, mascarpone, citron bio, menthe fraîche, sablé pur beurre', 'Velouté d\'asperges blanches du Blayais et son œuf mollet pané aux herbes', '\"Navarin d\'agneau confit de 7 heures aux petits légumes printaniers', 'Sablé breton aux fraises de Dordogne et crème légère au citron vert', 39.00, 1, 20, 'paques.jpg', 'Printemps', 'Aucun', 1),
(3, 'Menu Terroir Sud-Ouest', 'Toute l\'authenticité de la gastronomie bordelaise et de ses environs réunie dans une formule conviviale\n\n[Ingrédients] :\n- Entrée : Gésiers de canard confits, salade folle, pignons de pin, vinaigre de framboise\n- Plat : Magret de canard du Sud-Ouest, cèpes de Bazas, persil frais, pommes de terre Sarladaises\n- Dessert : Lait, œufs, rhum brun vieux, vanille Bourbon, sucre de canne', 'Salade landaise aux gésiers confits, pignons de pin et copeaux de comté', 'Magret de canard rôti sauce aux cèpes et pommes Sarladaises à la graisse d\'oie', 'Duo de Canelés bordelais croustillants et leur glace artisanale à la vanille', 32.00, 1, 43, 'roti.jpg', 'Classique', 'Aucun', 1),
(4, 'Menu Végétarien Étoilé', 'Une expérience culinaire végétale raffinée, mettant en valeur le travail des maraîchers locaux\n\n[Ingrédients] :\n- Entrée :  Potimarron bio, lait de coco, gingembre, graines de courge torréfiées\n- Plat : riz, butternut, champignons de Paris, parmesan AOP 24 mois, huile de truffe\n- Dessert : Poires Poire Williams, chocolat noir végétal, amandes effilées', 'Cappuccino de potimarron au lait de coco et graines de tournesol caramélisées', 'Risotto crémeux à la courge butternut, champignons poêlés et huile parfumée à la truffe', 'Poire pochée aux épices douces, crumble d\'amandes et ganache chocolat', 28.00, 1, 15, 'vegan.webp', 'Classique', 'Aucun', 1),
(5, 'Menus evenement', 'Venez deguster lors d\'un evenement \n\n[Ingrédients] :\n- Entrée :  Saumon Atlantique fumé, aneth, blinis maison, fromage frais aux fines herbes\n- Plat : Filet mignon de porc noir de Bigorre, moutarde ancienne, gratin dauphinois au comté\n- Dessert : Assortiment de mignardises (macarons, tartelettes citron, choux praliné)', 'Cascade de blinis au saumon fumé maison et sa crème citronnée à l\'aneth', 'Mignon de porc noir sauce à la moutarde de Meaux et gratin dauphinois tradition', 'Farandole de mignardises sucrées ', 42.00, 1, 100, 'evenement.jpg', 'Évènement', 'Gluten, Lactose, Poisson, Œufs, Fruits à coque', 1),
(6, 'Menus de noel', 'Célébrez le printemps avec une déclinaison gourmande autour de l\'agneau et des premiers légumes de saison\n\n[Ingrédients] :\n- Entrée : Foie gras de canard IGP Sud-Ouest, figues fraîches, fleur de sel de Guérande, pain d\'épices maison\n- Plat : Poularde fermière des Landes, morilles séchées, crème fraîche d\'Isigny, pommes de terre Ratte, truffe noire Tuber melanosporum\n- Dessert :  Chocolat noir Valrhona 70%, noisettes du Périgord, piment d\'Espelette, vanille de Madagascar', 'Foie gras de canard mi-cuit, chutney de figues au Floc de Gascogne et brioche toastée', 'Suprême de poularde sauce aux morilles et son écrasé de pommes de terre à la truffe', 'Bûche pâtissière artisanale au chocolat intense et praliné croustillant', 48.00, 1, 12, 'Noel.webp', 'Noel', 'Aucun', 1),
(16, 'Delice de Bordeaux', 'venez découvrir les saveurs Bordelaise\n\n[Ingrédients] :\n- Entrée : Tranche de canard, salade, tomates, pignon de pin\n- Plat : Boeuf de Bazas, pommes de terre d\'Eyzines\n- Dessert : canlés saveur vanille, rhum', 'Salade de canard', 'Entrecôte bordelais', 'Canelés', 48.00, 1, 50, 'Delice Bordelais.jpg', 'Classique', 'Aucun', 1);

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `tel` varchar(50) DEFAULT NULL,
  `sujet` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `lu` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `avis`
--
ALTER TABLE `avis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commande_id` (`commande_id`);

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `commande_details`
--
ALTER TABLE `commande_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commande_id` (`commande_id`);

--
-- Index pour la table `horaires`
--
ALTER TABLE `horaires`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `avis`
--
ALTER TABLE `avis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `commande_details`
--
ALTER TABLE `commande_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `horaires`
--
ALTER TABLE `horaires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `avis`
--
ALTER TABLE `avis`
  ADD CONSTRAINT `avis_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `commande_details`
--
ALTER TABLE `commande_details`
  ADD CONSTRAINT `commande_details_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
