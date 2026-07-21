// On attend que la page soit bien chargée
document.addEventListener('DOMContentLoaded', () => {
    chargerMenus();
   
    // Écouteurs pour les filtres et le tri
    document.getElementById('filter-theme')?.addEventListener('change', chargerMenus);
    document.getElementById('filter-regime')?.addEventListener('change', chargerMenus);
    document.getElementById('filter-prix-max')?.addEventListener('input', chargerMenus);
    document.getElementById('sort-price')?.addEventListener('change', chargerMenus);
    document.getElementById('filter-pers-min')?.addEventListener('input', chargerMenus);
   
    document.getElementById('cust-guests')?.addEventListener('input', actualiserTotal);
    actualiserCompteurPanier();

    // Écouteur pour le formulaire de validation de commande rapide
    document.getElementById('form-commande')?.addEventListener('submit', validerCommande);
});

// --------------------------------------------------------
// 1️⃣ AFFICHAGE DU CATALOGUE DE MENUS
// --------------------------------------------------------
async function chargerMenus() {
    const grid = document.getElementById('menus-grid');
    if (!grid) return;

    try {
        // --- MISE À JOUR DU CHEMIN DE L'API ICI ---
        const response = await fetch('api/index.php?action=get_menus');
        const database = await response.json();

        // Récupération des valeurs des filtres
        const theme = document.getElementById('filter-theme')?.value || 'tous';
        const regime = document.getElementById('filter-regime')?.value || 'tous';
        const prixMax = document.getElementById('filter-prix-max')?.value;
        const convivesMin = document.getElementById('filter-pers-min')?.value;
        const tri = document.getElementById('sort-price')?.value;

        grid.innerHTML = '';

        // --- FILTRAGE DES MENUS ---
        let menusAffiches = database.filter(menu => {
            const nbPersonnes = menu.min_people || 0; 
            const regimeMenu = menu.allergens || 'tous'; 
            const prixMenu = menu.price || 0; 

            return (theme === 'tous' || menu.theme === theme) &&
                   (regime === 'tous' || regimeMenu.includes(regime)) && 
                   (!prixMax || parseFloat(prixMenu) <= parseFloat(prixMax)) &&
                   (!convivesMin || parseInt(nbPersonnes) >= parseInt(convivesMin));
        });

        // --- TRI DES MENUS ---
        if (tri === "asc") {
            menusAffiches.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
        } else if (tri === "desc") {
            menusAffiches.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        }

        // --- GÉNÉRATION DE L'AFFICHAGE (CARTES) ---
        menusAffiches.forEach((menu) => {
            const card = document.createElement('div');
            card.className = 'menu-card';
           
            // Gestion du stock
            const stockActuel = menu.remaining_quantity !== undefined && menu.remaining_quantity !== null ? parseInt(menu.remaining_quantity) : 10; 
            const isEpuise = stockActuel <= 0;
           
            // Gestion de l'image et du texte
            const imgPath = menu.image && menu.image !== "default.jpg" ? "uploads/" + menu.image : "uploads/default.jpg";
            const affichageTitre = menu.title || "Menu sans nom"; 
            const affichagePrix = menu.price ? parseFloat(menu.price).toFixed(2) + " €" : "Prix non défini";

            // Nettoyage de la description pour l'aperçu
            let descCourte = menu.description || 'Découvrez notre menu de saison.';
            if(descCourte.includes('[Ingrédients]')) {
                descCourte = descCourte.split('[Ingrédients]')[0]; 
            }

            
           card.innerHTML = `
                <img src="${imgPath}" alt="${affichageTitre}" class="menu-img" style="${isEpuise ? 'filter: grayscale(1);' : ''}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1495195134817-a1a18bc0c411?auto=format&fit=crop&w=500&q=80';">
                <div class="menu-content" style="display: flex; flex-direction: column; height: 100%;">
                    <span class="badge-regime">${menu.theme || 'Classique'}</span>
                    <h3>${affichageTitre}</h3>
                    <p class="menu-desc" style="white-space: pre-line; flex-grow: 1;">${descCourte}</p>
                    <div class="menu-price">${affichagePrix}</div>
                    <p style="font-size:0.8rem; color:${isEpuise ? '#ef4444' : '#16a34a'}; font-weight: bold; margin-bottom: 12px;">
                        ${isEpuise ? '❌ Épuisé' : `📦 ${stockActuel} Disponible(s)`}
                    </p>
                    
                    <!-- NOUVEAU BLOC BOUTONS -->
                    <div style="display:flex; gap:10px; margin-top:auto;">
                        
                        <!-- Bouton Détails : Style clair et discret -->
                        <button onclick="voirDetail(${menu.id})" 
                                class="btn-add" 
                                style="padding: 8px 16px; background-color: #ffffff; color: #4b5563; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.9rem;">
                            Détails
                        </button>

                        <!-- Bouton Panier : Style principal (Vert raccord avec ton header) -->
                        <button onclick='choisirMenu(${JSON.stringify(menu).replace(/'/g, "&apos;")})'
                                class="btn-add"
                                style="flex:1; padding: 8px 16px; background-color: ${isEpuise ? '#f3f4f6' : '#9ca996'}; color: ${isEpuise ? '#9ca3af' : '#ffffff'}; border: none; border-radius: 6px; cursor: ${isEpuise ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 0.9rem;"
                                ${isEpuise ? 'disabled' : ''}>
                            ${isEpuise ? 'Indisponible' : '🛒 Panier'}
                        </button>
                        
                    </div>
                </div>
            `;
        grid.appendChild(card);
        });
    } catch (error) {
        console.error("Erreur d'affichage JavaScript :", error);
    }
    window.voirDetail = function(idMenu) {
        // 1. On sauvegarde l'ID du menu cliqué dans la mémoire du navigateur
        localStorage.setItem('current_menu_id', idMenu);
        
        // 2. On redirige vers la page de détails
        window.location.href = 'menus-details.html';
    };
}

