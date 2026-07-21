document.addEventListener('DOMContentLoaded', () => {
    afficherDetailsMenu();
});

// On déclare une variable globale pour garder le menu en mémoire pour le panier
let menuActuel = null;

async function afficherDetailsMenu() {
    // 1. Récupérer l'ID du menu cliqué depuis le localStorage
    const menuId = localStorage.getItem('current_menu_id');
    
    if (!menuId) {
        afficherErreur();
        return;
    }

    try {
        // 2. Aller chercher TOUS les menus du serveur PHP
        // Note : On utilise 'api/index.php?action=get_menus' comme point d'entrée principal
        const response = await fetch('api/index.php?action=get_menus');
        const result = await response.json();
        
        // Sécurité : Si l'API renvoie {status: 'success', data: [...]}, on extrait la clé data.
        // Sinon, si l'API renvoie directement un tableau (comme votre api_menus), on l'utilise directement.
        const database = Array.isArray(result) ? result : (result.data || result);
        
        // 3. Trouver le menu précis qui a le bon ID (id_menu ou id)
        menuActuel = database.find(m => (m.id_menu || m.id) == menuId);

        // Sécurité si le menu n'existe pas en base de données
        if (!menuActuel) {
            afficherErreur();
            return;
        }

        // 4. Remplir le HTML avec les vraies données de la base SQL
        // Adaptation dynamique aux clés de colonnes de votre BDD (Français ou Anglais)
        document.getElementById('det-titre').innerText = menuActuel.titre || menuActuel.title || "Menu sans nom";
        
        // Gestion de l'image (Upload local ou par défaut)
        let imageSource = 'uploads/default.jpg';
        const imageFile = menuActuel.image || menuActuel.image_url;
        if (imageFile && imageFile !== 'default.jpg') {
            imageSource = imageFile.startsWith('http') ? imageFile : `uploads/${imageFile}`;
        }
        document.getElementById('det-image').src = imageSource;

        document.getElementById('det-theme').innerText = "Thème : " + (menuActuel.theme || "Classique");
        
        // Masquer le badge Régime s'il n'est pas utilisé ou mettre la valeur par défaut
        const regimeElement = document.getElementById('det-regime');
        if (regimeElement) {
            regimeElement.innerText = "Régime : " + (menuActuel.regime || "Standard");
        }
        
        // Prix
        const prixUnitaire = menuActuel.prix || menuActuel.price || 0;
        document.getElementById('det-prix').innerText = parseFloat(prixUnitaire).toFixed(2);
        
        // Plats (starter = entrée, main_course = plat principal, dessert = dessert)
        document.getElementById('det-entree').innerText = menuActuel.entree || menuActuel.starter || "Non précisée";
        document.getElementById('det-plat').innerText = menuActuel.plat || menuActuel.main_course || "Non précisé";
        document.getElementById('det-dessert').innerText = menuActuel.dessert || "Non précisé";

        // --- SÉPARATION DES INGRÉDIENTS STOCKÉS DANS LA DESCRIPTION ---
        let descriptionFinale = menuActuel.description || "";
        let ingEntree = menuActuel.ing_entree || "";
        let ingPlat = menuActuel.ing_plat || "";
        let ingDessert = menuActuel.ing_dessert || "";

        // Si la description contient la balise d'ingrédients ajoutée par add_menu
        if (descriptionFinale.includes("[Ingrédients] :")) {
            const parties = descriptionFinale.split("[Ingrédients] :");
            descriptionFinale = parties[0].trim(); // On garde la description propre
            const detailsIngredients = parties[1];  // Bloc des ingrédients concaténés

            // On extrait les lignes correspondantes
            const lignes = detailsIngredients.split('\n');
            lignes.forEach(ligne => {
                if (ligne.includes('- Entrée :')) ingEntree = ligne.replace('- Entrée :', '').trim();
                if (ligne.includes('- Plat :')) ingPlat = ligne.replace('- Plat :', '').trim();
                if (ligne.includes('- Dessert :')) ingDessert = ligne.replace('- Dessert :', '').trim();
            });
        }

        // Rendu des ingrédients
        document.getElementById('det-ing-entree').innerText = (ingEntree && ingEntree !== "Non spécifiés") ? "Produits : " + ingEntree : "";
        document.getElementById('det-ing-plat').innerText = (ingPlat && ingPlat !== "Non spécifiés") ? "Produits : " + ingPlat : "";
        document.getElementById('det-ing-dessert').innerText = (ingDessert && ingDessert !== "Non spécifiés") ? "Produits : " + ingDessert : "";

        // Logistique & Sécurité (allergens en anglais ou allergenes en français)
        document.getElementById('det-allergenes').innerText = menuActuel.allergenes || menuActuel.allergens || "Aucun allergène déclaré.";
        document.getElementById('det-conditions').innerText = descriptionFinale || menuActuel.conditions || "À consommer frais.";
        
        // Stock (stock en français ou remaining_quantity en anglais)
        const stockActuel = parseInt(menuActuel.stock || menuActuel.remaining_quantity) || 0;
        document.getElementById('det-stock').innerText = stockActuel <= 0 ? "❌ Épuisé" : stockActuel;

    } catch (error) {
        console.error("Erreur lors de la récupération du détail :", error);
        afficherErreur();
    }
}

// Petite fonction pour éviter de répéter le code d'erreur
function afficherErreur() {
    const container = document.querySelector('.detail-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <h2>Oups ! Menu introuvable.</h2>
                <a href="menus.html" class="btn-order-now" style="display:inline-block; margin-top:20px; background:#27ae60; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">Retour au catalogue</a>
            </div>`;
    }
}

// --- GESTION DU PANIER DEPUIS LES DÉTAILS ---
window.ajouterDepuisDetails = function() {
    if (menuActuel) {
        // Synchronisation avec le format multi-panier que tu utilises dans menus.js
        let panier = JSON.parse(localStorage.getItem('panier_multi')) || [];
        
        const menuId = menuActuel.id_menu || menuActuel.id;
        const existeDeja = panier.find(item => (item.id_menu || item.id) === menuId);

        if (!existeDeja) {
            panier.push(menuActuel);
            localStorage.setItem('panier_multi', JSON.stringify(panier));
            alert(`✅ ${menuActuel.titre || menuActuel.title} a été ajouté à votre panier !`);
        } else {
            alert("💡 Ce menu est déjà dans votre panier.");
        }
        
        // Retour automatique au catalogue
        window.location.href = "menus.html";
    }
}