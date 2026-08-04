<?php
// api/avis.php

// 1. Démarrage sécurisé de la session pour pouvoir lire $_SESSION['client_email']
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 2. On force l'en-tête de réponse en JSON pour le JavaScript
header('Content-Type: application/json; charset=utf-8');

// 3. Récupération de l'action demandée
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// 4. Utilisation de la variable globale $pdo (créée dans index.php)
global $pdo;

// Vérification de sécurité pour s'assurer que la base de données est accessible
if (!isset($pdo)) {
    echo json_encode(["status" => "error", "message" => "La connexion à la base de données (\$pdo) est introuvable."]);
    exit;
}

// CORRECTION : Nous démarrons la structure par un "if" (et non "elseif") pour éviter l'erreur de syntaxe
if ($action === 'submit_review') {
    try {
        // Identification du client connecté
        $email_utilisateur = $_SESSION['client_email'] ?? $_SESSION['email'] ?? $_SESSION['user_email'] ?? null;

        if (!$email_utilisateur) {
            echo json_encode(["status" => "error", "message" => "Vous devez être connecté pour laisser un avis."]);
            exit;
        }

        // Lecture des données JSON envoyées par fetch()
        $json_data = file_get_contents("php://input");
        $data = json_decode($json_data, true);

        $order_id = intval($data['order_id'] ?? 0);
        $rating   = intval($data['rating'] ?? 0);
        $comment  = trim($data['comment'] ?? '');

        if ($order_id === 0 || $rating === 0 || empty($comment)) {
            echo json_encode(["status" => "error", "message" => "Données d'avis incomplètes ou vides."]);
            exit;
        }

        // Vérification en amont : la commande existe-t-elle en base de données ?
        $checkCmd = $pdo->prepare("SELECT COUNT(*) FROM commandes WHERE id = :id");
        $checkCmd->execute([':id' => $order_id]);
        if ($checkCmd->fetchColumn() == 0) {
            echo json_encode(["status" => "error", "message" => "La commande #$order_id n'existe pas dans la base de données."]);
            exit;
        }

        // Insertion sécurisée de l'avis
        $sql = "INSERT INTO avis (email_client, commande_id, note, commentaire, date_avis) 
                VALUES (:email, :commande_id, :note, :commentaire, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':email'       => $email_utilisateur,
            ':commande_id' => $order_id,
            ':note'        => $rating,
            ':commentaire' => $comment
        ]);

        echo json_encode(["status" => "success", "message" => "Merci ! Votre avis a bien été enregistré."]);
        
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur de base de données : " . $e->getMessage()]);
    }
    exit;
}


// Récupération des avis pour l'affichage de la page d'accueil
elseif ($action === 'get_latest_reviews') {
    try {
        $sql = "SELECT avis.note, avis.commentaire, avis.date_avis, commandes.nom_client 
                FROM avis 
                INNER JOIN commandes ON avis.commande_id = commandes.id 
                ORDER BY avis.date_avis DESC 
                LIMIT 6";
        $stmt = $pdo->query($sql);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
    }
    exit;
}
?>