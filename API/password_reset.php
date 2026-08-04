<?php
// api/password_reset.php - Logique autonome de récupération de mot de passe

switch ($action) {
    // ==========================================
    // ÉTAPE 1 : ENVOI DE L'EMAIL DE RÉCUPÉRATION
    // ==========================================
    case 'forgot_password':
        $email = trim($data['email'] ?? '');
        
        if (empty($email)) {
            echo json_encode(["status" => "error", "message" => "L'adresse e-mail est requise."]);
            exit;
        }

        try {
            $stmt = $pdo->prepare("SELECT id, prenom FROM clients WHERE email = :email");
            $stmt->execute([':email' => $email]);
            $client = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($client) {
                // Génération d'un token sécurisé
                $token = bin2hex(random_bytes(32)); 
                $expires = date("Y-m-d H:i:s", time() + 3600); // 1 heure de validité

                // Enregistrement temporaire en base de données
                $updateStmt = $pdo->prepare("UPDATE clients SET reset_token = :token, reset_expires = :expires WHERE id = :id");
                $updateStmt->execute([
                    ':token' => $token,
                    ':expires' => $expires,
                    ':id' => $client['id']
                ]);

                // Préparation et envoi de l'e-mail
                $resetLink = "http://localhost/vite-et-gourmand/formulaire_MP.html?token=" . $token;
                
                $sujet = "Réinitialisation de votre mot de passe - Vite & Gourmand";
                $message = "Bonjour " . $client['prenom'] . ",\n\n";
                $message .= "Vous avez demandé la réinitialisation de votre mot de passe.\n";
                $message .= "Cliquez sur le lien ci-dessous pour en définir un nouveau :\n\n";
                $message .= $resetLink . "\n\n";
                $message .= "Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.\n";
                
                $headers = "From: noreply@vite-et-gourmand.fr\r\n";
                $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

                @mail($email, $sujet, $message, $headers);
            }

            // Norme OWASP : Toujours renvoyer un succès pour contrer l'énumération de comptes
            echo json_encode([
                "status" => "success", 
                "message" => "Si cette adresse e-mail est enregistrée, un lien de réinitialisation vient de lui être envoyé."
            ]);

        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Une erreur système est survenue."]);
        }
        break;

    // ==========================================
    // ÉTAPE 2 : CONFIRMATION ET CHANGEMENT EN BDD
    // ==========================================
    case 'reset_password_confirm':
        $token = trim($data['token'] ?? '');
        $new_password = $data['password'] ?? '';

        if (empty($token) || empty($new_password)) {
            echo json_encode(["status" => "error", "message" => "Données incomplètes."]);
            exit;
        }

        if (!verifierMotDePass($new_password)) {
            echo json_encode([
                "status" => "error",
                "message" => "Le nouveau mot de passe ne respecte pas les critères de sécurité requis."
            ]);
            exit;
        }

        try {
            // Vérification de la validité du token et de l'expiration
            $stmt = $pdo->prepare("SELECT id FROM clients WHERE reset_token = :token AND reset_expires > NOW()");
            $stmt->execute([':token' => $token]);
            $client = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($client) {
                $password_hash = password_hash($new_password, PASSWORD_DEFAULT);
                
                // Mise à jour et nettoyage immédiat du token pour empêcher une double utilisation
                $updateStmt = $pdo->prepare("UPDATE clients SET mot_de_passe = :pwd, reset_token = NULL, reset_expires = NULL WHERE id = :id");
                $updateStmt->execute([
                    ':pwd' => $password_hash, 
                    ':id' => $client['id']
                ]);
                
                echo json_encode([
                    "status" => "success", 
                    "message" => "Votre mot de passe a bien été modifié. Vous pouvez maintenant vous connecter !"
                ]);
            } else {
                echo json_encode([
                    "status" => "error", 
                    "message" => "Le lien de réinitialisation est invalide ou a expiré."
                ]);
            }
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur système lors du changement de mot de passe."]);
        }
        break;
}
?>