let livraisonValidee = false;
let creneauxReserves = [];
let reglagesHorairesAdmin = [];

// =========================================================================
// 1. INITIALISATION ET CHARGEMENT SÉCURISÉ
// =========================================================================
document.addEventListener("DOMContentLoaded", function() {
    // Appel à l'API pour vérifier si le client est connecté
    fetch('api/index.php?action=get_current_user')
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                console.log("Client connecté détecté ! Remplissage automatique...");
                
                // On fusionne Nom et Prénom si vous n'avez qu'une seule case "client-nom"
                if(document.getElementById('client-nom')) {
                    document.getElementById('client-nom').value = data.nom + " " + data.prenom;
                }
                
                if(document.getElementById('client-gsm')) {
                    document.getElementById('client-gsm').value = data.telephone;
                }
                
                if(document.getElementById('delivery-address')) {
                    document.getElementById('delivery-address').value = data.adresse;
                }
                
                if(document.getElementById('delivery-city')) {
                    document.getElementById('delivery-city').value = data.ville;
                }
                
                // Si vous avez un champ email dans la commande, ajoutez son ID ici (ex: client-email)
                if(document.getElementById('client-email')) {
                    document.getElementById('client-email').value = data.email;
                }
            }
        })
        .catch(error => console.error("Erreur lors de la vérification utilisateur:", error));
});


document.addEventListener('DOMContentLoaded', async () => {
    await chargerHorairesEtCreneaux();
});

