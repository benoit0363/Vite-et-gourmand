<?php

function envoyerEmailBienvenue($email, $nom) {
    // 1. Définition du sujet de l'e-mail
    $sujet = "Bienvenue chez Vite & Gourmand ! 🌿";

    // 2. Configuration des en-têtes (Headers) indispensables pour envoyer du HTML propre et éviter les spams
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/html; charset=utf-8';
    $headers[] = 'From: Vite & Gourmand <no-reply@vite-gourmand.fr>';
    $headers[] = 'Reply-To: contact@vite-gourmand.fr';
    $headers[] = 'X-Mailer: PHP/' . phpversion();

    // Assemblage des headers en chaîne de caractères
    $headers_string = implode("\r\n", $headers);

    // 3. Création du corps du message en HTML (Design moderne et épuré avec la couleur Vert Sauge #9eb2a0)
    $message = '
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
                color: #334155;
            }
            .email-container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                border: 1px solid #e2e8f0;
            }
            .email-header {
                background-color: #9eb2a0; /* Vert Sauge */
                color: #ffffff;
                padding: 40px 30px;
                text-align: center;
            }
            .email-header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 1px;
            }
            .email-body {
                padding: 40px 30px;
                line-height: 1.6;
            }
            .email-body h2 {
                color: #1e293b;
                font-size: 20px;
                margin-top: 0;
            }
            .welcome-gif {
                width: 100%;
                max-height: 250px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            .btn-action {
                display: inline-block;
                background-color: #9eb2a0;
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 28px;
                border-radius: 8px;
                font-weight: bold;
                margin-top: 20px;
                box-shadow: 0 2px 4px rgba(158, 178, 160, 0.3);
            }
            .email-footer {
                background-color: #0f172a; /* Slate 900 */
                color: #94a3b8;
                text-align: center;
                padding: 30px;
                font-size: 12px;
                line-height: 1.5;
            }
            .email-footer a {
                color: #9eb2a0;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- HEADER -->
            <div class="email-header">
                <h1>Vite & Gourmand</h1>
                <p style="margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Service Traiteur & Réceptions</p>
            </div>

            <!-- BODY -->
            <div class="email-body">
                <h2>Bonjour ' . htmlspecialchars($nom) . ',</h2>
                <p>Toute l\'équipe de <strong>Vite & Gourmand</strong> est ravie de vous compter parmi ses nouveaux clients ! Julie et José vous souhaitent la plus chaleureuse des bienvenues.</p>
                
                <img class="welcome-gif" src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800" alt="Bienvenue">

                <p>Depuis votre espace personnel, vous pouvez désormais :</p>
                <ul style="padding-left: 20px; margin: 15px 0;">
                    <li>Consulter et commander nos délicieux menus artisanaux.</li>
                    <li>Suivre la préparation et la livraison de vos buffets en temps réel.</li>
                    <li>Gérer vos adresses de livraison et vos informations de contact.</li>
                    <li>Laisser votre avis sur vos précédentes dégustations.</li>
                </ul>

                <p>Découvrez dès aujourd\'hui notre sélection gourmande de saison préparée avec passion dans nos ateliers.</p>
                
                <div style="text-align: center;">
                    <a href="http://localhost/vite-et-gourmand/menus.html" class="btn-action">Découvrir la Carte</a>
                </div>
            </div>

            <!-- FOOTER -->
            <div class="email-footer">
                <p><strong>Vite & Gourmand</strong> - Traiteur Événementiel à Bordeaux</p>
                <p>📍 Bordeaux, France | ✉️ <a href="mailto:contact@vite-gourmand.fr">contact@vite-gourmand.fr</a></p>
                <p style="margin-top: 15px; color: #64748b;">Cet e-mail est automatique, merci de ne pas y répondre directement.</p>
            </div>
        </div>
    </body>
    </html>
    ';

    // 4. Envoi de l'e-mail par la fonction interne PHP mail()
    // Note : Sur localhost, assurez-vous d'avoir configuré un serveur de messagerie (comme Sendmail, Mailhog ou smtp_port dans php.ini)
    return mail($email, $sujet, $message, $headers_string);
}
?>