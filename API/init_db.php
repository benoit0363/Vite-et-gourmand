<?php
// init_db.php

// 1. On importe votre fichier de configuration (qui contient la variable $pdo)
// __DIR__ permet de s'assurer que le chemin est correct peu importe d'où on lance le script
require_once __DIR__ . '/api/db_config.php';

try {
    // 2. On génère le mot de passe haché 
    $motDePasseEnClair = "Vite&Gourmand2026!";
    $motDePasseHache = password_hash($motDePasseEnClair, PASSWORD_DEFAULT);

    // 3. Préparation des informations de l'administrateur
    $nom = "Vite et Gourmand";
    $prenom = "Julie";
    $email = "admin@vite-et-gourmand.fr";
    $telephone = "0500000000";
    $adresse = "Boutique de Bordeaux";
    $ville = "Bordeaux";
    $role = "administrateur"; 

    // 4. Préparation et exécution de la requête SQL
    $stmt = $pdo->prepare("INSERT INTO clients (nom, prenom, email, mot_de_passe, telephone, adresse, ville, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$nom, $prenom, $email, $motDePasseHache, $telephone, $adresse, $ville, $role]);

    // 5. Message de succès pour l'évaluateur
    echo "<div style='font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>";
    echo "<h1 style='color: #4CAF50;'>✅ Installation réussie !</h1>";
    echo "<p>Le compte administrateur a bien été inséré dans la base de données.</p>";
    echo "<ul style='background: #f4f4f4; padding: 15px 30px; border-radius: 5px;'>";
    echo "<li><b>Identifiant :</b> " . $email . "</li>";
    echo "<li><b>Mot de passe :</b> " . $motDePasseEnClair . "</li>";
    echo "</ul>";
    // Remplacez 'login.html' par le vrai nom de votre page de connexion si différent
    echo "<a href='login.html' style='display: inline-block; margin-top: 15px; padding: 10px 20px; background: #007BFF; color: white; text-decoration: none; border-radius: 5px;'>Aller à la page de connexion</a>";
    echo "</div>";

} catch (PDOException $e) {
    echo "<div style='font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>";
    
    // Le code 23000 signifie que l'email (qui est probablement UNIQUE dans votre base) existe déjà
    if ($e->getCode() == 23000) {
         echo "<h1 style='color: #FF9800;'>⚠️ Information</h1>";
         echo "<p>Le compte administrateur a <b>déjà</b> été créé dans la base de données.</p>";
         echo "<a href='login.html'>Aller à la page de connexion</a>";
    } else {
         echo "<h1 style='color: #F44336;'>❌ Erreur SQL</h1>";
         echo "<p>" . $e->getMessage() . "</p>";
    }
    echo "</div>";
}
?>