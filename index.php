<?php
session_start();

require_once 'db_config.php';

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



switch ($action) {
    case 'login':
    case 'register':
    case 'get_current_user':
    case 'logout':
        require_once 'auth.php';//
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

    case 'get_menus':
    case 'add_menu':
    case 'delete_menu':
        require 'menus.php';
        break;

    case 'place_order':
    case 'get_commandes':
    case 'get_commandes_client':
    case 'get_dashboard_stats':
    case 'get_booked_slots':
    case 'get_stats_ca':
    case 'update_statut_commande':
    case 'get_performance_menus':
        require 'commandes.php';
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