async function chargerHorairesEtCreneaux() {
    try {
        const resHoraires = await fetch('api/index.php?action=get_horaires');
        reglagesHorairesAdmin = await resHoraires.json();

        const resCreneaux = await fetch('api/index.php?action=get_booked_slots');
        const resultCreneaux = await resCreneaux.json();

        creneauxReserves = Array.isArray(resultCreneaux)
            ? resultCreneaux
            : resultCreneaux.data || [];

        console.log("Horaires chargés :", reglagesHorairesAdmin);
        console.log("Créneaux réservés :", creneauxReserves);

        construireGrilleCalendrier();

    } catch (error) {
        console.error("Erreur chargement calendrier :", error);
    }
}
function construireGrilleCalendrier() {
    const gridContainer = document.getElementById('calendrier-grid');
    if (!gridContainer) return;

    // Ajout direct de la grille (7 colonnes sur grand écran)
    gridContainer.className = 'grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 w-full';
    gridContainer.innerHTML = ''; 

    for (let i = 0; i < 7; i++) {
        let dateActive = new Date();
        dateActive.setDate(dateActive.getDate() + i);

        let jourSemaineId = dateActive.getDay(); 
        
        const reglageJour = reglagesHorairesAdmin.find(h => {
            const idBdd = parseInt(h.jour_id);
            return idBdd === jourSemaineId || (jourSemaineId === 0 && idBdd === 7);
        });

        const colonne = document.createElement('div');
        // Style de la colonne
        colonne.className = 'flex flex-col bg-slate-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm';

        const nomJour = dateActive.toLocaleDateString('fr-FR', { weekday: 'long' });
        const numEtMois = dateActive.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        
        // Style de l'en-tête (Date)
        colonne.innerHTML = `
            <div class="bg-white p-3 text-center border-b border-gray-200">
                <div class="text-sm font-bold text-gray-800 capitalize">${nomJour}</div>
                <div class="text-xs text-gray-500">${numEtMois}</div>
            </div>
            <div class="p-3 flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar" id="slots-jour-${i}"></div>
        `;

        gridContainer.appendChild(colonne);
        const slotsContainer = colonne.querySelector(`#slots-jour-${i}`);

        if (reglageJour && parseInt(reglageJour.ouvert) === 1) {
            const dateISO = dateActive.toISOString().split('T')[0]; 

            const genererBoutonsHoraires = (heureDebut, heureFin) => {
                if (!heureDebut || heureDebut === '00:00:00' || !heureFin || heureFin === '00:00:00') return;
                let [hDebut, mDebut] = heureDebut.split(':').map(Number);
                let [hFin, mFin] = heureFin.split(':').map(Number);

                let actuel = hDebut * 60 + mDebut;
                const fin = hFin * 60 + mFin;

                while (actuel <= fin) {
                    let hStr = Math.floor(actuel / 60).toString().padStart(2, '0');
                    let mStr = (actuel % 60).toString().padStart(2, '0');
                    let formatBadgeSQL = `${hStr}h${mStr}`; 

                    const listeCreneaux = Array.isArray(creneauxReserves) ? creneauxReserves : [];
                    const estDejaPris = listeCreneaux.some(slot => 
                        slot.date_prestation === dateISO && slot.heure_prestation === formatBadgeSQL
                    );

                    if (!estDejaPris) {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        // Style du bouton par défaut
                        btn.className = 'w-full border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-600 hover:border-[#9eb2a0] hover:text-[#9eb2a0] transition-colors bg-white focus:outline-none time-slot-btn';
                        btn.textContent = `${hStr}:${mStr}`;
                        
                        btn.addEventListener('click', () => {
                            // Réinitialiser tous les boutons à leur style par défaut
                            document.querySelectorAll('.time-slot-btn').forEach(b => {
                                b.className = 'w-full border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-600 hover:border-[#9eb2a0] hover:text-[#9eb2a0] transition-colors bg-white focus:outline-none time-slot-btn';
                            });
                            // Appliquer le style "Actif/Sélectionné" sur le bouton cliqué
                            btn.className = 'w-full border-2 border-[#9eb2a0] rounded-lg py-2 text-sm font-bold text-[#9eb2a0] bg-[#9eb2a0]/10 focus:outline-none time-slot-btn';

                            if(document.getElementById('date-prest')) document.getElementById('date-prest').value = dateISO;
                            if(document.getElementById('heure-prest')) document.getElementById('heure-prest').value = formatBadgeSQL;
                            console.log(`Créneau choisi : ${dateISO} à ${formatBadgeSQL}`);
                        });

                        slotsContainer.appendChild(btn);
                    }
                    actuel += 30; 
                }
            };

            genererBoutonsHoraires(reglageJour.midi_debut, reglageJour.midi_fin);
            genererBoutonsHoraires(reglageJour.soir_debut, reglageJour.soir_fin);
            
            if(slotsContainer.children.length === 0) {
                 slotsContainer.innerHTML = `<span class="text-xs text-gray-400 italic text-center w-full block mt-2">Complet</span>`;
            }
        } else {
            slotsContainer.innerHTML = `<span class="text-xs text-gray-400 italic text-center w-full block mt-2">Fermé</span>`;
        }
    }
}
// =========================================================================
// 🛒 3. GESTION DU PANIER (AFFICHAGE & MODIFICATION)
// =========================================================================
function afficherLePanier() {
    let panier = JSON.parse(localStorage.getItem('panier_multi')) || [];
    const container = document.getElementById('liste-panier');
    if (!container) return;

    if (panier.length === 0) {
        container.innerHTML = "<p>Votre panier est vide.</p>";
        calculerPrixTotal();
        return;
    }

    container.innerHTML = "";
    panier.forEach((menu, index) => {
        const nom = menu.titre || menu.title || menu.name || "Menu";
        const prix = parseFloat(menu.prix || menu.price || 0);
        const qte = parseInt(menu.quantite || menu.qte || menu.persMin || 1);

        container.innerHTML += `
            <div class="item-panier" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                <span><strong>${nom}</strong> (${prix}€/pers)</span>
                <div>
                    <label>Parts :</label>
                    <input type="number" value="${qte}" min="1" style="width:50px" 
                           onchange="modifierQuantite(${index}, this.value)">
                    <button type="button" onclick="retirerDuPanier(${index})" style="color:red; border:none; background:none; cursor:pointer; margin-left:10px;">❌</button>
                </div>
            </div>
        `;
    });
    calculerPrixTotal();
}

function modifierQuantite(index, val) {
    let panier = JSON.parse(localStorage.getItem('panier_multi')) || [];

    if (!panier[index]) return;

    const qteMin = parseInt(panier[index].persMin || panier[index].personnes_min || 1);
    let nouvelleQte = parseInt(val);

    if (isNaN(nouvelleQte) || nouvelleQte < qteMin) {
        nouvelleQte = qteMin;
    }

    panier[index].quantite = nouvelleQte;

    localStorage.setItem('panier_multi', JSON.stringify(panier));
    afficherLePanier();
}

function retirerDuPanier(index) {
    let panier = JSON.parse(localStorage.getItem('panier_multi')) || [];
    panier.splice(index, 1);
    localStorage.setItem('panier_multi', JSON.stringify(panier));
    afficherLePanier();
}


