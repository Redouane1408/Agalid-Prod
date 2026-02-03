# Demande d'Informations pour la Configuration et le Déploiement

Bonjour,

Afin de finaliser la configuration de votre projet **Agalid** et de mettre en place le déploiement automatique (CI/CD) sur votre infrastructure locale, j'ai besoin des informations techniques suivantes.

Ces éléments permettront de :
1. Connecter l'application à vos services (envoi d'emails, notifications WhatsApp).
2. Assurer l'hébergement et la sécurité de l'application sur votre serveur.

---

## 1. Accès au Serveur (Pour le déploiement)

Ces informations sont nécessaires pour configurer GitHub Actions afin qu'il puisse déployer automatiquement les mises à jour sur votre serveur.

*   **Adresse IP publique ou Nom d'hôte (Host)** : (ex: `192.168.1.100` ou `server.agalid.ma`)
*   **Nom d'utilisateur SSH** : (ex: `root`, `ubuntu`, `admin`)
*   **Clé SSH ou Mot de passe** : 
    *   *Idéalement, une clé SSH privée pour une connexion sécurisée sans mot de passe.*
    *   *Si vous utilisez un mot de passe, merci de le fournir.*
*   **Port SSH** : (Défaut : `22`, précisez si différent)

## 2. Nom de Domaine

*   **Nom de domaine souhaité** : (ex: `agalid.ma`, `app.agalid.com`)
*   **Gestion DNS** : Avez-vous accès à la gestion des enregistrements DNS (OVH, GoDaddy, etc.) pour faire pointer ce domaine vers l'adresse IP de votre serveur ?

## 3. Configuration Email (SMTP)

Nécessaire pour l'envoi des emails transactionnels (inscription, réinitialisation de mot de passe, alertes).

*   **Serveur SMTP (Host)** : (ex: `smtp.office365.com`, `smtp.gmail.com`, `mail.votre-domaine.com`)
*   **Port SMTP** : (ex: `587` (TLS), `465` (SSL), `25`)
*   **Utilisateur SMTP (Email d'envoi)** : (ex: `no-reply@agalid.ma`)
*   **Mot de passe SMTP** : (ou clé d'application si double authentification activée)
*   **Sécurité** : (TLS ou SSL ?)

## 4. Configuration WhatsApp (Optionnel / Si applicable)

Pour l'envoi des notifications via WhatsApp.

*   **Numéro de téléphone associé** :
*   **Méthode souhaitée** :
    *   *API Officielle (Meta/Facebook)* : J'aurai besoin des clés API (App ID, Phone Number ID, Access Token).
    *   *Solution tierce (ex: Twilio)* : Account SID, Auth Token.
    *   *Client Web (scan QR Code)* : Nous pourrons le configurer ensemble une fois l'application lancée via un scan de QR code.

## 5. Base de Données

*   **Préférence** : Souhaitez-vous que j'installe une nouvelle base de données (PostgreSQL) via Docker sur le serveur (recommandé pour l'isolation), ou dois-je utiliser une instance existante ?
*   **Si existante** :
    *   Host :
    *   Port :
    *   Nom de la base :
    *   Utilisateur :
    *   Mot de passe :

---

Merci de me transmettre ces informations dès que possible. Je reste à votre disposition si vous avez des questions sur l'un de ces points.
