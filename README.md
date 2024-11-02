# LI - Application Gestion Authentification (Principe sécurité)

## Introduction

Cette application est un système de gestion d'authentification développé en utilisant Flask pour le backend et React pour le frontend. Les utilisateurs peuvent se connecter, se déconnecter et accéder à une page protégée.

**Technologies Utilisées :**

- **Backend :** Python, Flask, Flask-SQLAlchemy, Flask-CORS, Flask-WTF, dotenv.
- **Frontend :** React, axios, React Router.

## Backend (Flask)

### Description de l'Architecture

Le backend est construit avec Flask, un framework web léger pour Python. Il utilise SQLAlchemy pour gérer les bases de données, et il est configuré pour gérer les sessions et les sécurités CSRF.

### Points de Terminaison API

- `GET /api/get_csrf_token` : Génère un token CSRF pour sécuriser les requêtes.
- `POST /api/login` : Authentifie l'utilisateur avec un nom d'utilisateur et un mot de passe.
- `GET /api/check_logged_in` : Vérifie si l'utilisateur est connecté.
- `GET /api/get_user` : Récupère les informations de l'utilisateur connecté.
- `POST /api/logout` : Déconnecte l'utilisateur.

### Gestion des Utilisateurs et des Sessions

La classe `User` représente les utilisateurs dans la base de données. Les tentatives de connexion sont suivies pour éviter les abus.

### Sécurité

Le système utilise CSRF pour sécuriser les requêtes et stocke les mots de passe sous forme hachée à l'aide de `werkzeug.security`.

## Principes de Sécurité Appliqués

1. **Protection CSRF :**
   
   - Utilisation de tokens CSRF pour valider les requêtes `POST`, empêchant les attaques CSRF en vérifiant l'origine des requêtes.

2. **Hachage des Mots de Passe :**
   
   - Les mots de passe sont hachés avec `generate_password_hash` et vérifiés avec `check_password_hash`, protégeant ainsi les données utilisateur en cas de compromission.

3. **Gestion des Sessions :**
   
   - Sessions non permanentes et sécurisées (`HTTPOnly`) pour réduire les risques d'attaques XSS et de vol de session.

4. **Limitation des Tentatives de Connexion :**
   
   - Suivi des tentatives de connexion avec un verrouillage temporaire après 5 échecs pour prévenir les attaques par force brute.

5. **Configuration des Cookies :**
   
   - Cookies de session configurés avec des options de sécurité pour protéger les informations de session, avec une attention particulière à l'utilisation de HTTPS en production.

6. **Gestion des Erreurs :**
   
   - Messages d'erreur génériques pour éviter d'exposer des détails techniques aux attaquants tout en maintenant une expérience utilisateur positive.

## Frontend (React)

### Structure des Composants React

L'application React est constituée de plusieurs composants, chacun ayant une responsabilité spécifique.

- **Login** : Gère la saisie des informations d'identification et le processus de connexion.
- **AuthContext** : Utilisé pour gérer l'état d'authentification de l'utilisateur et fournir des informations à d'autres composants.
- **ProtectedRoute** : Vérifie si un utilisateur est connecté avant d'autoriser l'accès à des routes protégées.
- **ProtectedPage** : Contenu visible uniquement par les utilisateurs authentifiés.

### Contexte d'Authentification (AuthContext)

`AuthContext` utilise le contexte React pour fournir l'état d'authentification à l'ensemble de l'application. Il gère également la récupération du token CSRF et vérifie si l'utilisateur est connecté lors du chargement initial.

### Routes Protégées et Navigation

Les routes protégées redirigent vers la page de connexion si l'utilisateur n'est pas authentifié. La navigation est gérée par `React Router`.

## Interactivité

### Flux de Données entre le Client et le Serveur

Les composants frontend interagissent avec le backend via des requêtes HTTP en utilisant axios. Chaque action (connexion, déconnexion, récupération d'informations utilisateur) entraîne une requête correspondante vers les points de terminaison API.

### Gestion des Erreurs

Les erreurs de connexion ou de récupération de données sont gérées et affichées à l'utilisateur pour une meilleure expérience.

## Conclusion

Cette application fournit un système d'authentification simple mais efficace, utilisant des pratiques de sécurité modernes. Des améliorations futures pourraient inclure une interface utilisateur plus riche, une meilleure gestion des erreurs et des fonctionnalités supplémentaires comme la réinitialisation des mots de passe.
