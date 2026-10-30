<?php
require_once __DIR__ . '/../Models/MenuModel.php';

class MenuController {
    private $menuModel;

    public function __construct($pdo) {
        // On instancie le modèle en lui passant la base de données
        $this->menuModel = new MenuModel($pdo);
    }

    public function listMenus() {
        try {
            $menus = $this->menuModel->getAllMenus();
            echo json_encode($menus);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
        }
    }

    public function addMenu($postData, $fileData) {
        try {
            if (empty($postData) && empty($fileData)) {
                echo json_encode(["status" => "error", "message" => "Données invalides ou fichier trop lourd."]);
                return;
            }

            // Récupération des données comme dans votre code d'origine
            $base_description   = $postData['description'] ?? '';
            $ing_entree         = $postData['ing_entree'] ?? 'Non spécifiés';
            $ing_plat           = $postData['ing_plat'] ?? 'Non spécifiés';
            $ing_dessert        = $postData['ing_dessert'] ?? 'Non spécifiés';
            
            $description = $base_description . "\n\n[Ingrédients] :\n- Entrée : " . $ing_entree . "\n- Plat : " . $ing_plat . "\n- Dessert : " . $ing_dessert;

            // Gestion de l'image
            $image = "default.jpg";
            if (isset($fileData['photo']) && $fileData['photo']['error'] === UPLOAD_ERR_OK) {
                $fileExtension = strtolower(pathinfo($fileData['photo']['name'], PATHINFO_EXTENSION));
                if (in_array($fileExtension, ['jpg', 'jpeg', 'png', 'webp'])) {
                    $newFileName = md5(time() . $fileData['photo']['name']) . '.' . $fileExtension;
                    $uploadFileDir = './uploads/';
                    if(!is_dir($uploadFileDir)){ mkdir($uploadFileDir, 0755, true); }
                    if(move_uploaded_file($fileData['photo']['tmp_name'], $uploadFileDir . $newFileName)) {
                        $image = $newFileName;
                    }
                }
            }

            // Préparation des données pour le Modèle
            $data = [
                'title' => $postData['nom'] ?? 'Sans titre', 
                'description' => $description, 
                'starter' => $postData['entree'] ?? '', 
                'main_course' => $postData['plat'] ?? '', 
                'dessert' => $postData['dessert'] ?? '', 
                'price' => isset($postData['prix']) ? floatval($postData['prix']) : 0.00, 
                'min_people' => isset($postData['personnes']) ? intval($postData['personnes']) : 1, 
                'remaining_quantity' => isset($postData['stock']) ? intval($postData['stock']) : 0, 
                'image' => $image, 
                'theme' => $postData['theme'] ?? 'Classique', 
                'allergens' => !empty($postData['allergenes']) ? $postData['allergenes'] : 'Aucun'
            ];

            // Appel au Modèle pour insérer en BDD
            $this->menuModel->insertMenu($data);
            echo json_encode(["status" => "success", "message" => "Menu enregistré avec succès !"]);

        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur BDD : " . $e->getMessage()]);
        }
    }

    public function deleteMenu($postData) {
        try {
            $id = isset($postData['id']) ? intval($postData['id']) : 0;
            if ($id > 0) {
                $this->menuModel->deleteMenu($id);
                echo json_encode(["status" => "success", "message" => "Menu supprimé."]);
            } else {
                echo json_encode(["status" => "error", "message" => "ID invalide."]);
            }
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur suppression : " . $e->getMessage()]);
        }
    }
}
?>