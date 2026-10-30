<?php
// api/employe_api.php - Contrôleur d'API dédié aux fonctionnalités de l'Espace Employé
// Ce fichier est inclus par api/index.php, la connexion $pdo est disponible.

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

global $pdo;

// Sécurité RNCP : Seuls les employés et admins peuvent accéder à ces fonctionnalités métiers sensibles
$role_utilisateur = $_SESSION['client_role'] ?? '';
$role_utilisateur = $_SESSION['client_role'] ?? '';

if (
    $role_utilisateur !== 'employe'
    && $role_utilisateur !== 'admin'
) {

    http_response_code(403);

    echo json_encode([
        "status" => "error",
        "message" => "Accès interdit"
    ]);

    exit;
}

header('Content-Type: application/json; charset=utf-8');

try {
    switch ($action) {
        
        case 'get_employe_commandes':
            // Récupère l'intégralité des commandes, classées par date de commande décroissante
            $stmt = $pdo->query("SELECT * FROM commandes ORDER BY date_commande DESC");
            $commandes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $commandes]);
            break;

        case 'update_statut_employe':
            $id = isset($data['id']) ? intval($data['id']) : 0;
            $nouveau_statut = isset($data['statut']) ? trim($data['statut']) : '';

            $statuts_autorises = [
                'En attente', 'Accepté', 'En préparation', 
                'En cours de livraison', 'Livré', 
                'En attente du retour de matériel', 'Terminée'
            ];

            if ($id === 0 || !in_array($nouveau_statut, $statuts_autorises)) {
                echo json_encode(["status" => "error", "message" => "Données ou statut invalides."]);
                exit;
            }

            // Récupère l'email client avant mise à jour pour notifier en cas de prêt de matériel
            $stmtCmd = $pdo->prepare("SELECT email_client, nom_client FROM commandes WHERE id = ?");
            $stmtCmd->execute([$id]);
            $commandeInfo = $stmtCmd->fetch(PDO::FETCH_ASSOC);

            if (!$commandeInfo) {
                echo json_encode(["status" => "error", "message" => "Commande introuvable."]);
                exit;
            }

            // Mise à jour de l'état
            $stmtUpdate = $pdo->prepare("UPDATE commandes SET statut = ? WHERE id = ?");
            $stmtUpdate->execute([$nouveau_statut, $id]);

            // EXIGENCE RNCP : Mail automatique de pénalité de 600€ pour le matériel sous 10 jours
            $mail_envoye = false;
            if ($nouveau_statut === 'En attente du retour de matériel') {
                $to = $commandeInfo['email_client'];
                $sujet = "Restitution du matériel - Commande #$id - Vite & Gourmand";
                
                $message = "Bonjour " . htmlspecialchars($commandeInfo['nom_client']) . ",\n\n";
                $message .= "Votre réception est terminée et le matériel qui vous a été mis à disposition est désormais en attente de retour.\n\n";
                $message .= "⚠️ RAPPEL DE SECURITE : Conformément à nos CGV, vous disposez de 10 jours ouvrés pour nous retourner le matériel.\n";
                $message .= "Passé ce délai légal de 10 jours ouvrés, une pénalité forfaitaire de 600,00 € vous sera automatiquement facturée.\n\n";
                $message .= "Merci de prendre contact avec notre service client pour convenir d'un rendez-vous de restitution.\n\n";
                $message .= "Cordialement,\nL'équipe Vite & Gourmand";

                $headers = "From: logistique@vite-et-gourmand.fr\r\n";
                $headers .= "Reply-To: contact@vite-et-gourmand.fr\r\n";
                $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

                $mail_envoye = @mail($to, $sujet, $message, $headers);
            }

            echo json_encode([
                "status" => "success", 
                "message" => "Le statut a été mis à jour avec succès !",
                "notification_mail_envoye" => $mail_envoye
            ]);
            break;

        case 'cancel_commande_employe':
            $id = isset($data['id']) ? intval($data['id']) : 0;
            $mode_contact = isset($data['mode_contact']) ? trim($data['mode_contact']) : '';
            $motif = isset($data['motif']) ? trim($data['motif']) : '';

            if ($id === 0 || empty($mode_contact) || empty($motif)) {
                echo json_encode(["status" => "error", "message" => "Le mode de contact et le motif sont requis."]);
                exit;
            }

            // Enregistre l'annulation avec traçabilité complète dans la colonne téléphone pour des fins d'audit
            $annulation_log = "Annulée par l'employé le " . date('d/m/Y à H:i') . " après contact client par [$mode_contact]. Motif : $motif";

            $sql = "UPDATE commandes SET statut = 'Annulée', telephone = CONCAT(telephone, ' | Annulation: ', :log) WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':log' => $annulation_log,
                ':id'  => $id
            ]);

            echo json_encode([
                "status" => "success", 
                "message" => "La commande a bien été annulée et l'audit de contact a été enregistré."
            ]);
            break;

        case 'get_employe_avis':
            $sql = "SELECT avis.*, commandes.nom_client 
                    FROM avis 
                    LEFT JOIN commandes ON avis.commande_id = commandes.id 
                    ORDER BY avis.date_avis DESC";
            $stmt = $pdo->query($sql);
            $avis = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => $avis]);
            break;

        case 'moderate_avis':
            $id_avis = isset($data['id_avis']) ? intval($data['id_avis']) : 0;
            $decision = isset($data['decision']) ? trim($data['decision']) : ''; // 'valide' ou 'refuse'

            if ($id_avis === 0 || ($decision !== 'valide' && $decision !== 'refuse')) {
                echo json_encode(["status" => "error", "message" => "Données de modération invalides."]);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE avis SET statut = ? WHERE id = ?");
            $stmt->execute([$decision, $id_avis]);

            $msg = ($decision === 'valide') ? "Avis validé et publié sur la page d'accueil !" : "Avis rejeté.";
            echo json_encode(["status" => "success", "message" => $msg]);
            break;

        case 'moderate_avis':
            $id_avis = isset($data['id_avis']) ? intval($data['id_avis']) : 0;
            $decision = isset($data['decision']) ? trim($data['decision']) : ''; 

            if ($id_avis === 0 || ($decision !== 'valide' && $decision !== 'refuse')) {
                echo json_encode(["status" => "error", "message" => "Données de modération invalides."]);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE avis SET statut = ? WHERE id = ?");
            $stmt->execute([$decision, $id_avis]);

            $msg = ($decision === 'valide') ? "Avis validé et publié sur la page d'accueil !" : "Avis rejeté.";
            echo json_encode(["status" => "success", "message" => $msg]);
            break;

        // 👇 VOTRE NOUVEAU CODE VIENT SE GLISSER ICI 👇
        case 'delete_avis':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($data['id_avis'])) {
                $id_avis = (int)$data['id_avis'];
                $stmt = $pdo->prepare("DELETE FROM avis WHERE id = ?"); 
                
                if ($stmt->execute([$id_avis])) {
                    echo json_encode(["status" => "success", "message" => "Avis supprimé définitivement."]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Impossible de supprimer cet avis dans la base de données."]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "ID de l'avis manquant."]);
            }
            break; 
        // 👆 FIN DE VOTRE NOUVEAU CODE 👆

        default:
            echo json_encode(["status" => "error", "message" => "Action non gérée pour l'espace employé."]);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
}
exit;
?>