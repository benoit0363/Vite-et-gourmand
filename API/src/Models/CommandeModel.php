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

    public function getPerformanceMenus() {
        $stmt = $this->pdo->query("
            SELECT 
                cd.menu_id,
                cd.nom_menu,
                SUM(cd.quantite) AS total_parts_vendues,
                SUM(cd.quantite * cd.prix_unitaire) AS chiffre_affaires
            FROM commande_details cd
            INNER JOIN commandes c ON cd.commande_id = c.id
            WHERE c.statut != 'Annulée'
            GROUP BY cd.menu_id, cd.nom_menu
            ORDER BY total_parts_vendues DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllCommandes() {
        $stmt = $this->pdo->query("SELECT * FROM commandes ORDER BY date_commande DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCommandesByEmail($email) {
        $stmt = $this->pdo->prepare("SELECT * FROM commandes WHERE email_client = :email ORDER BY date_commande DESC");
        $stmt->execute([':email' => $email]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDashboardStats() {
        try {
            // 1. Calcul du Chiffre d'Affaires du mois en cours
            $stmtCa = $this->pdo->query("SELECT SUM(prix_total) as ca FROM commandes WHERE MONTH(date_commande) = MONTH(CURRENT_DATE()) AND YEAR(date_commande) = YEAR(CURRENT_DATE())");
            $caData = $stmtCa->fetch(PDO::FETCH_ASSOC);
            $ca_mois = $caData['ca'] ?? 0;

            // 2. Nombre total de commandes
            $stmtCmd = $this->pdo->query("SELECT COUNT(*) as nb FROM commandes");
            $cmdData = $stmtCmd->fetch(PDO::FETCH_ASSOC);
            $nb_commandes = $cmdData['nb'] ?? 0;

            // 3. Nombre de clients uniques (avec la bonne colonne email_client)[cite: 10]
            $stmtClients = $this->pdo->query("SELECT COUNT(DISTINCT email_client) as nb FROM commandes");
            $clientData = $stmtClients->fetch(PDO::FETCH_ASSOC);
            $nb_clients = $clientData['nb'] ?? 0;

            // 4. Nombre d'avis et note moyenne récupérés de la table 'avis'
            $stmtAvis = $this->pdo->query("SELECT COUNT(*) as nb_avis, AVG(note) as note_moyenne FROM avis");
            $avisData = $stmtAvis->fetch(PDO::FETCH_ASSOC);

            // 5. Retour du tableau JSON formaté
            return [
                "status"       => "success",
                "ca_mois"      => floatval($ca_mois),
                "nb_commandes" => intval($nb_commandes),
                "nb_clients"   => intval($nb_clients),
                "nb_avis"      => intval($avisData['nb_avis'] ?? 0),
                "note_moyenne" => floatval($avisData['note_moyenne'] ?? 0)
            ];

        } catch (PDOException $e) {
            return [
                "status"  => "error",
                "message" => $e->getMessage()
            ];
        }
    }
    
    public function getStatsCa() {
        $stmt = $this->pdo->query("SELECT MONTH(date_commande) as mois, SUM(prix_total) as ca 
                             FROM commandes 
                             WHERE YEAR(date_commande) = YEAR(CURRENT_DATE()) AND statut != 'Annulée'
                             GROUP BY MONTH(date_commande)
                             ORDER BY mois ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStatutCommande($id, $nouveauStatut) {
        $sql = "UPDATE commandes SET statut = :statut WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([':statut' => $nouveauStatut, ':id' => $id]);
    }
}
?>