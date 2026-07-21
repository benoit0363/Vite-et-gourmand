document.addEventListener('DOMContentLoaded', () => {
    if (typeof savedInfos !== 'undefined' && savedInfos) {
        const elTel = document.getElementById('cfg-tel');
        const elEmail = document.getElementById('cfg-email');
        const elAdresse = document.getElementById('cfg-adresse');
        const footerTel = document.getElementById('footer-tel');
        const footerEmail = document.getElementById('footer-email');

        if (savedInfos.tel && elTel) elTel.value = savedInfos.tel;
        if (savedInfos.email && elEmail) elEmail.value = savedInfos.email;
        if (savedInfos.adresse && elAdresse) elAdresse.value = savedInfos.adresse;

        if (savedInfos.tel && footerTel) {
            footerTel.innerHTML = `<i class="fa-solid fa-phone text-[#9eb2a0] w-4"></i> ${savedInfos.tel}`;
        }
        if (savedInfos.email && footerEmail) {
            footerEmail.innerHTML = `<i class="fa-solid fa-envelope text-[#9eb2a0] w-4"></i> ${savedInfos.email}`;
        }
    }
});

// 2. Gestion de l'envoi du Formulaire de Contact
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Récupération sécurisée des éléments
        const nomEl = document.getElementById('form-nom');
        const emailEl = document.getElementById('form-email');
        const telEl = document.getElementById('form-tel');
        const sujetEl = document.getElementById('form-sujet');
        const messageEl = document.getElementById('form-message');

        // Vérification que tous les champs existent dans le DOM
        if (!nomEl || !emailEl || !telEl || !sujetEl || !messageEl) {
            console.error("Certains champs du formulaire sont introuvables dans le HTML.");
            alert("Erreur de configuration du formulaire (champs introuvables).");
            return;
        }

        const nouveauMessage = {
            nom: nomEl.value,
            email: emailEl.value,
            tel: telEl.value,
            sujet: sujetEl.value,
            message: messageEl.value
        };

        try {
            const response = await fetch('api/index.php?action=send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nouveauMessage)
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert("Merci " + nouveauMessage.nom + ", votre message a bien été envoyé !");
                contactForm.reset();
            } else {
                alert("Erreur lors de l'envoi : " + (result.message || "Une erreur est survenue."));
            }

        } catch (error) {
            console.error("Erreur Fetch :", error);
            alert("Impossible de joindre le serveur pour envoyer votre message.");
        }
    });
}