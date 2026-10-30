<?php
session_start();

require_once 'db_config.php';

// Inclusion des Contrôleurs MVC
require_once __DIR__ . '/src/Controllers/MenuController.php';
require_once __DIR__ . '/src/Controllers/CommandeController.php';

header('Content-Type: application/json; charset=utf-8');

if (!function_exists('verifierDroitsAcces')) {
    function verifierDroitsAcces($roles_autorises = []) {
        if (!isset($_SESSION['client_id'])) {
            http_response_code(401); 
            echo json_encode(["status" => "error", "message" => "Accès refusé : Veuillez vous connecter."]);
            exit; 
        }

        if (!empty($roles_autorises)) {
            $role_utilisateur = $_SESSION['client_role'] ?? '';
            
            if (!in_array($role_utilisateur, $roles_autorises)) {
                http_response_code(403); 
                echo json_encode(["status" => "error", "message" => "Accès refusé : Droits insuffisants."]);
                exit; 
            }
        }
    }
}

$action = $_REQUEST['action'] ?? '';

$json_input = json_decode(file_get_contents('php://input'), true);

if (empty($action) && isset($json_input['action'])) {
    $action = $json_input['action'];
}

// Instanciation des contrôleurs en leur injectant la connexion $pdo
$menuController = new MenuController($pdo);
$commandeController = new CommandeController($pdo);

switch ($action) {
    case 'login':
    case 'register':
    case 'get_current_user':
    case 'logout':
        require_once 'auth.php';
        break;

    case 'forgot_password':
    case 'reset_password_confirm':
        require 'password_reset.php';
        break;

    case 'create_employe':
    case 'get_employes':
    case 'delete_employe':
        require 'admin_employes.php';
        break;

    // --- GESTION DES MENUS (Via le Contrôleur MVC) ---
    case 'get_menus':
        $menuController->listMenus();
        break;
        
    case 'add_menu':
        verifierDroitsAcces(['admin', 'employe', 'utilisateur']);
        $menuController->addMenu($_POST, $_FILES);
        break;
        
    case 'delete_menu':
        $menuController->deleteMenu($_POST);
        break;

    // --- GESTION DES COMMANDES (Via le Contrôleur MVC) ---
    case 'place_order':
        $commandeController->placeOrder($json_input);
        break;
        
    case 'get_commandes':
        $commandeController->getCommandes();
        break;
        
    case 'get_commandes_client':
        $commandeController->getCommandesClient();
        break;
        
    case 'get_dashboard_stats':
        $commandeController->getDashboardStats();
        break;
        
    case 'get_booked_slots':
        $commandeController->getBookedSlots();
        break;
        
    case 'get_stats_ca':
        $commandeController->getStatsCa();
        break;
        
    case 'update_statut_commande':
        $commandeController->updateStatutCommande($_POST);
        break;
        
    case 'get_performance_menus':
    case 'get_performances_menus':
        $commandeController->getPerformanceMenus();
        break;

    case 'submit_review':
    case 'get_latest_reviews':
        require 'avis.php';
        break;

    case 'get_employe_commandes':
    case 'update_statut_employe':
    case 'cancel_commande_employe':
    case 'get_employe_avis':
    case 'moderate_avis':
    case 'delete_avis':
        require 'employe_api.php';
        break;

    case 'get_horaires':
    case 'update_horaire':
        require 'horaires.php';
        break;

    case 'send_message':
    case 'get_messages':
    case 'mark_message_read':
        require 'messages.php';
        break;

    default:
        echo json_encode([
            "status" => "error",
            "message" => "Action inconnue : " . $action
        ]);
        break;
}

exit;
?>