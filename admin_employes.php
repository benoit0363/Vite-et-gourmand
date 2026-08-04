<?php
verifierDroitsAcces(['admin']);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

global $pdo;
$data = json_decode(file_get_contents('php://input'), true) ?? [];
// SÉCURITÉ RNCP : On vérifie que la personne connectée a bien le rôle "admin"
$role = $_SESSION['client_role'] ?? '';
// Décommentez ces lignes en production pour bloquer l'accès aux non-admins
/*
if ($role !== 'admin' && $role !== 'administrateur') {
    echo json_encode(["status" => "error", "message" => "Accès non autorisé. Réservé aux administrateurs."]);
    exit;
}
*/

header('Content-Type: application/json; charset=utf-8');

if (!function_exists('verifierMotDePasse')) {
    function verifierMotDePasse($mdp) {
        // La Regex exige : 10 caractères min, 1 Majuscule, 1 Minuscule, 1 Chiffre, 1 Caractère spécial
        return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/', $mdp);
    }
}

try {
    switch ($action) {
        
        // --- 1. LISTER TOUS LES EMPLOYÉS ---
        case 'get_employes':
            // On sélectionne uniquement les utilisateurs ayant le rôle "employe"
            $stmt = $pdo->query("SELECT id, nom, prenom, email, telephone, date_creation FROM clients WHERE role = 'employe' ORDER BY date_creation DESC");
            $employes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(["status" => "success", "data" => $employes]);
            break;

        // --- 2. CRÉER UN NOUVEL EMPLOYÉ ---
        case 'create_employe':
            $nom = trim($data['nom'] ?? $_POST['nom'] ?? '');
            $prenom = trim($data['prenom'] ?? $_POST['prenom'] ?? '');
            $email = trim($data['email'] ?? $_POST['email'] ?? '');
            $password = $data['mot_de_passe'] ?? $_POST['mot_de_passe'] ?? '';
            $telephone = trim($data['telephone'] ?? $_POST['telephone'] ?? '');

            if (empty($nom) || empty($prenom) || empty($email) || empty($password)) {
                echo json_encode(["status" => "error", "message" => "Veuillez remplir tous les champs obligatoires."]);
                exit;
            }

            // Vérification de la robustesse du mot de passe (fonction globale dans index.php)
            if (!verifierMotDePasse($password)) {
                echo json_encode(["status" => "error", "message" => "Le mot de passe doit contenir 10 caractères, Maj, Min, Chiffre et Caractère spécial."]);
                exit;
            }

            // On hache le mot de passe avant insertion
            $password_hash = password_hash($password, PASSWORD_DEFAULT);

            // On force le rôle à "employe"
            $role_employe = 'employe';

            try {
                $stmt = $pdo->prepare("INSERT INTO clients (nom, prenom, email, mot_de_passe, telephone, role) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$nom, $prenom, $email, $password_hash, $telephone, $role_employe]);
                
                echo json_encode(["status" => "success", "message" => "Le compte employé a été créé avec succès."]);
            } catch (PDOException $e) {
                // Code 23000 = Violation de contrainte d'unicité (L'email existe déjà)
                if ($e->getCode() == 23000) {
                    echo json_encode(["status" => "error", "message" => "Cette adresse email est déjà utilisée par un autre compte."]);
                } else {
                    throw $e;
                }
            }
            break;

        // --- 3. SUPPRIMER UN COMPTE EMPLOYÉ ---
        case 'delete_employe':
            $id = isset($data['id']) ? intval($data['id']) : (isset($_POST['id']) ? intval($_POST['id']) : 0);

            if ($id === 0) {
                echo json_encode(["status" => "error", "message" => "ID employé invalide."]);
                exit;
            }

            // Sécurité : On s'assure qu'on ne supprime QUE des employés (pour ne pas supprimer un client par erreur)
            $stmt = $pdo->prepare("DELETE FROM clients WHERE id = ? AND role = 'employe'");
            $stmt->execute([$id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(["status" => "success", "message" => "Le compte employé a été supprimé."]);
            } else {
                echo json_encode(["status" => "error", "message" => "Employé introuvable ou vous n'avez pas les droits."]);
            }
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Action non reconnue pour la gestion des employés."]);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
}
exit;
?>