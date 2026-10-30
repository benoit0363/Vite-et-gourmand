<?php
// src/Core/AuthMiddleware.php

class AuthMiddleware {
    public static function requireAuth(PDO $pdo): array {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // 1. Vérification par En-tête Authorization (Bearer Token)
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = trim(str_replace('Bearer', '', $auth));

        if (!empty($token)) {
            $stmt = $pdo->prepare('SELECT id, name, email, role FROM users WHERE auth_token = ? AND token_expires > NOW()');
            $stmt->execute([$token]);
            $user = $stmt->fetch();
            if ($user) {
                return $user;
            }
        }

        // 2. Vérification par Session (Support du code existant)
        if (isset($_SESSION['client_email']) || isset($_SESSION['email']) || isset($_SESSION['user_email'])) {
            $email = $_SESSION['client_email'] ?? $_SESSION['email'] ?? $_SESSION['user_email'];
            return [
                'email' => $email,
                'role'  => $_SESSION['role'] ?? 'utilisateur'
            ];
        }

        Response::error('Non authentifié ou session expirée', 401);
    }

    public static function checkRole(array $user, array $allowedRoles): void {
        $userRole = strtolower(trim($user['role'] ?? 'guest'));
        $allowed = array_map('strtolower', $allowedRoles);

        if (!in_array($userRole, $allowed)) {
            Response::error('Accès refusé : droits insuffisants', 403);
        }
    }
}