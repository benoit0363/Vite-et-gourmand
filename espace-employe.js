

const API_URL = 'api/index.php';
let localCommandes = []; 
let confirmCallback = null; // Mémoire tampon pour la modale de confirmation

document.addEventListener('DOMContentLoaded', () => {
    initEspaceEmploye();
    setupCancelForm();
    setupHoraireForm();
});
const addMenuForm = document.getElementById('add-menu-form');
    if (addMenuForm) {
        addMenuForm.addEventListener('submit', executerAjoutMenu);
    }

function initEspaceEmploye() {
    chargerCommandes();
    chargerAvis();
    chargerHoraires();
    chargerMenus();
}

// ==========================================
// SYSTÈME DE NAVIGATION ENTRE LES ONGLETS
// ==========================================
function switchTab(tabName) {
    // 1. Masquer tous les contenus
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    
    // 2. Désactiver le style de tous les onglets
    document.querySelectorAll('[id^="tab-"]').forEach(el => {
        el.classList.remove('border-[#9eb2a0]', 'text-[#9eb2a0]');
        el.classList.add('border-transparent', 'text-gray-500');
    });

    // 3. Afficher le contenu actif et activer l'onglet correspondant
    const activeContent = document.getElementById(`content-${tabName}`);
    const activeTab = document.getElementById(`tab-${tabName}`);
    
    if (activeContent && activeTab) {
        activeContent.classList.remove('hidden');
        activeTab.classList.remove('border-transparent', 'text-gray-500');
        activeTab.classList.add('border-[#9eb2a0]', 'text-[#9eb2a0]');
    }
}

// ==========================================
// ALERTE ET CONFIRMATION PERSONNALISÉES
// ==========================================
function showCustomAlert(message) {
    const modal = document.getElementById('custom-alert-modal');
    const text = document.getElementById('custom-alert-text');
    if (!modal || !text) return;
    
    text.innerText = message;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 50);
}

function closeCustomAlert() {
    const modal = document.getElementById('custom-alert-modal');
    if (!modal) return;
    
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function showCustomConfirm(message, onConfirm) {
    const modal = document.getElementById('custom-confirm-modal');
    const text = document.getElementById('custom-confirm-text');
    if (!modal || !text) return;
    
    text.innerText = message;
    confirmCallback = onConfirm;
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 50);
}

function handleCustomConfirm(agree) {
    closeCustomConfirm();
    if (agree && confirmCallback) {
        confirmCallback();
    }
    confirmCallback = null;
}

