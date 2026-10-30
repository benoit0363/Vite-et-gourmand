<?php
// api/db_config.php

// Définition propre du chemin vers le fichier .env à la racine
$envPath = __DIR__ . '/../.env';

if (is_file($envPath) && is_readable($envPath)) {
    $env = parse_ini_file($envPath);
    if ($env !== false) {
        foreach ($env as $key => $value) {
            $_ENV[$key] = $value;
        }
    }
}

// Récupération des variables avec les valeurs par défaut corrigées pour Docker
$host     = $_ENV['DB_HOST']     ?? 'db';
$dbname   = $_ENV['DB_NAME']     ?? 'vite et gourmand';
$username = $_ENV['DB_USER']     ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
} catch (PDOException $e) {
    die(json_encode(["status" => "error", "message" => "Erreur BDD : " . $e->getMessage()]));
}
?>