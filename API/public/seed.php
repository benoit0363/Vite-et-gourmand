<?php
require_once __DIR__ . '/../config/Database.php';

try {
    $pdo = Database::getConnection();
    $name = 'Julie';
    $email = 'julie@vite-et-gourmand.com';
    $password = password_hash('Viteetgourmand2026!', PASSWORD_BCRYPT);

    
    $stmt = $pdo->prepare("UPDATE clients SET mot_de_passe = ? WHERE email = ?");
    $stmt->execute([$password, $email]);

    echo "--- Mot de passe mis à jour avec succès dans la table 'clients' ! ---";
} catch (Exception $e) {
    echo "Erreur SQL : " . $e->getMessage();
}