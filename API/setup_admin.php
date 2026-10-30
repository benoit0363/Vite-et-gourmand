<?php

require_once 'db_config.php'; 


$nom = 'Admin'; 
$prenom = 'Julie'; 
$email = 'julie@vite-et-gourmand.fr';
$password_clair = 'Viteetgourmand2026!';

// On crypte le mot de passe avant de le sauvegarder
$password_hash = password_hash($password_clair, PASSWORD_DEFAULT);

try {
   
    $stmt = $pdo->prepare("INSERT INTO clients (nom, prenom, email, mot_de_passe, role) 
                           VALUES (:nom, :prenom, :email, :password, 'admin')");
    
   
    $stmt->execute([
        'nom' => $nom,
        'prenom' => $prenom,
        'email' => $email,
        'password' => $password_hash
    ]);
    
    echo "<h1>Succès !</h1>";
    echo "<p>L'administrateur <b>$prenom $nom</b> ($email) a bien été créé.</p>";
    echo "<p>⚠️ IMPORTANT : Supprime maintenant ce fichier setup_admin.php.</p>";

} catch (PDOException $e) {
    echo "Erreur lors de la création : " . $e->getMessage();
}
?>