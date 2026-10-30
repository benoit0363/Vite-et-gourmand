<?php
// API/src/Controllers/CommandeController.php

require_once __DIR__ . '/../Models/CommandeModel.php';

class CommandeController {
    private $commandeModel;

    public function __construct($pdo) {
        $this->commandeModel = new CommandeModel($pdo);
    }

    public function getBookedSlots() {
        $slots = $this->commandeModel->getBookedSlots();
        echo json_encode($slots);
    }

    public function placeOrder($json_input) {
        try {
            $id = $this->commandeModel->createCommande($json_input);
            echo json_encode(["status" => "success", "commande_id" => $id]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function getCommandes() {
        $commandes = $this->commandeModel->getAllCommandes();
        echo json_encode(["status" => "success", "data" => $commandes]);
    }

    public function getCommandesClient() {
        $email = $_SESSION['client_email'] ?? '';
        $commandes = $this->commandeModel->getCommandesByEmail($email);
        echo json_encode(["status" => "success", "data" => $commandes]);
    }

    public function getDashboardStats() {
        $stats = $this->commandeModel->getDashboardStats();
        echo json_encode($stats);
    }

    public function getStatsCa() {
        $stats = $this->commandeModel->getStatsCa();
        echo json_encode(["status" => "success", "data" => $stats]);
    }

    public function updateStatutCommande() {
        $id = $_POST['id'] ?? 0;
        $statut = $_POST['statut'] ?? '';
        $result = $this->commandeModel->updateStatutCommande($id, $statut);
        if ($result) {
            echo json_encode(["status" => "success", "message" => "Statut mis à jour avec succès"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Échec de la mise à jour"]);
        }
    }

    public function getPerformanceMenus() {
        $perf = $this->commandeModel->getPerformanceMenus();
        echo json_encode(["status" => "success", "data" => $perf]);
    }
}
?>