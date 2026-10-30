<?php
require_once __DIR__ . '/../../vendor/autoload.php';

try {
    // Connexion à MongoDB (en local par défaut)
    $client = new MongoDB\Client("mongodb://localhost:27017");
    
    // Test simple : lister les bases de données
    $databases = $client->listDatabases();
    
    echo "<h1>Connexion à MongoDB réussie ! 🎉</h1>";
    echo "<ul>";
    foreach ($databases as $database) {
        echo "<li>" . $database->getName() . "</li>";
    }
    echo "</ul>";

} catch (Exception $e) {
    echo "Erreur de connexion : " . $e->getMessage();
}
?>