const resetForm = document.getElementById('reset-form');
const statusBox = document.getElementById('status-box');
const submitBtn = document.getElementById('submit-btn');
const emailInput = document.getElementById('email');

/**
 * Fonction de traitement de la soumission du formulaire
 */
async function handleResetSubmit(event) {
    event.preventDefault(); // Empêche le rechargement classique de la page

    const email = emailInput.value;

    // Mise à jour de l'UI : État de chargement
    setLoadingState(true);

    try {
        // Envoi des données vers VOTRE API PHP
        const response = await fetch('api/index.php?action=forgot_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email: email }) // On envoie l'email au format JSON
        });

        const data = await response.json();

        // CORRECTION ICI : On vérifie bien le 'status' renvoyé par le PHP
        if (data.status === 'success') {
            // Succès
            showStatusMessage('✅ ' + data.message, 'success');
            resetForm.reset();
        } else {
            // Erreur retournée par le serveur
            throw new Error(data.message || 'Une erreur est survenue.');
        }
    } catch (error) {
        // Gestion des erreurs réseau ou serveur
        showStatusMessage(`❌ ${error.message}`, 'error');
    } finally {
        // Réinitialisation de l'état du bouton
        setLoadingState(false);
    }
}

/**
 * Bascule l'état de chargement du bouton
 */
function setLoadingState(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Envoi en cours...' : 'Envoyer le lien';
}

/**
 * Affiche un message de statut à l'utilisateur
 */
function showStatusMessage(message, type) {
    if (!statusBox) return;
    
    // On nettoie les anciennes classes de couleur
    statusBox.classList.remove('hidden', 'bg-blue-50', 'text-blue-700', 'bg-green-50', 'text-green-700', 'bg-red-50', 'text-red-700');
    
    // On applique les nouvelles couleurs en fonction du type
    if (type === 'success') {
        statusBox.classList.add('bg-green-50', 'text-green-700');
    } else if (type === 'error') {
        statusBox.classList.add('bg-red-50', 'text-red-700');
    } else {
        statusBox.classList.add('bg-blue-50', 'text-blue-700');
    }
    
    // On met à jour le texte et on affiche la boîte
    statusBox.textContent = message;
    statusBox.classList.remove('hidden');
}

// Écouteur d'événement sur le formulaire
if (resetForm) {
    resetForm.addEventListener('submit', handleResetSubmit);
}