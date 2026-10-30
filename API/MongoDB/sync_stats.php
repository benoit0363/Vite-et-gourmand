<?php
// sync_stats.php

require __DIR__ . '/../config/Database.php';
require 'connexion.php';

// 1. On initialise la connexion PDO
$pdo = Database::getConnection();

// 2. On vide l'ancienne collection MongoDB pour éviter les doublons lors de la synchro
$db->stats_menus->deleteMany([]);

// 3. On requête la table commande_details en agrégeant les totaux
// (On utilise les colonnes exactes de votre commande_details.sql)
$stmt = $pdo->query("
    SELECT 
        menu_id, 
        nom_menu, 
        SUM(quantite) as total_quantite, 
        SUM(quantite * prix_unitaire) as chiffre_affaires
    FROM commande_details
    GROUP BY menu_id, nom_menu
");

$statistiques = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 4. On insère les données agrégées dans MongoDB
foreach ($statistiques as $stat) {
    // Si menu_id est null, on met 0 par défaut pour éviter des erreurs
    $menuId = intval($stat['menu_id'] ?? 0);
    $quantite = intval($stat['total_quantite']);
    $ca = floatval($stat['chiffre_affaires']);
    $nomMenu = $stat['nom_menu'];

    $db->stats_menus->insertOne([
        "menu_id" => $menuId,
        "nom_menu" => $nomMenu,
        "nombre_commandes" => $quantite,
        "chiffre_affaires" => $ca
    ]);
}

echo "Synchronisation MySQL (commande_details) -> MongoDB terminée avec succès !";