function closeCustomConfirm() {
    const modal = document.getElementById('custom-confirm-modal');
    if (!modal) return;
    
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}
function toggleForm() {
    const zone = document.getElementById('zone-formulaire-employe');
    if (zone) {
        zone.style.display = (zone.style.display === 'none' || zone.style.display === '') ? 'block' : 'none';
    }
}
function previewImage() {
    const fileInput = document.getElementById('employe-file');
    const preview = document.getElementById('image-preview');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

// ==========================================
// 1. GESTION DES COMMANDES
// ==========================================
async function chargerCommandes() {
    try {
        const response = await fetch(`api/index.php?action=get_commandes`);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
            localCommandes = result.data;
            renderCommandes(localCommandes);
        } else {
            afficherErreurTableau('employe-commandes-list', "Erreur lors de la récupération.");
        }
    } catch (error) {
        console.error(error);
        afficherErreurTableau('employe-commandes-list', "Connexion au serveur impossible.");
    }
}
async function executerAjoutMenu(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const response = await fetch('api/index.php?action=add_menu', {
            method: 'POST',
            body: formData
        });
        
        const textResult = await response.text(); 
        
        try {
            const result = JSON.parse(textResult); 
            if (result.status === "success") {
                alert("🎉 " + result.message);
                e.target.reset();
                
                const preview = document.getElementById('image-preview');
                if (preview) preview.style.display = 'none';

                toggleForm();
                chargerMenus();
            } else {
                alert("❌ Erreur de l'API : " + result.message);
            }
        } catch (jsonError) {
            console.error("Le PHP n'a pas renvoyé du JSON valide :", textResult);
            alert("Erreur serveur : Regardez la console (F12) pour plus de détails.");
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Impossible de joindre le serveur PHP.");
    }
}
async function supprimerMenu(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce menu ?")) return;

    try {
        const formData = new FormData();
        formData.append('id', id);

        const response = await fetch('api/index.php?action=delete_menu', { 
            method: 'POST', 
            body: formData 
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            chargerMenusAdmin();
        } else {
            alert("❌ Erreur lors de la suppression : " + result.message);
        }
    } catch (error) {
        console.error("Erreur réseau lors de la suppression :", error);
    }
}

function renderCommandes(commandes) {
    const tbody = document.getElementById('employe-commandes-list');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (commandes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-gray-500 italic">Aucune commande.</td></tr>`;
        return;
    }

    commandes.forEach((cmd) => {
        const row = document.createElement('tr');
        
        const dateCmd = new Date(cmd.date_commande || cmd.created_at).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        
        // --- 1. GESTION DES MENUS ---
        let recapDetails = "Détails non lisibles";
        try {
            // On utilise la bonne colonne (details_panier), avec panier en secours
            const donneesPanier = JSON.parse(cmd.details_panier || cmd.panier || '{}');
            
            // Si on a le format avec 'articles'
            if (donneesPanier.articles && Array.isArray(donneesPanier.articles)) {
                recapDetails = donneesPanier.articles.map(item => {
                    const nomPlat = item.titre || item.title || item.name || "Menu";
                    const quantite = item.quantite || item.qte || 1;
                    return `• <strong>${nomPlat}</strong> (x${quantite})`;
                }).join('<br>');
            } 
            // Si c'est un tableau direct
            else if (Array.isArray(donneesPanier)) {
                recapDetails = donneesPanier.map(item => {
                    const nomPlat = item.titre || item.title || item.name || "Menu";
                    const quantite = item.quantite || item.qte || 1;
                    return `• <strong>${nomPlat}</strong> (x${quantite})`;
                }).join('<br>');
            }
            // Sécurité si le panier est vide
            if (!recapDetails || recapDetails.trim() === "") recapDetails = "Panier vide";

        } catch(e) {
            recapDetails = cmd.details_panier || cmd.panier ? (cmd.details_panier || cmd.panier).replace(/\n/g, '<br>') : "Vide";
        }

        // --- 2. GESTION DE L'ADRESSE ET DE LA VILLE ---
        let adresseAffichee = cmd.adresse;
        let villeAffichee = cmd.ville;

        // Récupération de secours dans le JSON pour les anciennes commandes
        try {
            const donneesPanier = JSON.parse(cmd.details_panier || cmd.panier || '{}');
            if (!adresseAffichee && donneesPanier.livraison) adresseAffichee = donneesPanier.livraison;
            if (!villeAffichee && donneesPanier.ville) villeAffichee = donneesPanier.ville;
        } catch(e) {}

        // Mise en forme si c'est vide
        if (!adresseAffichee || adresseAffichee.trim() === '') {
            adresseAffichee = '<span style="color:#94a3b8; font-style:italic;">Non renseignée</span>';
        }
        if (!villeAffichee || villeAffichee.trim() === '') {
            villeAffichee = '<span style="color:#94a3b8; font-style:italic;">Non renseignée</span>';
        }

        // --- 3. COULEURS DES BADGES ---
        let badgeCouleur = "#7f8c8d";
        if (cmd.statut === 'En attente') badgeCouleur = "#e67e22";
        if (cmd.statut === 'En préparation') badgeCouleur = "#3498db";
        if (cmd.statut === 'Prêt' || cmd.statut === 'Livré') badgeCouleur = "#27ae60";
        if (cmd.statut === 'Annulée') badgeCouleur = "#c0392b";

        // --- 4. AFFICHAGE HTML ---
        row.innerHTML = `
            <td><strong>#${cmd.id}</strong><br><small>${dateCmd}</small></td>
            <td>${cmd.nom || cmd.nom_client || ''}<br><small>${cmd.email || ''}</small><br><small>${cmd.telephone || ''}</small></td>
            <td style="white-space: normal; min-width: 150px; font-size: 0.9em;">
                ${adresseAffichee}
            </td>
            <td style="white-space: normal; min-width: 150px; font-size: 0.9em;">
                ${villeAffichee}
            </td>
            <td><div style="max-height:100px; overflow-y:auto; font-size:0.9em; padding-right:5px;">${recapDetails}</div></td>
            <td><strong>${parseFloat(cmd.prix_total || cmd.total).toFixed(2)} €</strong></td>
            <td><span style="background:${badgeCouleur}; color:white; padding:4px 8px; border-radius:4px; font-size:0.85em; font-weight:500;">${cmd.statut || 'En attente'}</span></td>
            <td>
                <button onclick="changerStatutCmd(${cmd.id}, 'En préparation')" class="btn-submit" style="padding:4px 8px; font-size:0.8em; margin-bottom:4px; background:#3498db; border:none; border-radius:4px; color:white; cursor:pointer;">En prépa.</button>
                <button onclick="changerStatutCmd(${cmd.id}, 'Livré')" class="btn-add" style="padding:4px 8px; font-size:0.8em; background:#27ae60; border:none; border-radius:4px; color:white; cursor:pointer;">Livré</button>
                <button onclick="changerStatutCmd(${cmd.id}, 'Annulée')" class="btn-danger" style="padding:4px 8px; font-size:0.8em; background:#c0392b; border:none; border-radius:4px; color:white; cursor:pointer;">Annuler</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function changerStatutCmd(id, nouveauStatut) {
    if (confirm(`Changer le statut de la commande #${id} à "${nouveauStatut}" ?`)) {
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('statut', nouveauStatut);

            const response = await fetch('api/index.php?action=update_statut_commande', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                await chargerCommandes();
                alert(`✅ ${result.message}`);
            } else {
                alert(`❌ Erreur : ${result.message}`);
            }
        } catch (error) {
            console.error("Erreur réseau ou technique :", error);
            alert("Impossible de contacter le serveur pour mettre à jour le statut.");
        }
    }
}

function filtrerCommandes() {
    const recherche = document.getElementById('admin-search-cmd').value.toLowerCase();
    const filtreStatut = document.getElementById('admin-filter-status').value;

    const commandesFiltrees = toutesLesCommandes.filter(cmd => {
        const nomClient = cmd.nom || cmd.nom_client || '';
        const matchRecherche = nomClient.toLowerCase().includes(recherche) || 
                               (cmd.telephone && cmd.telephone.includes(recherche)) ||
                               `#${cmd.id}`.includes(recherche);
        const matchStatut = (filtreStatut === 'All' || cmd.statut === filtreStatut);

        return matchRecherche && matchStatut;
    });

    afficherCommandesTableau(commandesFiltrees);
}

// ==========================================
// 2. MODÉRATION DES AVIS
// ==========================================
async function chargerAvis() {
    try {
        const response = await fetch(`api/index.php?action=get_employe_avis`);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
            renderAvis(result.data);
        } else {
            afficherErreurTableau('employe-avis-list', "Erreur de récupération des avis.");
        }
    } catch (error) {
        console.error(error);
        afficherErreurTableau('employe-avis-list', "Serveur avis inaccessible.");
    }
}

