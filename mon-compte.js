/**
 * mon-compte.js
 * Gestion dynamique de l'espace client "Mon Compte"
 */

const API_BASE_URL = 'api/index.php'; 
let globalOrders = [];

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupStars();
    setupForms();
});

async function initDashboard() {
    updateApiStatus('checking', 'Connexion au serveur...');

    try {
        // On récupère les deux réponses de l'API
        const userRes = await fetch(`${API_BASE_URL}?action=get_current_user`).catch(() => null);
        const ordersRes = await fetch(`${API_BASE_URL}?action=get_commandes_client`).catch(() => null);

        // On convertit en JSON
        const userData = userRes ? await userRes.json() : null;
        const ordersData = ordersRes ? await ordersRes.json() : null;

        // 🛠️ DÉBOGAGE : Affiche les réponses exactes dans la console (F12)
        console.log("🔎 Réponse de get_current_user :", userData);
        console.log("🔎 Réponse de get_commandes_client :", ordersData);

        // 1. Remplissage des informations de profil
        if (userData && userData.logged_in) {
            populateUser(userData);
            updateApiStatus('success', 'Connecté au serveur');
        } else {
            updateApiStatus('warning', 'Mode démonstration (Session non trouvée)');
        }

        // 2. Remplissage de l'historique des commandes
        if (ordersData && ordersData.status === 'success' && ordersData.data) {
            globalOrders = ordersData.data;
            renderOrderHistory(globalOrders);
        } else {
            renderOrderHistory([]);
        }

    } catch (error) {
        console.error("Erreur générale :", error);
        renderOrderHistory([]);
        updateApiStatus('warning', 'Mode Hors-ligne');
    }
}

// LA VRAIE FONCTION qui remplit les champs HTML
function populateUser(data) {
    const nomInput = document.getElementById('user-nom');
    const emailInput = document.getElementById('user-email');
    const telInput = document.getElementById('user-tel');
    const adresseInput = document.getElementById('user-adresse');

    if (nomInput) {
        const nom = data.nom || "";
        const prenom = data.prenom || "";
        nomInput.value = (nom + " " + prenom).trim();
    }
    if (emailInput) emailInput.value = data.email || "";
    if (telInput) telInput.value = data.telephone || "";
    if (adresseInput) adresseInput.value = data.adresse || "";
}

function renderOrderHistory(orders) {
    const listContainer = document.getElementById('order-history-list');
    const reviewSelect = document.getElementById('review-order-id');
    
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    if (reviewSelect) {
        reviewSelect.innerHTML = '<option value="">-- Sélectionnez une commande --</option>';
    }

    if (!orders || orders.length === 0) {
        listContainer.innerHTML = `<p class="text-sm text-gray-500 italic text-center py-4">Aucune commande trouvée ou session expirée.</p>`;
        return;
    }

    orders.forEach(order => {
        const isAnnulee = order.statut && (order.statut.toLowerCase() === 'annulée' || order.statut.toLowerCase() === 'annulé');
        const badgeClass = isAnnulee 
            ? 'bg-red-50 text-red-600 border border-red-200' 
            : 'bg-emerald-50 text-emerald-600 border border-emerald-200';

        const price = order.prix_total ? parseFloat(order.prix_total).toFixed(2) : "0.00";
        const orderDate = order.date_commande ? new Date(order.date_commande).toLocaleDateString('fr-FR') : 'Date inconnue';

        const cardHtml = `
            <div class="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-all bg-white group">
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-3">
                        <span class="font-bold text-gray-900">Commande #${order.id}</span>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${badgeClass}">
                            ${order.statut || 'En attente'}
                        </span>
                    </div>
                    <div class="text-sm text-gray-500 flex items-center gap-4">
                        <span><i class="fa-regular fa-calendar mr-1"></i> ${orderDate}</span>
                        <span class="font-semibold text-gray-700">${price}€</span>
                    </div>
                </div>
                <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <button onclick="viewOrderDetails('${order.id}')" class="text-slate-400 hover:text-[#9eb2a0] p-2 transition-colors" title="Détails">
                        <i class="fa-solid fa-eye text-lg"></i>
                    </button>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', cardHtml);

        if (!isAnnulee && reviewSelect) {
            reviewSelect.insertAdjacentHTML('beforeend', `<option value="${order.id}">Commande #${order.id} (${orderDate})</option>`);
        }
    });
}

