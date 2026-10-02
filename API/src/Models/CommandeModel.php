<?php
class CommandeModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getBookedSlots() {
        $stmt = $this->pdo->query("SELECT date_prestation, heure_prestation FROM commandes WHERE statut != 'Annulée'");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createCommande($data) {
        // La transaction est gérée ici ou dans le contrôleur selon vos préférences. 
        // Ici, on va préparer l'insertion principale.
        $sql = "INSERT INTO commandes (nom_client, email_client, telephone, adresse, ville, details_panier, prix_total, date_prestation, heure_prestation, statut)
                VALUES (:nom, :email, :telephone, :adresse, :ville, :panier, :total, :date_p, :heure_p, 'En attente')";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
        return $this->pdo->lastInsertId();
    }

    public function addCommandeDetail($detail) {
        $sql = "INSERT INTO commande_details (commande_id, menu_id, nom_menu, quantite, prix_unitaire)
                VALUES (:commande_id, :menu_id, :nom_menu, :quantite, :prix_unitaire)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($detail);
    }

    public function updateStock($id, $qte) {
        $stmt = $this->pdo->prepare("UPDATE menus SET remaining_quantity = remaining_quantity - :qte WHERE id = :id");
        $stmt->execute([':qte' => $qte, ':id' => $id]);
    }
    
    // Ajoutez ici les autres méthodes (get_commandes, update_statut, etc.)
}