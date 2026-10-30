<?php
require 'connexion.php';
$data = [];
$resultats = $db
->stats_menus
->find(
    [],
    [
        'sort' => [
            'nombre_commandes' => -1
        ]
    ]
);

foreach ($resultats as $menu) {
    $data[] = [
        "nom_menu"
            =>
            $menu['nom_menu'],

        "total_parts_vendues"
            =>
            $menu['nombre_commandes'],

        "chiffre_affaires"
            =>
            $menu['chiffre_affaires']
    ];
}
echo json_encode([
    "status" => "success",
    "data" => $data
]);