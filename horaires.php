<?php

header('Content-Type: application/json; charset=utf-8');

// Inclusion de la connexion à la base de données
require_once 'db_config.php';

// Récupération de l'action demandée
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ==========================================
// 1. RÉCUPÉRER LES HORAIRES (Affichage)
// ==========================================
if ($action === 'get_horaires') {
    try {
        // On récupère les 7 jours, triés du Dimanche (0) au Samedi (6) ou Lundi (1)
        $stmt = $pdo->query("SELECT jour_id, ouvert, midi_debut, midi_fin, soir_debut, soir_fin FROM horaires ORDER BY jour_id ASC");
        $horaires = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($horaires);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
    }
} 

// ==========================================
// 2. METTRE À JOUR UN HORAIRE (Enregistrement)
// ==========================================
elseif ($action === 'update_horaire') {
    try {
        // Le JavaScript moderne avec Fetch envoie souvent les données en JSON brut
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        // On récupère les variables (soit via JSON, soit via un formulaire POST classique)
        $jour_id    = isset($data['jour_id']) ? intval($data['jour_id']) : (isset($_POST['jour_id']) ? intval($_POST['jour_id']) : null);
        $ouvert     = isset($data['ouvert']) ? intval($data['ouvert']) : (isset($_POST['ouvert']) ? intval($_POST['ouvert']) : 0);
        $midi_debut = $data['midi_debut'] ?? $_POST['midi_debut'] ?? '00:00:00';
        $midi_fin   = $data['midi_fin'] ?? $_POST['midi_fin'] ?? '00:00:00';
        $soir_debut = $data['soir_debut'] ?? $_POST['soir_debut'] ?? '00:00:00';
        $soir_fin   = $data['soir_fin'] ?? $_POST['soir_fin'] ?? '00:00:00';

        // Si l'ID du jour est manquant, on arrête tout
        if ($jour_id === null) {
            echo json_encode(["status" => "error", "message" => "ID du jour manquant."]);
            exit;
        }

        // Requête de mise à jour
        $sql = "UPDATE horaires 
                SET ouvert = :ouvert, 
                    midi_debut = :midi_debut, 
                    midi_fin = :midi_fin, 
                    soir_debut = :soir_debut, 
                    soir_fin = :soir_fin 
                WHERE jour_id = :jour_id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':ouvert'     => $ouvert,
            ':midi_debut' => $midi_debut,
            ':midi_fin'   => $midi_fin,
            ':soir_debut' => $soir_debut,
            ':soir_fin'   => $soir_fin,
            ':jour_id'    => $jour_id
        ]);

        echo json_encode(["status" => "success", "message" => "Horaires mis à jour !"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur BDD : " . $e->getMessage()]);
    }
} 

// ==========================================
// 3. SI L'ACTION N'EXISTE PAS
// ==========================================
else {
    echo json_encode(["status" => "error", "message" => "Action non reconnue par l'API."]);
}
?>