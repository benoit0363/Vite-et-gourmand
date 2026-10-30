/**
 * index.js
 * Gestion de l'affichage dynamique des derniers avis clients sur la page d'accueil.
 */

const API_BASE_URL = 'api/index.php';

// Données de secours (Mocks)
// Elles s'afficheront automatiquement si la base de données est vide ou injoignable.
const fallbackReviews = [
    { nom_client: "Marc", note: 5, commentaire: "Un buffet exceptionnel pour mon mariage !" },
    { nom_client: "Sophie", note: 4, commentaire: "Produits très frais et service ponctuel." },
    { nom_client: "Antoine", note: 5, commentaire: "Une prestation traiteur impeccable de A à Z. Je recommande !" }
];

document.addEventListener('DOMContentLoaded', () => {
    loadHomeReviews();
});

// 1. Récupération des avis réels depuis l'API SQL
async function loadHomeReviews() {
    const container = document.getElementById('avis-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}?action=get_latest_reviews`);
        const result = await response.json();

        // 🛠️ DÉBOGAGE : Permet de voir ce que la BDD renvoie exactement dans la console F12
        console.log("🔎 Avis reçus de la BDD :", result);

        if (result.status === 'success' && result.data && result.data.length > 0) {
            // Si on a des avis en base de données, on les affiche !
            renderReviews(result.data, container);
        } else {
            // Si la table est vide, on utilise vos avis de secours
            console.log("Table 'avis' vide. Affichage des avis de secours.");
            renderReviews(fallbackReviews, container);
        }
    } catch (error) {
        // Grâce au correctif PHP, ce bloc catch ne s'exécutera qu'en cas de coupure réseau réelle
        console.warn("Erreur de communication API, chargement des avis locaux de secours :", error);
        renderReviews(fallbackReviews, container);
    }
}

// 2. Génération du HTML conforme à vos classes CSS (style.css)
function renderReviews(reviews, container) {
    container.innerHTML = ''; // On efface le texte "Chargement des avis..." ou les anciens avis

    reviews.forEach(review => {
        // Protection contre les valeurs nulles ou mal formées
        const note = review.note ? parseInt(review.note) : 5;
        
        // Construction des étoiles pleines/vides selon la note
        const starsSolid = "★".repeat(note);
        const starsEmpty = "☆".repeat(5 - note);

        // Correspondance exacte avec les alias de votre requête SQL (c.nom_client et a.commentaire)
        const nom = review.nom_client || review.prenom || "Client fidèle";
        const commentaire = review.commentaire || review.texte || "";

        // Structure HTML pour chaque carte d'avis
        const card = `
            <div class="avis-card">
                <div class="stars" style="color: #f59e0b; margin-bottom: 10px; font-size: 1.25rem;">
                    ${starsSolid}${starsEmpty}
                </div>
                <p>"${commentaire}"</p>
                <strong>- ${nom}</strong>
            </div>
        `;
        
        // Injection de la carte dans le conteneur HTML
        container.insertAdjacentHTML('beforeend', card);
    });
}