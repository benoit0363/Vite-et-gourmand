<?php
// api/messages.php

// 1. Sécurité : Vérifier que ce fichier est bien inclus via index.php et pas appelé directement
if (!isset($pdo)) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "Accès direct interdit."]);
    exit;
}

// 2. Gestion des actions
switch ($action) {

    // --- ACTION : ENVOYER UN MESSAGE (Côté Client) ---
    case 'send_message':
        try {
            // Récupération des données JSON envoyées par le JS
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            // Validation des champs obligatoires
            if (empty($data['nom']) || empty($data['email']) || empty($data['message'])) {
                echo json_encode(["status" => "error", "message" => "Veuillez remplir les champs obligatoires (Nom, Email, Message)."]);
                exit;
            }

            // Validation du format de l'email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                echo json_encode(["status" => "error", "message" => "Format de l'adresse email invalide."]);
                exit;
            }

            // Requête d'insertion
            $stmt = $pdo->prepare("
                INSERT INTO messages (nom, email, tel, sujet, message) 
                VALUES (:nom, :email, :tel, :sujet, :message)
            ");
            
            $stmt->execute([
                ':nom'     => htmlspecialchars($data['nom']), // Protection XSS
                ':email'    => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
                ':tel'      => htmlspecialchars($data['tel'] ?? ''),
                ':sujet'    => htmlspecialchars($data['sujet'] ?? 'Sans sujet'),
                ':message'  => htmlspecialchars($data['message'])
            ]);

            echo json_encode(["status" => "success", "message" => "Votre message a bien été envoyé !"]);
            exit;

        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur lors de l'enregistrement : " . $e->getMessage()]);
            exit;
        }
        break;

    // --- ACTION : LIRE LES MESSAGES (Côté Admin) ---
    case 'get_messages':
        try {
            // Récupère tous les messages, du plus récent au plus ancien
            $stmt = $pdo->query("SELECT * FROM messages ORDER BY created_at DESC");
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => $messages]);
            exit;

        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur de récupération : " . $e->getMessage()]);
            exit;
        }
        break;

    // --- ACTION : MARQUER UN MESSAGE COMME LU (Côté Admin) ---
    case 'mark_message_read':
        try {
            $id = $_GET['id'] ?? $_POST['id'] ?? null;

            if (!$id) {
                echo json_encode(["status" => "error", "message" => "ID du message manquant."]);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE messages SET lu = 1 WHERE id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["status" => "success", "message" => "Message marqué comme lu."]);
            exit;

        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur de mise à jour : " . $e->getMessage()]);
            exit;
        }
        break;
}