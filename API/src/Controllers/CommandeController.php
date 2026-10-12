<?php
require_once __DIR__ . '/../Models/CommandeModel.php';

class CommandeController {
    private $model;
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->model = new CommandeModel($pdo);
    }

    public function getBookedSlots() {
        try {
            $slots = $this->model->getBookedSlots();
            echo json_encode($slots);
        } catch (PDOException $e) {
            echo json_encode([]);
        }
    }

    public function placeOrder($data) {
        try {
            $email_session = $_SESSION['client_email'] ?? $_SESSION['email'] ?? $_SESSION['user_email'] ?? '';

            $nom        = $data['nom'] ?? 'Client inconnu';
            $email      = !empty($email_session) ? $email_session : ($data['email'] ?? '');
            $telephone  = $data['telephone'] ?? '';
            $adresse    = $data['adresse'] ?? null;
            $ville      = $data['ville'] ?? null;
            $panier     = $data['panier'] ?? [];
            $total      = isset($data['total']) ? floatval($data['total']) : 0;
            $date_prest = $data['date'] ?? null;
            $heure_prest= $data['heure'] ?? null;
            
            $details_panier_array = [
                'livraison' => $adresse,
                'articles'  => $panier
            ];
            $details_panier_json = json_encode($details_panier_array);

            // Démarrage de la transaction
            $this->pdo->beginTransaction();

            $commandeData = [
                ':nom'       => $nom,
                ':email'     => $email,
                ':telephone' => $telephone,
                ':adresse'   => $adresse,
                ':ville'     => $ville,
                ':panier'    => $details_panier_json,
                ':total'     => $total,
                ':date_p'    => $date_prest,
                ':heure_p'   => $heure_prest
            ];

            $commande_id = $this->model->createCommande($commandeData);       

            foreach ($panier as $article) {
                $id_menu       = intval($article['id'] ?? 0);
                $nom_menu      = $article['titre'] ?? $article['title'] ?? $article['name'] ?? 'Menu inconnu';
                $quantite      = intval($article['quantite'] ?? $article['qte'] ?? 1);
                $prix_unitaire = floatval(str_replace(',', '.', $article['prix'] ?? $article['price'] ?? 0));

                $detailData = [
                    ':commande_id'   => $commande_id,
                    ':menu_id'       => $id_menu > 0 ? $id_menu : null,
                    ':nom_menu'      => $nom_menu,
                    ':quantite'      => $quantite,
                    ':prix_unitaire' => $prix_unitaire
                ];

                $this->model->addCommandeDetail($detailData);

                if ($id_menu > 0) {
                    $this->model->updateStock($id_menu, $quantite);
                }
            }

            $this->pdo->commit();
            echo json_encode(["status" => "success", "message" => "Commande enregistrée !"]);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
        }
    }

    public function getPerformanceMenus() {
        try {
            $data = $this->model->getPerformanceMenus();
            echo json_encode([
                "status" => "success",
                "data"   => $data
            ]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
        }
    }

    public function getCommandes() {
        try {
            $data = $this->model->getAllCommandes();
            echo json_encode(["status" => "success", "data" => $data]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
        }
    }

    public function getCommandesClient() {
        $email_utilisateur = $_SESSION['client_email'] ?? $_SESSION['email'] ?? $_SESSION['user_email'] ?? null;

        if (!$email_utilisateur) {
            echo json_encode(["status" => "error", "message" => "Non authentifié"]);
            return;
        }

        try {
            $data = $this->model->getCommandesByEmail($email_utilisateur);
            echo json_encode(["status" => "success", "data" => $data]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
        }
    }

    public function getDashboardStats() {
        try {
            $stats = $this->model->getDashboardStats();
            echo json_encode($stats);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function getStatsCa() {
        try {
            $stats = $this->model->getStatsCa();
            echo json_encode($stats);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function updateStatutCommande($postData) {
        try {
            if (isset($postData['id']) && isset($postData['statut'])) {
                $id = intval($postData['id']);
                $nouveauStatut = trim($postData['statut']);

                $this->model->updateStatutCommande($id, $nouveauStatut);
                echo json_encode(["status" => "success", "message" => "Statut mis à jour !"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Données manquantes."]);
            }
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
        }
    }
}
?>