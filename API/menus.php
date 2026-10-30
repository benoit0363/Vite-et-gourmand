<?php
verifierDroitsAcces(['admin','employe','utilisateur']);

if ($action === 'get_menus') {
    try {
        $stmt = $pdo->query("SELECT id, title, description, starter, main_course, dessert, price, min_people, remaining_quantity, image, theme, allergens, is_active FROM menus ORDER BY id DESC");
        echo json_encode($stmt->fetchAll());
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
    }
} 
elseif ($action === 'add_menu') {
    try {
        if (empty($_POST) && !empty($_SERVER['CONTENT_LENGTH'])) {
            echo json_encode(["status" => "error", "message" => "Le fichier image est trop lourd."]);
            exit;
        }

        // Récupération (ton code exact)
        $title              = $_POST['nom'] ?? 'Sans titre';
        $theme              = $_POST['theme'] ?? 'Classique';
        $price              = isset($_POST['prix']) ? floatval($_POST['prix']) : 0.00;
        $remaining_quantity = isset($_POST['stock']) ? intval($_POST['stock']) : 0;
        $min_people         = isset($_POST['personnes']) ? intval($_POST['personnes']) : 1;
        $starter            = $_POST['entree'] ?? '';
        $main_course        = $_POST['plat'] ?? '';
        $dessert            = $_POST['dessert'] ?? '';
        $allergens          = !empty($_POST['allergenes']) ? $_POST['allergenes'] : 'Aucun';

        $base_description   = $_POST['description'] ?? '';
        $ing_entree         = $_POST['ing_entree'] ?? 'Non spécifiés';
        $ing_plat           = $_POST['ing_plat'] ?? 'Non spécifiés';
        $ing_dessert        = $_POST['ing_dessert'] ?? 'Non spécifiés';

        $description = $base_description . "\n\n[Ingrédients] :\n- Entrée : " . $ing_entree . "\n- Plat : " . $ing_plat . "\n- Dessert : " . $ing_dessert;

        // Image (ton code exact)
        $image = "default.jpg";
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $fileExtension = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));
            if (in_array($fileExtension, ['jpg', 'jpeg', 'png', 'webp'])) {
                $newFileName = md5(time() . $_FILES['photo']['name']) . '.' . $fileExtension;
                $uploadFileDir = './uploads/';
                if(!is_dir($uploadFileDir)){ mkdir($uploadFileDir, 0755, true); }
                if(move_uploaded_file($_FILES['photo']['tmp_name'], $uploadFileDir . $newFileName)) {
                    $image = $newFileName;
                }
            }
        }

        $sql = "INSERT INTO menus (title, description, starter, main_course, dessert, price, min_people, remaining_quantity, image, theme, allergens, is_active) 
                VALUES (:title, :description, :starter, :main_course, :dessert, :price, :min_people, :remaining_quantity, :image, :theme, :allergens, 1)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':title' => $title, ':description' => $description, ':starter' => $starter, 
            ':main_course' => $main_course, ':dessert' => $dessert, ':price' => $price, 
            ':min_people' => $min_people, ':remaining_quantity' => $remaining_quantity, 
            ':image' => $image, ':theme' => $theme, ':allergens' => $allergens
        ]);

        echo json_encode(["status" => "success", "message" => "Menu enregistré avec succès !"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur BDD : " . $e->getMessage()]);
    }
}
elseif ($action === 'delete_menu') {
    try {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        if ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM menus WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(["status" => "success", "message" => "Menu supprimé."]);
        } else {
            echo json_encode(["status" => "error", "message" => "ID invalide."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur suppression : " . $e->getMessage()]);
    }
}
?>