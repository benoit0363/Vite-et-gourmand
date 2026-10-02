<?php
class MenuModel {
    private $pdo;

    // Le constructeur récupère la connexion à la base de données
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Méthode pour lire les menus
    public function getAllMenus() {
        $stmt = $this->pdo->query("SELECT id, title, description, starter, main_course, dessert, price, min_people, remaining_quantity, image, theme, allergens, is_active FROM menus ORDER BY id DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Méthode pour ajouter un menu
    public function insertMenu($data) {
        $sql = "INSERT INTO menus (title, description, starter, main_course, dessert, price, min_people, remaining_quantity, image, theme, allergens, is_active) 
                VALUES (:title, :description, :starter, :main_course, :dessert, :price, :min_people, :remaining_quantity, :image, :theme, :allergens, 1)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($data);
    }

    // Méthode pour supprimer un menu
    public function deleteMenu($id) {
        $stmt = $this->pdo->prepare("DELETE FROM menus WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
?>