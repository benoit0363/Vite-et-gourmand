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
        // --- GÉNÉRATION DE L'AFFICHAGE (CARTES) ---
        menusAffiches.forEach((menu) => {
            const card = document.createElement('div');
            // Stylisation de la carte avec Tailwind CSS
            card.className = 'bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden flex flex-col justify-between transition-all hover:shadow-md';
           
            // Gestion du stock
            const stockActuel = menu.remaining_quantity !== undefined && menu.remaining_quantity !== null ? parseInt(menu.remaining_quantity) : 10; 
            const isEpuise = stockActuel <= 0;
           
            // Gestion de l'image et du texte
            const imgPath = menu.image && menu.image !== "default.jpg" ? "images/" + menu.image : "images/default.jpg";
            const affichageTitre = menu.title || "Menu sans nom"; 
            const affichagePrix = menu.price ? parseFloat(menu.price).toFixed(2) + " €" : "Prix non défini";

            // Nettoyage de la description pour l'aperçu
            let descCourte = menu.description || 'Découvrez notre menu de saison.';
            if(descCourte.includes('[Ingrédients]')) {
                descCourte = descCourte.split('[Ingrédients]')[0]; 
            }

            card.innerHTML = `
                <!-- Image & Tag Thème -->
                <div class="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img src="${imgPath}" alt="${affichageTitre}" class="w-full h-full object-cover" style="${isEpuise ? 'filter: grayscale(1);' : ''}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1495195134817-a1a18bc0c411?auto=format&fit=crop&w=500&q=80';">
                    <span class="absolute top-3 left-3 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                        ${menu.theme || 'Classique'}
                    </span>
                </div>

                <!-- Contenu de la carte -->
                <div class="p-5 flex flex-col flex-grow justify-between gap-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2 logo-font">${affichageTitre}</h3>
                        <p class="text-sm text-gray-600 line-clamp-3">${descCourte}</p>
                    </div>

                    <div>
                        <!-- Prix et Stock -->
                        <div class="flex items-center justify-between mb-3 pt-2 border-t border-gray-100">
                            <span class="text-2xl font-bold text-[#9eb2a0]">${affichagePrix}</span>
                            <span class="text-xs font-bold ${isEpuise ? 'text-red-500' : 'text-emerald-600'}">
                                ${isEpuise ? '❌ Épuisé' : `📦 ${stockActuel} disponible(s)`}
                            </span>
                        </div>
                        
                        <!-- Boutons d'action -->
                        <div class="flex gap-2">
                            <button onclick="voirDetail(${menu.id})" 
                                    class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors">
                                Détails
                            </button>

                            <button onclick='choisirMenu(${JSON.stringify(menu).replace(/'/g, "&apos;")})'
                                    class="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors text-white ${isEpuise ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#9eb2a0] hover:bg-[#8da390]'}"
                                    ${isEpuise ? 'disabled' : ''}>
                                ${isEpuise ? 'Indisponible' : '🛒 Panier'}
                            </button>
                        </div>
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