// =========================================================================
// 🚚 4. CALCUL DES PRIX ET ZONE DE LIVRAISON
// =========================================================================
function calculerPrixTotal() {
    const panier = JSON.parse(localStorage.getItem('panier_multi')) || [];

    let totalPlatsBrut = 0; // Le vrai sous-total (ex: 246.00 €)
    let totalRemise = 0;    // La réduction (ex: 24.60 €)
    let totalParts = 0;

    panier.forEach(menu => {
        const qteMin = parseInt(menu.persMin || menu.personnes_min || 1);
        const qte = parseInt(menu.quantite || menu.qte || qteMin || 1);

        const prixBase = menu.prix || menu.price || menu.prix_menu || menu.tarif || 0;
        const prixUnitaire = parseFloat(String(prixBase).replace(',', '.')) || 0;

        // 1. On calcule le prix de la ligne SANS aucune remise
        let prixLigneBrut = qte * prixUnitaire;
        totalPlatsBrut += prixLigneBrut; 

        // 2. On calcule et on isole la remise si le client y a droit
        if (qte >= (qteMin + 5)) {
            let remiseLigne = prixLigneBrut * 0.10;
            totalRemise += remiseLigne;
        }

        totalParts += qte;
    });

    // 3. On calcule le total net à payer
    const totalPlatsFinal = totalPlatsBrut - totalRemise;
    const frais = 0; 
    const totalToutCompris = totalPlatsFinal + frais;

    if (document.getElementById('display-nb-pers')) {
        document.getElementById('display-nb-pers').innerText = totalParts;
    }

    if (document.getElementById('sous-total-plats')) {
        document.getElementById('sous-total-plats').innerText = totalPlatsBrut.toFixed(2);
    }

    if (document.getElementById('affichage-remise')) {
        document.getElementById('affichage-remise').innerText = totalRemise.toFixed(2);
    }

    if (document.getElementById('total-final')) {
        document.getElementById('total-final').innerText = totalToutCompris.toFixed(2);
    }
}

function toggleDistanceField() {
    const ville = document.getElementById('delivery-city')?.value.toLowerCase() || "";
    const kmGroup = document.getElementById('km-group');
    if (kmGroup) {
        kmGroup.style.display = (ville !== "bordeaux" && ville !== "") ? "block" : "none";
        if (ville === "bordeaux") document.getElementById('delivery-km').value = 0;
    }
    calculerPrixTotal();
}

function validerLivraison() {
    const ville = document.getElementById('delivery-city')?.value.toLowerCase() || "";
    const distance = parseFloat(document.getElementById('delivery-km')?.value) || 0;
    const msgZone = document.getElementById('confirmation-livraison-msg');
    if (!msgZone) return;

    if (ville !== "bordeaux" && ville !== "") {
        let frais = 5 + (distance * 0.59);
        msgZone.innerHTML = `⚠️ Frais hors Bordeaux : <strong>${frais.toFixed(2)}€</strong>.<br><button type="button" onclick="accepterFrais(${frais})">Accepter</button>`;
        msgZone.style.background = "#fff3cd";
        msgZone.style.display = "block";
        livraisonValidee = false;
    } else {
        msgZone.innerHTML = "✅ Livraison à Bordeaux : Gratuite !";
        msgZone.style.background = "#d4edda";
        msgZone.style.display = "block";
        livraisonValidee = true;
        calculerPrixTotal();
    }
}

function accepterFrais(frais) {
    livraisonValidee = true;
    calculerPrixTotal();
    alert("Frais de livraison validés !");
}


