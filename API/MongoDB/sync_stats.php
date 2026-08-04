<?php

require '../config/database.php';
require 'connexion.php';

$db->stats_menus->deleteMany([]);

$stmt = $pdo->query("
    SELECT details_panier
    FROM commandes
");
$commandes = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($commandes as $commande) {
    $panier = json_decode(
        $commande['details_panier'],
        true
    );

    if (
        !isset($panier['articles'])
        ||
        !is_array($panier['articles'])
    ) {
        continue;
    }

    foreach ($panier['articles'] as $article) {

        $menuId = intval(
            $article['id'] ?? 0
        );
        $menuNom =
            $article['titre']
            ??
            $article['title']
            ??
            'Menu';
        $quantite = intval(
            $article['quantite']
            ??
            $article['qte']
            ??
            1
        );
        $prix = floatval(
            $article['prix']
            ??
            $article['price']
            ??
            0
        );
        $db->stats_menus->updateOne(
            [
                "menu_id" => $menuId
            ],
            [
                '$inc' => [

                    "nombre_commandes"
                        =>
                        $quantite,

                    "chiffre_affaires"
                        =>
                        ($quantite * $prix)
                ],
                '$set' => [
                    "nom_menu"
                        =>
                        $menuNom
                ]
            ],
            [
                'upsert' => true
            ]
        );
    }
}

echo "Synchronisation MongoDB terminée";