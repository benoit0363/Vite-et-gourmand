<?php

if (!function_exists('verifierMotDePasse')) {
    function verifierMotDePasse($password) {
        return strlen($password) >= 10
            && preg_match('/[A-Z]/', $password)
            && preg_match('/[a-z]/', $password)
            && preg_match('/[0-9]/', $password)
            && preg_match('/[^A-Za-z0-9]/', $password);
    }
}

switch ($action) {
    case 'get_current_user':
        // On vérifie si une session client existe
        if (isset($_SESSION['client_id'])) {
            echo json_encode([
                "logged_in" => true,
                "id"         => $_SESSION['client_id'],
                "nom"        => $_SESSION['client_nom'] ?? '',
                "prenom"     => $_SESSION['client_prenom'] ?? '',
                "email"      => $_SESSION['client_email'] ?? '',
                "telephone"  => $_SESSION['client_telephone'] ?? '',
                "adresse"    => $_SESSION['client_adresse'] ?? '',
                "ville"      => $_SESSION['client_ville'] ?? '',
                "role"       => $_SESSION['client_role'] ?? 'utilisateur'
            ]);
        } else {
            // Si personne n'est connecté
            echo json_encode([
                "logged_in" => false
            ]);
        }
        break;
        
    case 'register':
        $nom = $_POST['nom'] ?? '';
        $prenom = $_POST['prenom'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['mot_de_passe'] ?? '';
        $telephone = $_POST['telephone'] ?? '';
        $adresse = $_POST['adresse'] ?? '';
        $ville = $_POST['ville'] ?? '';
        $role = 'utilisateur'; // Consigne : rôle "utilisateur" attribué d'office

        if (empty($nom) || empty($prenom) || empty($email) || empty($password)) {
            echo json_encode(["status" => "error", "message" => "Veuillez remplir les champs obligatoires."]);
            exit;
        }

        // Vérification de la sécurité du mot de passe
        if (!verifierMotDePasse($password)) {
            echo json_encode([
                "status" => "error", 
                "message" => "Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
            ]);
            exit;
        }


        $password_hash = password_hash($password, PASSWORD_DEFAULT);

        try {
        // 1. Préparation de la requête SQL
        $stmt = $pdo->prepare("INSERT INTO clients (nom, prenom, email, mot_de_passe, telephone, adresse, ville, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        // 2. On exécute la requête ET on enregistre le résultat dans $success
        $success = $stmt->execute([$nom, $prenom, $email, $password_hash, $telephone, $adresse, $ville, $role]);

        // 3. On vérifie si ça a marché
        if ($success) {
            require_once 'mail.php';
            // On envoie l'e-mail automatique (n'oubliez pas require 'mail.php'; tout en haut du fichier !)
            @envoyerEmailBienvenue($email, $prenom);
            
            // On renvoie UN SEUL message de succès au JavaScript
            echo json_encode(["status" => "success", "message" => "Compte créé avec succès !"]);
        }
        
        } catch (PDOException $e) {
        // Gestion des erreurs (ex: email déjà pris)
        if ($e->getCode() == 23000) {
            echo json_encode(["status" => "error", "message" => "Cette adresse email est déjà utilisée."]);
        } else {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        }
        
        break;

        case 'logout':
        
            if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION = [];

        @session_destroy();
            
        header('Content-Type: application/json');
        
        echo json_encode([
            "status" => "success",
            "message" => "Déconnexion réussie."
        ]);
        break;

    case 'login':
    $email = $_POST['email'] ?? '';
    $password = $_POST['mot_de_passe'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM clients WHERE email = ?");
    $stmt->execute([$email]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($client && password_verify($password, $client['mot_de_passe'])) {

        // Stockage en session
        $_SESSION['client_id'] = $client['id'];
        $_SESSION['client_nom'] = $client['nom'];
        $_SESSION['client_prenom'] = $client['prenom'];
        $_SESSION['client_email'] = $client['email'];
        $_SESSION['client_telephone'] = $client['telephone'];
        $_SESSION['client_adresse'] = $client['adresse'];
        $_SESSION['client_ville'] = $client['ville'];
        $_SESSION['client_role'] = $client['role'];

        // Redirection selon le rôle
        switch ($client['role']) {
            case 'admin':
                $redirection = 'indexAdministrateur.html';
                break;

            case 'employe':
                $redirection = 'espace_employe.html';
                break;

            default:
                $redirection = 'index.html';
                break;
        }

        echo json_encode([
            "status" => "success",
            "redirection" => $redirection,
            "client" => [
                "nom" => $client['nom'],
                "prenom" => $client['prenom'],
                "role" => $client['role']
            ]
        ]);

    } else {

        echo json_encode([
            "status" => "error",
            "message" => "Email ou mot de passe incorrect."
        ]);
    }

    break;

    case 'forgot_password':
        $email = $_POST['email'] ?? '';

        if (empty($email)) {
            echo json_encode(["status" => "error", "message" => "Veuillez entrer votre adresse email."]);
            exit;
        }

        // On vérifie si l'email existe en BDD
        $stmt = $pdo->prepare("SELECT id FROM clients WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            // Consigne : Un lien par mail lui sera envoyé afin de l'inviter à le réinitialiser
            // Dans un vrai projet, on génère un token unique. Ici, on simule l'envoi du lien.
            $lienReset = "http://localhost/VITE-ET-GOURMAND/reset-password.html?email=" . urlencode($email);
            
            $sujet = "Réinitialisation de votre mot de passe";
            $messageMail = "Bonjour,\n\nCliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :\n$lienReset";
            $headers = "From: no-reply@viteetgourmand.com";
            @mail($email, $sujet, $messageMail, $headers);

            echo json_encode(["status" => "success", "message" => "Un mail de réinitialisation vous a été envoyé."]);
        } else {
            // Sécurité : On affiche le même message même si le mail n'existe pas pour éviter le brute-force d'emails
            echo json_encode(["status" => "success", "message" => "Si ce compte existe, un mail a été envoyé."]);
        }
        break;
}
?>