// =========================================================================
// 🚀 5. ENVOI FINAL DU FORMULAIRE
// =========================================================================
async function envoyerCommande(event) {
    event.preventDefault(); // Empêche le rechargement de la page
    console.log("➡️ Tentative d'envoi de la commande...");
    
    // 1. Vérification du panier
    const panier = JSON.parse(localStorage.getItem('panier_multi')) || [];
    if (panier.length === 0) {
        alert("⚠️ Votre panier est vide ! Vous devez choisir au moins un plat.");
        return;
    }

    // 2. Vérification des champs requis manuellement (au cas où le navigateur bloque)
    const nomClient = document.getElementById('client-nom')?.value.trim();
    const telClient = document.getElementById('client-gsm')?.value.trim();
    
    if(!nomClient || !telClient) {
        alert("⚠️ Veuillez indiquer votre Nom Complet et votre Numéro de téléphone pour valider la commande.");
        return;
    }

    // 3. Vérification de la date et de l'heure
    const dateSelectionnee = document.getElementById('date-prest')?.value;
    const heureSelectionnee = document.getElementById('heure-prest')?.value;

    if (!dateSelectionnee || !heureSelectionnee) {
        alert("📅 Vous avez oublié de choisir un jour et un créneau horaire dans le calendrier !");
        return;
    }

    // Si tout est bon, on prépare les données
    const data = {
        action: 'place_order',
        nom: nomClient,
        telephone: telClient,
        adresse: document.getElementById('delivery-address') ? document.getElementById('delivery-address').value :'',
        ville: document.getElementById('client-ville') ? document.getElementById('client-ville').value : '',
        date: dateSelectionnee,
        heure: heureSelectionnee,
        panier: panier,
        total: document.getElementById('total-final').innerText.replace('€', '').trim()
    };

    console.log("➡️ Données prêtes à être envoyées à l'API :", data);

    try {
        const response = await fetch('api/index.php?action=place_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log("➡️ Réponse du serveur :", result);
        
        if (result.success || result.status === 'success') {
            alert("✅ Votre commande a bien été enregistrée !");
            localStorage.removeItem('panier_multi'); 
            window.location.href = "index.html"; 
        } else {
            alert("❌ Le serveur a refusé la commande : " + (result.message || "Erreur inconnue"));
        }
    } catch (error) {
        console.error("❌ Impossible de joindre le serveur PHP :", error);
        alert("Erreur réseau : Vérifiez que l'adresse de votre API est correcte et que votre serveur tourne.");
    }
}
document.addEventListener('DOMContentLoaded', () => {
afficherLePanier();
});

// 🚀 5. ENVOI FINAL DU FORMULAIRE
// =========================================================================
async function envoyerCommande(event) {
    event.preventDefault(); // Empêche le rechargement de la page
    console.log("➡️ Tentative d'envoi de la commande...");
    
    // 1. Vérification du panier
    const panier = JSON.parse(localStorage.getItem('panier_multi')) || [];
    if (panier.length === 0) {
        alert("⚠️ Votre panier est vide ! Vous devez choisir au moins un plat.");
        return;
    }

    // 2. Vérification des champs requis
    const nomClient = document.getElementById('client-nom')?.value.trim();
    const telClient = document.getElementById('client-gsm')?.value.trim();
    
    if(!nomClient || !telClient) {
        alert("⚠️ Veuillez indiquer votre Nom Complet et votre Numéro de téléphone pour valider la commande.");
        return;
    }

    // 3. Vérification de la date et de l'heure
    const dateSelectionnee = document.getElementById('date-prest')?.value;
    const heureSelectionnee = document.getElementById('heure-prest')?.value;

    if (!dateSelectionnee || !heureSelectionnee) {
        alert("📅 Vous avez oublié de choisir un jour et un créneau horaire dans le calendrier !");
        return;
    }

    // =====================================================================
    // 🛑 4. NOUVEAU : VÉRIFICATION DE L'ACCEPTATION DES FRAIS ET CGV
    // =====================================================================
    const cgvLivraison = document.getElementById('cgv-livraison');
    const cgvMateriel = document.getElementById('cgv-materiel');

    if (cgvLivraison && !cgvLivraison.checked) {
        alert("🚚 Vous devez accepter les conditions relatives aux frais de livraison pour continuer.");
        return;
    }

    if (cgvMateriel && !cgvMateriel.checked) {
        alert("🍽️ Vous devez accepter les conditions de retour du matériel pour continuer.");
        return;
    }
    // =====================================================================

    // Si tout est bon, on prépare les données
    const data = {
        action: 'place_order',
        nom: nomClient,
        telephone: telClient,
        adresse: document.getElementById('delivery-address') ? document.getElementById('delivery-address').value : '',
        ville: document.getElementById('delivery-city') ? document.getElementById('delivery-city').value : '',
        date: dateSelectionnee,
        heure: heureSelectionnee,
        panier: panier,
        total: document.getElementById('total-final').innerText.replace('€', '').trim(),
        accord_livraison: true,
        accord_materiel: true 
    };

    console.log("➡️ Données prêtes à être envoyées à l'API :", data);

    try {
        const response = await fetch('api/index.php?action=place_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log("➡️ Réponse du serveur :", result);
        
        if (result.success || result.status === 'success') {
            alert("✅ Votre commande a bien été enregistrée !");
            localStorage.removeItem('panier_multi'); 
            window.location.href = "index.html"; 
        } else {
            alert("❌ Le serveur a refusé la commande : " + (result.message || "Erreur inconnue"));
        }
    } catch (error) {
        console.error("❌ Impossible de joindre le serveur PHP :", error);
        alert("Erreur réseau : Vérifiez que l'adresse de votre API est correcte et que votre serveur tourne.");
    }
}

