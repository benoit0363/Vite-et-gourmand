<?php
// On est appelé depuis index.php, $pdo est disponible.

if ($action === 'get_booked_slots') {
    try {
        $stmt = $pdo->query("SELECT date_prestation, heure_prestation FROM commandes WHERE statut != 'Annulée'");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) { echo json_encode([]); }
}
elseif ($action === 'place_order') {
    try {
        // 1. Lire les données
        $json_data = file_get_contents("php://input");
        $data = json_decode($json_data, true);

        // 2. Détection intelligente de l'email
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $email_session = $_SESSION['client_email'] ?? $_SESSION['email'] ?? $_SESSION['user_email'] ?? '';

        // 3. Récupérer les variables
        $nom        = $data['nom'] ?? 'Client inconnu';
        $email      = !empty($email_session) ? $email_session : ($data['email'] ?? '');
        $telephone  = $data['telephone'] ?? '';
        $adresse    = $data['adresse'] ?? null;
        $ville      = $data['ville'] ?? null;
        $panier     = $data['panier'] ?? [];
        $total      = isset($data['total']) ? floatval($data['total']) : 0;
        $date_prest = $data['date'] ?? null;
        $heure_prest= $data['heure'] ?? null;
        
        $details_panier_array = [
            'livraison' => $adresse,
            'articles' => $panier
        ];
        $details_panier_json = json_encode($details_panier_array);

        // 🚀 DÉBUT DE LA TRANSACTION (Indispensable pour l'intégrité des données)
        $pdo->beginTransaction();

        // 4. Requête SQL - Commande principale
       $sql = "INSERT INTO commandes (nom_client, email_client, telephone, adresse, ville, details_panier, prix_total, date_prestation, heure_prestation, statut)
       VALUES (:nom, :email, :telephone, :adresse, :ville, :panier, :total, :date_p, :heure_p, 'En attente')";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nom'       => $nom,
            ':email'     => $email,
            ':telephone' => $telephone,
            ':adresse'   => $adresse,
            ':ville'     => $ville,
            ':panier'    => $details_panier_json,
            ':total'     => $total,
            ':date_p'    => $date_prest,
            ':heure_p'   => $heure_prest
        ]);
      
        // 🎯 FIX : Récupération de l'ID de la commande qui vient d'être générée
        $commande_id = $pdo->lastInsertId();

        // 5. MISE À JOUR DES STOCKS & ENREGISTREMENT DANS COMMANDE_DETAILS
        foreach ($panier as $article) {
            $id_menu = intval($article['id'] ?? 0);
            $nom_menu = $article['titre'] ?? $article['title'] ?? $article['name'] ?? 'Menu inconnu';
            $quantite = intval($article['quantite'] ?? $article['qte'] ?? 1);
            $prix_unitaire = floatval(str_replace(',', '.', $article['prix'] ?? $article['price'] ?? 0));

            // Enregistrer le détail de la commande (sans total_ligne redondant)
            $stmtDetail = $pdo->prepare("
                INSERT INTO commande_details 
                (commande_id, menu_id, nom_menu, quantite, prix_unitaire)
                VALUES (:commande_id, :menu_id, :nom_menu, :quantite, :prix_unitaire)
            ");

            $stmtDetail->execute([
                ':commande_id'   => $commande_id,
                ':menu_id'       => $id_menu > 0 ? $id_menu : null,
                ':nom_menu'      => $nom_menu,
                ':quantite'      => $quantite,
                ':prix_unitaire' => $prix_unitaire
            ]);

            // Mettre à jour le stock du menu associé
            if ($id_menu > 0) {
                $sqlUpdateStock = "UPDATE menus SET remaining_quantity = remaining_quantity - :qte WHERE id = :id";
                $stmtStock = $pdo->prepare($sqlUpdateStock);
                $stmtStock->execute([
                    ':qte' => $quantite,
                    ':id'  => $id_menu
                ]);
            }
        }

        // Si tout s'est déroulé sans erreur, on valide définitivement en base de données
        $pdo->commit();

        echo json_encode(["status" => "success", "message" => "Commande enregistrée !"]);
    } catch (Exception $e) {
        // En cas de problème, on annule tout pour garder une base de données propre
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
    }
}

// 2. ACTION COMPTABILITÉ : PERFORMANCES DES MENUS (Pour ton dashboard Administrateur)
// Corrigé pour supporter 'get_performance_menus' ET 'get_performances_menus'
elseif ($action === 'get_performance_menus' || $action === 'get_performances_menus') {
    try {
        $stmt = $pdo->query("
            SELECT 
                cd.menu_id,
                cd.nom_menu,
                SUM(cd.quantite) AS total_parts_vendues,
                SUM(cd.quantite * cd.prix_unitaire) AS chiffre_affaires
            FROM commande_details cd
            INNER JOIN commandes c 
                ON cd.commande_id = c.id
            WHERE c.statut != 'Annulée'
            GROUP BY cd.menu_id, cd.nom_menu
            ORDER BY total_parts_vendues DESC
        ");

        echo json_encode([
            "status" => "success",
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
        exit;

    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Erreur SQL : " . $e->getMessage()
        ]);
    }
}
elseif ($action === 'get_commandes') {
    try {
        $stmt = $pdo->query("SELECT * FROM commandes ORDER BY date_commande DESC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
    }
}
elseif ($action === 'get_commandes_client') {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $email_utilisateur = $_SESSION['client_email'] ?? $_SESSION['email'] ?? $_SESSION['user_email'] ?? null;

    if (!$email_utilisateur) {
        echo json_encode(["status" => "error", "message" => "Non authentifié"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM commandes WHERE email_client = :email ORDER BY date_commande DESC");
        $stmt->execute([':email' => $email_utilisateur]);
        
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
    }
    exit;
}     
elseif ($action === 'get_dashboard_stats') {
    try {
        $stmtMois = $pdo->query("SELECT SUM(prix_total) as ca_mois, COUNT(*) as nb_commandes FROM commandes WHERE MONTH(date_commande) = MONTH(CURRENT_DATE()) AND YEAR(date_commande) = YEAR(CURRENT_DATE()) AND statut != 'Annulée'");
        $statsMois = $stmtMois->fetch(PDO::FETCH_ASSOC);

        $stmtClients = $pdo->query("SELECT COUNT(DISTINCT email_client) as nb_clients FROM commandes");
        $clients = $stmtClients->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "ca_mois"      => $statsMois['ca_mois'] ? floatval($statsMois['ca_mois']) : 0,
            "nb_commandes" => $statsMois['nb_commandes'] ? intval($statsMois['nb_commandes']) : 0,
            "nb_clients"   => $clients['nb_clients'] ? intval($clients['nb_clients']) : 0,
            "note_moyenne" => 4.8, "nb_avis" => 64
        ]);
        exit;
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} 
elseif ($action === 'get_stats_ca') {
    try {
        $stmt = $pdo->query("SELECT MONTH(date_commande) as mois, SUM(prix_total) as ca 
                             FROM commandes 
                             WHERE YEAR(date_commande) = YEAR(CURRENT_DATE()) AND statut != 'Annulée'
                             GROUP BY MONTH(date_commande)
                             ORDER BY mois ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
elseif ($action === 'update_statut_commande') {
    try {
        if (isset($_POST['id']) && isset($_POST['statut'])) {
            $id = intval($_POST['id']);
            $nouveauStatut = trim($_POST['statut']);

            $sql = "UPDATE commandes SET statut = :statut WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':statut' => $nouveauStatut, ':id' => $id]);

            echo json_encode(["status" => "success", "message" => "Statut mis à jour !"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Données manquantes."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
    }
}
?>