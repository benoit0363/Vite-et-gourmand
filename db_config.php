<?php
// api/db_config.php

$envPath = __DIR__ . '/../.env';

// On vérifie proprement que c'est bien un fichier existant et lisible
if (is_file($envPath) && is_readable($envPath)) {
    // parse_ini_file est une fonction PHP native parfaite pour lire le format du .env
    $env = parse_ini_file($envPath);
    if ($env !== false) {
        foreach ($env as $key => $value) {
            $_ENV[$key] = $value;
        }
    }
}

// Récupération des variables AVEC valeurs par défaut (au cas où Windows bloque le .env)
// Note : j'ai bien mis 'vite_gourmand' comme vu sur ton phpMyAdmin !
$host     = $_ENV['DB_HOST'] ?? 'localhost';
$dbname   = $_ENV['DB_NAME'] ?? 'vite_gourmand'; 
$username = $_ENV['DB_USER'] ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
} catch (PDOException $e) {
    // On affiche l'erreur en clair pour que tu puisses voir s'il y a un autre souci de BDD
    die(json_encode(["status" => "error", "message" => "Erreur BDD : " . $e->getMessage()]));
}
?>