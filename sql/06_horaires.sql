CREATE TABLE horaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jour_id INT NOT NULL, -- 0 = Dimanche, 1 = Lundi, etc.
    ouvert TINYINT(1) DEFAULT 1,
    midi_debut TIME DEFAULT '11:00:00',
    midi_fin TIME DEFAULT '14:00:00',
    soir_debut TIME DEFAULT '18:00:00',
    soir_fin TIME DEFAULT '22:00:00'
);

ALTER TABLE commandes ADD COLUMN date_commande DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 2. On insère les 7 jours de la semaine par défaut pour débloquer l'affichage des horaires
-- (0 = Dimanche, 1 = Lundi, ..., 6 = Samedi)
TRUNCATE TABLE horaires;

INSERT INTO horaires (jour_id, ouvert, midi_debut, midi_fin, soir_debut, soir_fin) VALUES
(1, 1, '11:00:00', '14:00:00', '18:00:00', '22:00:00'),
(2, 1, '11:00:00', '14:00:00', '18:00:00', '22:00:00'),
(3, 1, '11:00:00', '14:00:00', '18:00:00', '22:00:00'),
(4, 1, '11:00:00', '14:00:00', '18:00:00', '22:00:00'),
(5, 1, '11:00:00', '14:00:00', '18:00:00', '23:00:00'),
(6, 1, '11:00:00', '14:00:00', '18:00:00', '23:00:00'),
(0, 0, '00:00:00', '00:00:00', '00:00:00', '00:00:00');