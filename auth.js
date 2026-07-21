document.getElementById('form-register')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nom', document.getElementById('reg-nom').value);
    formData.append('prenom', document.getElementById('reg-prenom').value);
    formData.append('email', document.getElementById('reg-email').value);
    formData.append('mot_de_passe', document.getElementById('reg-password').value);
    formData.append('telephone', document.getElementById('reg-telephone').value);
    formData.append('adresse', document.getElementById('reg-adresse').value);
    formData.append('ville', document.getElementById('reg-ville').value);

    fetch('api/index.php?action=register', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) throw new Error("Erreur serveur lors de l'appel");
                return res.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    alert("✨ Votre compte a été créé avec succès ! Un e-mail de bienvenue vous a été envoyé. Vous pouvez maintenant vous connecter.");
                    formRegister.reset();
                    
                    // Optionnel : Basculer automatiquement sur l'onglet de connexion si disponible
                    const loginTabBtn = document.getElementById('tab-login');
                    if (loginTabBtn) {
                        loginTabBtn.click();
                    }
                } else {
                    alert("⚠️ Impossible de créer le compte : " + data.message);
                }
            })
            .catch(error => {
                console.error("Erreur inscription :", error);
                alert("Une erreur de communication est survenue lors de l'inscription.");
            });
        });


// Gestion de la Connexion
document.getElementById('form-login')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('email', document.getElementById('log-email').value);
    formData.append('mot_de_passe', document.getElementById('log-password').value);

    fetch('api/index.php?action=login', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        const msgDiv = document.getElementById('login-message');
        if(data.status === 'success') {
            msgDiv.className = "message success";
            msgDiv.innerText = "Connexion réussie ! Redirection...";
            // Rediriger vers la page de commande après 1.5 seconde
            setTimeout(() => { 
                window.location.href = data.redirection
            }, 1500);
        } else {
            msgDiv.className = "message error";
            msgDiv.innerText = data.message;
        }
    });
});