function renderAvis(avis) {
    const tbody = document.getElementById('employe-avis-list');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (avis.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500 italic">Aucun avis soumis.</td></tr>`;
        return;
    }

    avis.forEach(item => {
        let statutBadge = "bg-amber-50 text-amber-600 border-amber-200";
        if (item.statut === 'valide') statutBadge = "bg-emerald-50 text-emerald-600 border-emerald-200";
        if (item.statut === 'refuse') statutBadge = "bg-red-50 text-red-600 border-red-200";

        const dateAvis = item.date_avis ? formatDateFR(item.date_avis) : 'Récemment';
        const isModere = (item.statut === 'valide' || item.statut === 'refuse');

        const row = `
            <tr class="hover:bg-slate-50/50 transition-colors ${isModere ? 'opacity-60' : ''}">
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-900">${item.nom_client || 'Client anonyme'}</div>
                </td>
                <td class="px-6 py-4 text-amber-500 font-bold">${'★'.repeat(item.note)}${'☆'.repeat(5 - item.note)}</td>
                <td class="px-6 py-4 text-sm text-gray-600 italic">"${item.commentaire}"</td>
                <td class="px-6 py-4 text-xs text-gray-500">${dateAvis}</td>
                <td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statutBadge}">${item.statut}</span></td>
                <td class="px-6 py-4 flex gap-2">
                    <!-- Bouton Valider -->
                    <button onclick="modererAvisAPI(${item.id}, 'valide')" ${isModere ? 'disabled' : ''} class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-1.5 rounded-lg text-xs disabled:opacity-50" title="Valider">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <!-- Bouton Refuser -->
                    <button onclick="modererAvisAPI(${item.id}, 'refuse')" ${isModere ? 'disabled' : ''} class="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 p-1.5 rounded-lg text-xs disabled:opacity-50" title="Refuser">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <!-- NOUVEAU : Bouton Supprimer -->
                    <button onclick="supprimerAvisAPI(${item.id})" class="bg-gray-50 hover:bg-gray-200 text-gray-700 border border-gray-300 p-1.5 rounded-lg text-xs" title="Supprimer définitivement">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function supprimerAvisAPI(id_avis) {
    // On demande confirmation avant de supprimer définitivement
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis définitivement ? Cette action est irréversible.")) {
        return; 
    }

    try {
        const response = await fetch(`api/index.php?action=delete_avis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_avis })
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast("Avis supprimé avec succès.");
            chargerAvis(); // On rafraîchit le tableau
        } else {
            showCustomAlert("Erreur : " + result.message);
        }
    } catch (e) {
        console.error(e);
        showToast("Erreur lors de la suppression.", "error");
    }
}

