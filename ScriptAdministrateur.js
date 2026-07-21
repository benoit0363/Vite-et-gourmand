
// ========================================================
let toutesLesCommandes = [];

// ========================================================
// 2. INITIALISATION AU CHARGEMENT DE LA PAGE
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    // On lance toutes les fonctions de chargement
    chargerMenusAdmin();
    chargerHorairesAdmin(); 
    chargerStatsDashboard();
    chargerCommandesAdmin();
    genererGraphiqueCA();
    chargerPerformanceMenus();
    chargerMessages();
    // (Optionnel) Rafraîchir ces stats toutes les 60 secondes
    setInterval(chargerStatsDashboard, 60000);

    // Écouteur pour le formulaire d'ajout
    const addMenuForm = document.getElementById('add-menu-form');
    if (addMenuForm) {
        addMenuForm.addEventListener('submit', executerAjoutMenu);
    }
});

// ========================================================
// 3. GESTION DE L'INTERFACE (Formulaire & Image)
// ========================================================
function toggleForm() {
    const zone = document.getElementById('zone-formulaire-admin');
    if (zone) {
        zone.style.display = (zone.style.display === 'none' || zone.style.display === '') ? 'block' : 'none';
    }
}

function previewImage() {
    const fileInput = document.getElementById('admin-file');
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

// ========================================================
// 4. GESTION DES MENUS (Chargement, Ajout, Suppression)
// ========================================================
async function chargerMenusAdmin() {
    const tbody = document.getElementById('admin-menus-list');
    if (!tbody) return;

    try {
        const response = await fetch('api/index.php?action=get_menus'); 
        const database = await response.json();
        tbody.innerHTML = '';

        if (!Array.isArray(database)) {
            console.error("L'API n'a pas renvoyé un tableau :", database);
            return;
        }

        database.forEach((menu) => {
            const row = document.createElement('tr');
            
            const nomMenu   = menu.title || "Sans titre";
            const themeMenu = menu.theme || "Classique";
            const prixMenu  = menu.price !== undefined && menu.price !== null ? parseFloat(menu.price).toFixed(2) + " €" : "0.00 €";
            const stockMenu = menu.remaining_quantity !== undefined && menu.remaining_quantity !== null ? menu.remaining_quantity + " dispo(s)" : "Illimité";

            row.innerHTML = `
                <td><strong>${nomMenu}</strong></td>
                <td>${themeMenu}</td>
                <td>${prixMenu}</td>
                <td>${stockMenu}</td>
                <td>
                    <button onclick="supprimerMenu(${menu.id})" class="btn-secondary" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        🗑️ Supprimer
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des menus :", error);
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
                chargerMenusAdmin();
                chargerStatsDashboard(); 
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

// ========================================================
// 5. GESTION DES COMMANDES
// ========================================================
async function chargerCommandesAdmin() {
    const tbody = document.getElementById('admin-commandes-list');
    if (!tbody) return;

    try {
        const response = await fetch('api/index.php?action=get_commandes');
        const result = await response.json();
        
        toutesLesCommandes = result.data ? result.data : result; 
        if (!Array.isArray(toutesLesCommandes)) toutesLesCommandes = [];
        
        afficherCommandesTableau(toutesLesCommandes);
    } catch (e) {
        console.log("Erreur chargement commandes :", e);
        tbody.innerHTML = '<tr><td colspan="6">Erreur de chargement des commandes.</td></tr>';
    }
}

function afficherCommandesTableau(commandes) {
    const tbody = document.getElementById('admin-commandes-list');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (commandes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Aucune commande ne correspond à vos critères.</td></tr>';
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
                await chargerCommandesAdmin();
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

// ========================================================
// 6. STATISTIQUES ET DASHBOARD
// ========================================================
async function genererGraphiqueCA() {
    try {
        const response = await fetch('api/index.php?action=get_stats_ca');
        const stats = await response.json();
        
        if (!Array.isArray(stats)) return;

        const canvas = document.getElementById('chartCA2');
        if (!canvas) return; 

        const ctx = canvas.getContext('2d');
        const labelsMois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
        const labels = stats.map(item => labelsMois[parseInt(item.mois) - 1]);
        const dataValues = stats.map(item => parseFloat(item.ca));

        if (window.monGraphiqueCA) {
            window.monGraphiqueCA.destroy();
        }

        window.monGraphiqueCA = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "Chiffre d'affaires (€)",
                    data: dataValues,
                    borderColor: '#00a86b',
                    backgroundColor: 'rgba(0, 168, 107, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch (e) { 
        console.log("Module graphique non prêt", e); 
    }
}

async function chargerStatsDashboard() {
    try {
        const response = await fetch('api/index.php?action=get_dashboard_stats');
        const stats = await response.json();

        if (stats.status === "error") {
            console.error("Erreur API Stats:", stats.message);
            return;
        }

        const statNums = document.querySelectorAll('.stat-info-num');
        const statTrends = document.querySelectorAll('.stat-trend');

        if (statNums.length >= 4) {
            statNums[0].innerText = parseFloat(stats.ca_mois).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
            statNums[1].innerText = stats.nb_commandes;
            statNums[2].innerText = stats.nb_clients;
            statNums[3].innerText = stats.note_moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 1 }) + ' / 5';
        }

        if (statTrends.length >= 4) {
            statTrends[3].innerText = `Sur ${stats.nb_avis} avis vérifiés`;
        }
    } catch (error) {
        console.error("Impossible de charger les statistiques globales :", error);
    }
}
async function chargerPerformanceMenus() {
    const container = document.getElementById('performance-menus-list');
    if (!container) return;

    try {
        const response = await fetch('api/mongodb/stats-menus.php');
        const result = await response.json();

        if (result.status !== 'success') {
            container.innerHTML = `<p class="text-sm text-red-500">${result.message}</p>`;
            return;
        }

        const menus = result.data || [];

        if (menus.length === 0) {
            container.innerHTML = `<p class="text-sm text-slate-400">Aucune vente enregistrée.</p>`;
            return;
        }

        const maxVente = Math.max(...menus.map(menu => parseInt(menu.total_parts_vendues)));

        container.innerHTML = '';

        menus.forEach(menu => {
            const totalParts = parseInt(menu.total_parts_vendues);
            const ca = parseFloat(menu.chiffre_affaires);
            const pourcentage = maxVente > 0 ? Math.round((totalParts / maxVente) * 100) : 0;

            container.innerHTML += `
                <div>
                    <div class="flex justify-between text-sm mb-1">
                        <span class="font-semibold">🍽️ ${menu.nom_menu}</span>
                        <span class="text-slate-500">${totalParts} part(s)</span>
                    </div>

                    <div class="w-full bg-slate-100 rounded-full h-2">
                        <div class="bg-emerald-600 h-2 rounded-full" style="width: ${pourcentage}%"></div>
                    </div>

                    <div class="text-xs text-slate-400 mt-1">
                        CA généré : ${ca.toFixed(2)} €
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Erreur performances menus :", error);
        container.innerHTML = `<p class="text-sm text-red-500">Erreur de chargement.</p>`;
    }
}


// ========================================================
// 7. GESTION DES HORAIRES
// ========================================================
async function chargerHorairesAdmin() {
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
// GESTION DES COMPTES EMPLOYÉS
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
    chargerEmployesAdmin();

    const formEmploye = document.getElementById('add-employe-form');

    if (formEmploye) {
        formEmploye.addEventListener('submit', creerEmploye);
    }
});

function toggleForm(id) {
    const zone = document.getElementById(id);

    if (zone) {
        zone.classList.toggle('hidden');
    }
}
async function chargerEmployesAdmin() {
    const tbody = document.getElementById('admin-employes-list');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="px-6 py-6 text-center text-slate-400">
                Chargement...
            </td>
        </tr>
    `;

    try {
        const response = await fetch('api/index.php?action=get_employes');
        const result = await response.json();

        tbody.innerHTML = '';

        if (result.status !== 'success') {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-6 text-center text-red-500">
                        ${result.message || "Erreur lors du chargement des employés."}
                    </td>
                </tr>
            `;
            return;
        }

        const employes = result.data || [];

        if (employes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-6 text-center text-slate-400">
                        Aucun employé enregistré.
                    </td>
                </tr>
            `;
            return;
        }

        employes.forEach(emp => {
            const dateCreation = emp.date_creation
                ? new Date(emp.date_creation).toLocaleDateString('fr-FR')
                : 'Inconnue';

            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50 transition-colors';

            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="font-semibold text-slate-800">
                        ${emp.nom} ${emp.prenom}
                    </div>
                    <span class="inline-block mt-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                        Rôle : Employé
                    </span>
                </td>

                <td class="px-6 py-4">
                    <div class="text-slate-700">
                        ${emp.email}
                    </div>
                    <div class="text-xs text-slate-400">
                        ${emp.telephone || 'Non renseigné'}
                    </div>
                </td>

                <td class="px-6 py-4 text-slate-600">
                    ${dateCreation}
                </td>

                <td class="px-6 py-4 text-right">
                    <button 
                        onclick="supprimerEmploye(${emp.id})"
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm">
                        <i class="fa-solid fa-trash-can mr-1"></i>
                        Supprimer
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error(error);

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-6 text-center text-red-500">
                    Erreur de communication avec le serveur.
                </td>
            </tr>
        `;
    }
}

/**
 * Crée un nouvel employé
 */
async function creerEmploye(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
        const response = await fetch('api/index.php?action=create_employe', {
            method: 'POST',
            body: formData
        });

        const texte = await response.text();
        console.log("Réponse brute PHP :", texte);

        let result;

        try {
            result = JSON.parse(texte);
        } catch (jsonError) {
            console.error("Réponse PHP invalide :", texte);
            alert("Erreur serveur : le PHP ne renvoie pas du JSON valide. Regarde la console F12.");
            return;
        }

        if (result.status === 'success') {
            alert("✅ " + result.message);
            e.target.reset();
            toggleFormEmploye();
            chargerEmployesAdmin();
        } else {
            alert("❌ Erreur : " + result.message);
        }

    } catch (err) {
        console.error("Erreur fetch :", err);
        alert("Erreur de communication avec le serveur.");
    }
}

