/**
 * PROJET : Vite & Gourmand
 * LOGIQUE DE LA PAGE D'ACCUEIL
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialisation des fonctions
    chargerAvisValides();
    gestionScrollNavbar();
    initFormulaireAvis(); // <--- ON AJOUTE L'INITIALISATION ICI
});

/**
 * 1. ENVOI DE L'AVIS (NOUVEAU)
 * Gère la soumission du formulaire par le client
 */
function initFormulaireAvis() {
    const form = document.getElementById('form-avis-client');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nouvelAvis = {
            id: Date.now(),
            prenom: document.getElementById('avis-nom').value,
            note: parseInt(document.getElementById('avis-note').value),
            texte: document.getElementById('avis-message').value,
            date: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
            statut: "en attente" // Par défaut, l'employé doit valider
        };

        // Sauvegarde dans le localStorage (notre base de données temporaire)
        let baseAvis = JSON.parse(localStorage.getItem('database_avis')) || [];
        baseAvis.push(nouvelAvis);
        localStorage.setItem('database_avis', JSON.stringify(baseAvis));

        alert("Merci " + nouvelAvis.prenom + " ! Votre avis est en cours de modération.");
        form.reset();
    });
}

/**
 * 2. AFFICHAGE DES AVIS VALIDÉS
 * Lit la base de données et affiche uniquement les avis avec statut "valide"
 */
async function chargerAvisValides() {
    const container = document.getElementById('avis-container');
    if (!container) return;

    try {
        // Récupération des avis depuis le localStorage
        const baseAvis = JSON.parse(localStorage.getItem('database_avis')) || [];

        // FILTRE : On ne garde que ceux validés par l'employé
        const avisData = baseAvis.filter(a => a.statut === "valide");

        // Nettoyage du message de chargement
        container.innerHTML = '';

        if (avisData.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#888;">Soyez le premier à partager votre expérience !</p>';
            return;
        }

        // Génération dynamique des cartes d'avis
        avisData.forEach(avis => {
            const card = document.createElement('article');
            card.className = 'avis-card';
            
            const etoiles = "★".repeat(avis.note) + "☆".repeat(5 - avis.note);

            card.innerHTML = `
                <div class="stars" style="color: #f39c12;" aria-label="Note de ${avis.note} sur 5">${etoiles}</div>
                <p class="avis-texte">"${avis.texte}"</p>
                <div class="avis-footer">
                    <strong>${avis.prenom}</strong>
                    <span class="avis-date">${avis.date}</span>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = `<p class="error">Impossible de charger les avis.</p>`;
        console.error("Erreur :", error);
    }
}

/**
 * 3. UX : Navbar & Animations
 */
function gestionScrollNavbar() {
    const header = document.querySelector('header');
    if(!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            header.style.background = '#ffffff';
            header.style.boxShadow = 'none';
        }
    });
}

// Animation d'apparition au scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});