// ==========================================
// 3. GESTION DES HORAIRES
// ==========================================
async function chargerHoraires() {
    try {
        const response = await fetch('api/horaires.php?action=get_horaires');
        const result = await response.json();

        if (Array.isArray(result)) {
            result.forEach(jour => {
                const openEl = document.getElementById(`open-${jour.jour_id}`);
                if(openEl) {
                    openEl.checked = (jour.ouvert == 1);
                    document.getElementById(`md-${jour.jour_id}`).value = jour.midi_debut;
                    document.getElementById(`mf-${jour.jour_id}`).value = jour.midi_fin;
                    document.getElementById(`sd-${jour.jour_id}`).value = jour.soir_debut;
                    document.getElementById(`sf-${jour.jour_id}`).value = jour.soir_fin;
                }
            });
        } else if (result.status === 'error') {
            console.error("Erreur serveur :", result.message);
        }
    } catch (e) {
        console.error("Erreur lors du chargement des horaires :", e);
    }
}

async function sauvegarderHoraire(id) {
    try {
        const data = new FormData();
        data.append('jour_id', id);
        data.append('ouvert', document.getElementById(`open-${id}`).checked ? 1 : 0);
        data.append('midi_debut', document.getElementById(`md-${id}`).value);
        data.append('midi_fin', document.getElementById(`mf-${id}`).value);
        data.append('soir_debut', document.getElementById(`sd-${id}`).value);
        data.append('soir_fin', document.getElementById(`sf-${id}`).value);

        const res = await fetch('api/horaires.php?action=update_horaire', {
            method: 'POST',
            body: data
        });

        const result = await res.json();
        
        if(result.status === 'success') {
            alert('✅ Horaires mis à jour !');
        } else {
            alert('⚠️ Erreur du serveur : ' + result.message);
        }
    } catch (e) {
        console.error("❌ Erreur bloquante :", e);
        alert("Une erreur technique s'est produite. Regarde la console (F12).");
    }
}

