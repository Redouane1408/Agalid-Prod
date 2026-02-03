# Guide de Déploiement Agalid

Ce guide vous explique comment déployer l'application sur le serveur de production (197.201.240.218).

## 1. Préparer les fichiers
Les fichiers de configuration ont été mis à jour avec vos informations :
- `infra/docker-compose.prod.yml` : Configuration Docker pour la production.
- `infra/production.env` : Contient tous vos mots de passe et clés API (SMTP, Base de données, WhatsApp).
- `infra/Caddyfile` : Configuration du serveur web (HTTPS automatique).
- `server/Dockerfile` : Mis à jour pour supporter WhatsApp Web (Puppeteer).

## 2. Transférer le projet sur le serveur
Vous devez copier les fichiers du projet sur votre serveur. La méthode la plus simple est de compresser le projet (sans les dossiers `node_modules`) et de l'envoyer.

### Option A : Via ligne de commande (si vous avez zip et scp)
1.  **Compresser** le dossier du projet (exclure `node_modules`, `.git`, `.trae`).
2.  **Envoyer** le fichier zip :
    ```bash
    scp -P 22 agalid-project.zip agalid@197.201.240.218:~/
    ```
    *(Mot de passe : P@ssW0rdAG)*

### Option B : Via FileZilla (Recommandé)
1.  Connectez-vous à `197.201.240.218` avec l'utilisateur `agalid` et le mot de passe `P@ssW0rdAG`.
2.  Créez un dossier `app` sur le serveur.
3.  Copiez tout le contenu de votre dossier local `agalid` dans ce dossier `app` (IMPORTANT : **Ne copiez PAS** les dossiers `node_modules` et `.git`, cela prendrait trop de temps).

## 3. Lancer l'installation
Une fois les fichiers sur le serveur :

1.  Connectez-vous en SSH :
    ```bash
    ssh agalid@197.201.240.218
    # Mot de passe : P@ssW0rdAG
    ```

2.  Allez dans le dossier du projet :
    ```bash
    cd app
    ```

3.  Lancez le script de déploiement :
    ```bash
    bash infra/deploy.sh
    ```
    *Ce script va installer Docker (si nécessaire), configurer l'environnement, et lancer les services.*

## 4. Finalisation
- **WhatsApp** : Le système utilise maintenant l'API officielle (via Twilio) avec vos clés. Plus besoin de scanner de QR Code !
- **Accès** : L'application sera accessible sur `https://agalid.com` (une fois le DNS propagé) ou directement via l'IP `http://197.201.240.218`.

## Note sur WhatsApp
L'intégration a été mise à jour pour utiliser l'API officielle (Twilio) grâce aux identifiants `AC...` que vous avez fournis. Cela garantit une stabilité parfaite (pas de déconnexion comme avec la version web). Assurez-vous simplement que votre compte Twilio/WhatsApp est bien approvisionné pour l'envoi des messages.