async function supprimerEmploye(id) {
    if (!confirm("Voulez-vous vraiment supprimer cet employé ?")) {
        return;
    }

    const formData = new FormData();
    formData.append('id', id);

    try {
        const response = await fetch('api/index.php?action=delete_employe', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert("✅ " + result.message);
            chargerEmployesAdmin();
        } else {
            alert("❌ Erreur : " + result.message);
        }

    } catch (error) {
        console.error(error);
        alert("Erreur de communication avec le serveur.");
    }
}
async function chargerMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return; 

    container.innerHTML = '<p class="text-slate-500">Chargement des messages...</p>';

    try {
        const response = await fetch('api/index.php?action=get_messages');
        const result = await response.json();

        if (result.status !== 'success') {
            container.innerHTML = `<p class="text-red-500">Erreur : ${result.message}</p>`;
            return;
        }

        const messages = result.data || [];

        if (messages.length === 0) {
            container.innerHTML = '<p class="text-slate-400 italic">Aucun message pour le moment.</p>';
            return;
        }

        let html = '';
        messages.forEach(msg => {
            const estLu = msg.lu == 1; 
            const bgClass = estLu ? 'bg-slate-50 opacity-75' : 'bg-white border-l-4 border-blue-500 shadow-sm';
            const badgeLu = estLu ? '<span class="text-xs text-slate-400 ml-2">✔ Déjà lu</span>' : '<span class="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded ml-2">Nouveau</span>';
            const boutonLu = estLu ? '' : `<button onclick="marquerMessageLu(${msg.id})" class="mt-3 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition">Marquer comme lu</button>`;

            const dateCreation = new Date(msg.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'
            });

            html += `
                <div class="p-4 rounded-lg border border-slate-200 ${bgClass} mb-4">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-bold text-lg text-slate-800">${msg.sujet} ${badgeLu}</h4>
                            <p class="text-sm text-slate-600 font-medium">De : ${msg.nom} (${msg.email})</p>
                            <p class="text-xs text-slate-400">Tél : ${msg.tel || 'Non renseigné'}</p>
                        </div>
                        <span class="text-xs text-slate-400 whitespace-nowrap">${dateCreation}</span>
                    </div>
                    <p class="text-slate-700 mt-3 whitespace-pre-wrap">${msg.message}</p>
                    ${boutonLu}
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error("Erreur lors du chargement des messages :", error);
        container.innerHTML = '<p class="text-red-500">Impossible de communiquer avec le serveur.</p>';
    }
}

// 🚀 TRÈS IMPORTANT : Lance la fonction au chargement
document.addEventListener('DOMContentLoaded', () => {
    chargerMessages();
});

async function marquerMessageLu(idMessage) {
    try {
        const response = await fetch(`api/index.php?action=mark_message_read&id=${idMessage}`);
        const result = await response.json();

        if (result.status === 'success') {
            chargerMessages();
        } else {
            alert("Erreur : " + result.message);
        }
    } catch (error) {
        console.error("Erreur de mise à jour :", error);
        alert("Erreur de communication avec le serveur.");
    }
}

function deconnecterAdministrateur() {
    
    fetch('API/index.php?action=logout') 
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                
                window.location.href = 'index.html'; 
            }
        })
        .catch(error => console.error('Erreur lors de la déconnexion:', error));
}