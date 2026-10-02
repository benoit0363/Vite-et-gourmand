<?php
// public/index.php

// 1. Chargement des dépendances et de la configuration
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../src/Core/Response.php';
require_once __DIR__ . '/../src/Core/AuthMiddleware.php';
require_once __DIR__ . '/../src/Models/MenuModel.php';
require_once __DIR__ . '/../src/Models/CommandeModel.php';
require_once __DIR__ . '/../src/Controllers/MenuController.php';
require_once __DIR__ . '/../src/Controllers/CommandeController.php';

// 2. Configuration CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 3. Connexion BDD et lecture de la requête
$pdo    = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Détection automatique du contenu (JSON ou FormData POST)
$jsonInput = json_decode(file_get_contents('php://input'), true) ?? [];
$postData  = !empty($_POST) ? $_POST : $jsonInput;

$entity = $_GET['entity'] ?? null;
$action = $_GET['action'] ?? null;

if (!$entity) {
    Response::json(['message' => 'Bienvenue sur l\'API Vite & Gourmand'], 200);
}

// 4. Aiguillage des requêtes (Routeur MVC)
switch ($entity) {

    // --- ENTITÉ MENUS ---
    case 'menus':
        $controller = new MenuController($pdo);

        if ($method === 'GET' || $action === 'get_menus') {
            $controller->listMenus();
        } elseif ($action === 'add_menu') {
            $user = AuthMiddleware::requireAuth($pdo);
            AuthMiddleware::checkRole($user, ['admin', 'employe']);
            $controller->addMenu($_POST, $_FILES);
        } elseif ($action === 'delete_menu') {
            $user = AuthMiddleware::requireAuth($pdo);
            AuthMiddleware::checkRole($user, ['admin', 'employe']);
            $controller->deleteMenu($postData);
        } else {
            Response::error('Action non reconnue pour les menus');
        }
        break;

    // --- ENTITÉ COMMANDES ---
    case 'commandes':
        $controller = new CommandeController($pdo);

        if ($action === 'get_booked_slots') {
            $controller->getBookedSlots();
        } elseif ($action === 'place_order') {
            $controller->placeOrder($postData);
        } elseif ($action === 'get_commandes') {
            $user = AuthMiddleware::requireAuth($pdo);
            AuthMiddleware::checkRole($user, ['admin', 'employe']);
            $controller->getCommandes();
        } elseif ($action === 'get_commandes_client') {
            $user = AuthMiddleware::requireAuth($pdo);
            $controller->getCommandesClient($user);
        } elseif ($action === 'get_dashboard_stats') {
            $user = AuthMiddleware::requireAuth($pdo);
            AuthMiddleware::checkRole($user, ['admin', 'employe']);
            $controller->getDashboardStats();
        } elseif ($action === 'get_stats_ca') {
            $user = AuthMiddleware::requireAuth($pdo);
            AuthMiddleware::checkRole($user, ['admin']);
            $controller->getStatsCa();
        } elseif ($action === 'get_performance_menus' || $action === 'get_performances_menus') {
            $user = AuthMiddleware::requireAuth($pdo);
            AuthMiddleware::checkRole($user, ['admin']);
            $controller->getPerformanceMenus();
        } elseif ($action === 'update_statut_commande') {
            $user = AuthMiddleware::requireAuth($pdo);
            AuthMiddleware::checkRole($user, ['admin', 'employe']);
            $controller->updateStatut($postData);
        } else {
            Response::error('Action non reconnue pour les commandes');
        }
        break;

    case 'auth':
        // On inclut directement votre script d'authentification existant
        require_once __DIR__ . '/../auth.php';
        break;

    default:
        Response::error('Entité introuvable', 404);
}