// ==========================================
// 4. GESTION DES MENUS & CATALOGUE
// ==========================================
async function chargerMenus() {
    const list = document.getElementById('employe-menus-list');
    try {
        const response = await fetch(`${API_URL}?action=get_menus`);
        const result = await response.json();
        const database = Array.isArray(result) ? result : (result.data || result);

        list.innerHTML = '';
        if (!database || database.length === 0) {
            list.innerHTML = `<p class="text-center text-gray-500 italic col-span-full">Aucun menu disponible.</p>`;
            return;
        }

        database.forEach(menu => {
            let imageSource = 'uploads/default.jpg';
            const imageFile = menu.image || menu.image_url;
            if (imageFile && imageFile !== 'default.jpg') {
                imageSource = imageFile.startsWith('http') ? imageFile : `uploads/${imageFile}`;
            }

            const menuId = menu.id_menu || menu.id;

            const card = `
                <div class="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <img src="${imageSource}" alt="${menu.titre || menu.title}" class="w-full h-44 object-cover" onerror="this.src='uploads/default.jpg'">
                    <div class="p-4 flex-grow flex flex-col justify-between">
                        <div>
                            <span class="bg-gray-100 text-gray-600 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">${menu.theme || 'Classique'}</span>
                            <h3 class="text-lg font-bold text-gray-900 mt-2">${menu.titre || menu.title || 'Menu sans nom'}</h3>
                            <p class="text-xs text-gray-500 mt-1 line-clamp-2">${menu.description || 'Découvrez notre menu.'}</p>
                        </div>
                        <div class="flex justify-between items-center mt-4 pt-3 border-t">
                            <span class="font-bold text-slate-800">${parseFloat(menu.prix || menu.price || 0).toFixed(2)} €</span>
                            <button onclick="supprimerMenu(${menuId})" class="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all">
                                <i class="fa-solid fa-trash-can"></i> Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            `;
            list.insertAdjacentHTML('beforeend', card);
        });
    } catch (err) {
        console.error(err);
        list.innerHTML = `<p class="text-center text-red-500 font-semibold col-span-full">Erreur lors de la récupération du catalogue.</p>`;
    }
}

        

// ==========================================
// OUTILS ET UTILITAIRES COMMUNS
// ==========================================
function ouvrirModaleAnnulation(id) {
    document.getElementById('cancel-order-id').value = id;
    const modal = document.getElementById('cancel-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 50);
}

function closeCancelModal() {
    const modal = document.getElementById('cancel-modal');
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('cancel-form').reset();
    }, 300);
}

function setupCancelForm() {
    const form = document.getElementById('cancel-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('cancel-order-id').value;
        const mode_contact = document.getElementById('cancel-contact').value;
        const motif = document.getElementById('cancel-reason').value.trim();

        try {
            const response = await fetch(`${API_URL}?action=cancel_commande_employe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, mode_contact, motif })
            });
            const result = await response.json();

            if (result.status === 'success') {
                showToast(result.message);
                closeCancelModal();
                chargerCommandes();
            } else {
                showCustomAlert("Erreur d'annulation : " + result.message);
            }
        } catch (err) {
            console.error(err);
            showToast("Erreur serveur.", "error");
        }
    });
}

function analyserPanier(details) {
    try {
        if (!details) return "Aucun article.";
        const parsed = JSON.parse(details);
        if (parsed && parsed.articles) {
            return parsed.articles.map(a => `${a.quantite}x ${a.title || a.titre || 'Menu'}`).join(', ');
        }
        return "Détails non lisibles.";
    } catch (e) {
        return details;
    }
}

function formatDateFR(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const icon = toast.querySelector('i');
    if (type === 'error') {
        toast.classList.replace('bg-emerald-600', 'bg-red-600');
        icon.className = 'fa-solid fa-triangle-exclamation text-lg';
    } else {
        toast.classList.replace('bg-red-600', 'bg-emerald-600');
        icon.className = 'fa-solid fa-circle-check text-lg';
    }

    document.getElementById('toast-message').innerText = message;
    toast.style.transform = 'translateX(0)';

    setTimeout(() => {
        toast.style.transform = 'translateX(150%)';
    }, 3000);
}

function afficherErreurTableau(tbodyId, message) {
    const tbody = document.getElementById(tbodyId);
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-red-500 font-semibold"><i class="fa-solid fa-triangle-exclamation"></i> ${message}</td></tr>`;
    }
}

function deconnecterEmploye() {
    fetch(`${API_URL}?action=logout`)
    .then(() => {
        window.location.href = 'index.html';
    });
}