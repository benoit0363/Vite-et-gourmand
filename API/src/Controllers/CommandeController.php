<?php
require_once __DIR__ . '/../Models/CommandeModel.php';

class CommandeController {
    private $model;
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->model = new CommandeModel($pdo);
    }

    public function placeOrder($data) {
        try {
            $this->pdo->beginTransaction();

            // 1. Enregistrement de la commande
            $commande_id = $this->model->createCommande($data);       
            foreach ($data['panier'] as $article) {
                // ... préparation des données de détail ...
                $this->model->addCommandeDetail($detail);
                if ($id_menu > 0) {
                    $this->model->updateStock($id_menu, $qte);
                }
            }

            $this->pdo->commit();
            echo json_encode(["status" => "success", "message" => "Commande enregistrée !"]);
        } catch (Exception $e) {
            $this->pdo->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}