// --------------------------------------------------------
// 2️⃣ NAVIGATION VERS LES DÉTAILS DU MENU
// --------------------------------------------------------
function voirDetail(id) {
    localStorage.setItem('current_menu_id', id);
    window.location.href = "menus-details.html";
}

// --------------------------------------------------------
// 3️⃣ GESTION DU PANIER (LOCALSTORAGE)
// --------------------------------------------------------
function choisirMenu(menu) {
    let panier = JSON.parse(localStorage.getItem('panier_multi')) || [];
    const existeDeja = panier.find(item => item.id === menu.id);

    if (!existeDeja) {
        // Création d'un objet "bilingue" pour assurer la compatibilité avec la page panier
        const produitPourPanier = {
            ...menu, 
            id: menu.id,
            nom: menu.title,       
            titre: menu.title,     
            price: parseFloat(menu.price),
            prix: parseFloat(menu.price), 
            min_people: parseInt(menu.min_people) || 1,
            persMin: parseInt(menu.min_people) || 1,
            quantite: parseInt(menu.min_people) || 4 
        };

        panier.push(produitPourPanier);
        localStorage.setItem('panier_multi', JSON.stringify(panier));
        alert(`✅ ${menu.title} a été ajouté à votre panier !`);
    } else {
        alert("💡 Ce menu est déjà présent dans votre panier.");
    }
    actualiserCompteurPanier();
}

function actualiserCompteurPanier() {
    const panier = JSON.parse(localStorage.getItem('panier_multi')) || [];
    const countElement = document.getElementById('panier-count');
    if (countElement) countElement.innerText = panier.length;
}

function actualiserTotal() {
    // Calcul dynamique sur la page si besoin
}

// --------------------------------------------------------
// 4️⃣ VALIDATION DE LA COMMANDE ET ENVOI À L'API
// --------------------------------------------------------
async function validerCommande(event) {
    if (event) event.preventDefault(); 

    const panier = JSON.parse(localStorage.getItem('panier_multi')) || [];
    if (panier.length === 0) {
        alert("Votre panier est vide ! Ajoutez des menus avant de commander.");
        return;
    }

    const total = panier.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

    const nomClient = document.getElementById('client-nom')?.value || 'Client sans nom';
    const emailClient = document.getElementById('client-email')?.value || 'Sans email';
    const telClient = document.getElementById('client-tel')?.value || 'Sans téléphone';

    const formData = new FormData();
    formData.append('nom', nomClient);
    formData.append('email', emailClient);
    formData.append('telephone', telClient);
    formData.append('panier', JSON.stringify(panier));
    formData.append('total', total);

    try {
        // --- MISE À JOUR DU CHEMIN DE L'API ICI ---
        const response = await fetch('api/index.php?action=place_order', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === "success") {
            alert("🎉 Merci ! Votre commande a bien été transmise aux cuisines.");
            localStorage.removeItem('panier_multi'); 
            actualiserCompteurPanier();
            window.location.reload(); 
        } else {
            alert("❌ Un problème est survenu : " + result.message);
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Impossible de joindre le serveur pour valider la commande.");
    }
}