<?php

require_once __DIR__ . '/../vendor/autoload.php';

try {

    $client = new MongoDB\Client(
        "mongodb://localhost:27017"
    );

    $db = $client->vite_gourmand;

} catch (Exception $e) {

    die(
        "Erreur de connexion MongoDB : "
        . $e->getMessage()
    );
}