function viewOrderDetails(orderId) {
    const order = globalOrders.find(o => String(o.id) === String(orderId));
    const content = document.getElementById('modal-content');
    
    if (order && content) {
        let itemsListHtml = "";
        
        try {
            const details = typeof order.details_panier === 'string' 
                ? JSON.parse(order.details_panier) 
                : order.details_panier;
                
            if (details && details.articles && Array.isArray(details.articles)) {
                itemsListHtml = details.articles.map(item => `
                    <li class="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                        <span class="flex items-center gap-2">
                            <i class="fa-solid fa-check text-emerald-500 text-sm"></i> ${item.nom || item.title || 'Article'}
                        </span>
                        <span class="text-gray-400 text-xs font-bold bg-gray-100 px-2 py-1 rounded">x${item.quantite || 1}</span>
                    </li>`).join('');
            } else {
                itemsListHtml = `<li class="text-gray-500 italic">Contenu détaillé non disponible.</li>`;
            }
        } catch (e) {
            itemsListHtml = `<li class="text-red-400 italic">Erreur de chargement des détails.</li>`;
        }

        content.innerHTML = `
            <div class="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <p class="font-bold text-gray-800 text-lg">Total : ${order.prix_total}€</p>
            </div>
            <ul class="space-y-3 text-sm text-gray-600 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                ${itemsListHtml}
            </ul>
        `;
        document.getElementById('modal-title').innerText = `Commande #${order.id}`;
        openDetailsModal();
    }
}

function setupStars() {
    const stars = document.querySelectorAll('.star-btn');
    const scoreInput = document.getElementById('review-score');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            if (scoreInput) scoreInput.value = rating;

            stars.forEach(s => {
                const r = parseInt(s.getAttribute('data-rating'));
                if (r <= rating) {
                    s.classList.remove('text-gray-300');
                    s.classList.add('text-amber-400');
                } else {
                    s.classList.remove('text-amber-400');
                    s.classList.add('text-gray-300');
                }
            });
        });
    });
}

function setupForms() {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Ici vous pourrez ajouter plus tard l'appel à l'API pour sauvegarder le profil
            showToast("Modifications enregistrées avec succès !");
        });
    }

    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const orderId = document.getElementById('review-order-id').value;
            const score = document.getElementById('review-score').value;
            const comment = document.getElementById('review-text').value;

            if (score === "0") {
                alert("Veuillez sélectionner une note avec les étoiles.");
                return;
            }

            try {
                // Appel réel à l'API PHP que nous venons de créer
                const response = await fetch(`${API_BASE_URL}?action=submit_review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: orderId, rating: score, comment: comment })
                });
                
                const resJson = await response.json();
                
                if (resJson.status === "success") {
                    showToast(resJson.message); // Affiche "Merci ! Votre avis a bien été enregistré."
                    
                    // Réinitialisation du formulaire
                    reviewForm.reset();
                    document.getElementById('review-score').value = "0";
                    document.querySelectorAll('.star-btn').forEach(s => {
                        s.classList.remove('text-amber-400');
                        s.classList.add('text-gray-300');
                    });
                } else {
                    alert("❌ Erreur : " + resJson.message);
                }
            } catch (error) {
                console.error("Erreur d'envoi :", error);
                showToast("Erreur lors de l'envoi de l'avis.");
            }
        });
    }
}

function updateApiStatus(state, message) {
    const statusText = document.getElementById('api-status-text');
    if (statusText) statusText.innerText = message;
}

function openDetailsModal() { 
    const modal = document.getElementById('details-modal');
    if (modal) {
        modal.classList.remove('hidden'); 
        setTimeout(() => modal.classList.remove('opacity-0'), 10); 
    }
}

function closeDetailsModal() { 
    const modal = document.getElementById('details-modal');
    if (modal) {
        modal.classList.add('opacity-0'); 
        setTimeout(() => modal.classList.add('hidden'), 300); 
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (toast && toastMsg) {
        toastMsg.innerText = message;
        toast.style.transform = 'translateX(0)';
        setTimeout(() => { toast.style.transform = 'translateX(150%)'; }, 3000);
    }
}


function logout() { 
    window.location.href = 'api/index.php?action=logout'; 
}
function deconnecterUtilisateur() {
    fetch(`${API_URL}?action=logout`)
    .then(() => {
        window.location.href = 'index.html';
    });
}

function deconnecterUtilisateur() {
    
    fetch('API/index.php?action=logout') 
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                
                window.location.href = 'index.html'; 
            }
        })
        .catch(error => console.error('Erreur lors de la déconnexion:', error));
}