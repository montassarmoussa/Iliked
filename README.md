# Iliked

Plateforme sociale autour du cinéma. Découvre des films, note-les, partage tes avis et connecte-toi avec une communauté de passionnés.

---

## Fonctionnalités

### Films
- **Découverte** — Parcours les dernières sorties, les mieux notés, les plus populaires et explore par genre (Action, Drame, Comédie, Horreur, Science-Fiction, Thriller, Animation, Romance, Aventure, Documentaire, Fantastique)
- **Fiche film** — Détails complets (synopsis, casting, durée, note, pays de production), plateformes de streaming disponibles
- **Interactions** — Like / dislike, marquer comme vu, ajouter à la watchlist, noter de 1 à 10
- **Commentaires** — Partage ton avis sur chaque film
- **Film aléatoire** — Découvre un film au hasard
- **Streaming** — Trouve où regarder un film en streaming

### Social
- **Profil utilisateur** — Photo, localisation, statistiques (films vus, aimés, watchlist, reviews)
- **Système d'amis** — Recherche d'utilisateurs, envoi/acceptation/refus de demandes d'amitié
- **Système de follow** — Suis les utilisateurs qui t'intéressent
- **Feed social** — Publie des posts, commente, like, réponds (commentaires imbriqués)
- **Activité** — Suis l'activité récente de chaque utilisateur (likes, vues, notes, commentaires)

---

## Stack technique

### Backend
| Technologie | Usage |
|---|---|
| **Laravel 13** | Framework PHP (API REST) |
| **Laravel Sanctum** | Authentification par token |
| **MySQL** | Base de données relationnelle |
| **PHP 8.4** | Langage serveur |

### Frontend
| Technologie | Usage |
|---|---|
| **React 19** | Interface utilisateur |
| **Vite** | Build tool & serveur de développement |
| **Tailwind CSS 4** | Styles utilitaires |
| **React Router 7** | Navigation SPA |
| **Axios** | Requêtes HTTP |
| **React Toastify** | Notifications |

### APIs externes
| Service | Usage |
|---|---|
| **TMDB (The Movie Database)** | Données films, posters, casting, streaming |

### Base de données
| Service | Usage |
|---|---|
| **Aiven Cloud** | Hébergement MySQL distant |

---

## Prérequis

- **PHP** >= 8.3
- **Composer**
- **Node.js** >= 18
- **npm**
- **MySQL** (local ou distant)
- Une **clé API TMDB** (gratuite sur [themoviedb.org](https://www.themoviedb.org/settings/api))

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ton-user/iliked.git
cd iliked
```

### 2. Backend

```bash
cd backend
composer install
```

Copier le fichier d'environnement et le configurer :

```bash
cp .env.example .env
```

Remplir les variables dans `.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=iliked
DB_USERNAME=root
DB_PASSWORD=ton_mot_de_passe
```

Générer la clé et lancer les migrations :

```bash
php artisan key:generate
php artisan migrate
```

Lancer le serveur :

```bash
php artisan serve
```

Le backend tourne sur `http://localhost:8000`.

### 3. Frontend

```bash
cd frontend
npm install
```

Créer le fichier `.env` :

```env
VITE_TMDB_API_KEY=ta_cle_api_tmdb
VITE_TMDB_TOKEN=ton_bearer_token_tmdb
```

Lancer le serveur de développement :

```bash
npm run dev
```

Le frontend tourne sur `http://localhost:5173` avec un proxy automatique vers le backend.

---

## Structure du projet

```
iliked/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php        # Inscription, connexion, profil
│   │   │   ├── FilmController.php        # Like, watchlist, vu, commentaires
│   │   │   ├── PostController.php        # Posts sociaux & commentaires
│   │   │   ├── FollowController.php      # Système de follow
│   │   │   ├── FriendController.php      # Système d'amis
│   │   │   └── FeedController.php        # Feed d'activité
│   │   └── Models/
│   │       └── User.php
│   ├── database/migrations/              # 17 migrations
│   └── routes/api.php                    # Toutes les routes API
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Navigation + recherche live
│   │   │   ├── MovieRow.jsx              # Carrousel de films défilant
│   │   │   ├── PageLoader.jsx            # Écran de chargement
│   │   │   ├── Logo.jsx                  # Logo animé
│   │   │   └── MovieWall.jsx             # Fond de posters
│   │   ├── pages/
│   │   │   ├── Auth.jsx                  # Inscription / Connexion
│   │   │   ├── Setup.jsx                 # Configuration du profil
│   │   │   ├── Home.jsx                  # Accueil avec catégories
│   │   │   ├── Film.jsx                  # Fiche film détaillée
│   │   │   ├── Genre.jsx                 # Films par genre
│   │   │   ├── Category.jsx              # Films par catégorie
│   │   │   ├── Feed.jsx                  # Feed social
│   │   │   ├── Friends.jsx               # Recherche & gestion d'amis
│   │   │   ├── Profile.jsx               # Édition du profil
│   │   │   ├── PublicProfile.jsx          # Profil public
│   │   │   ├── RandomMovie.jsx           # Film aléatoire
│   │   │   └── Streaming.jsx             # Disponibilité streaming
│   │   ├── api.js                        # Instance Axios avec auth
│   │   └── App.jsx                       # Routes
│   └── vite.config.js                    # Proxy API
│
└── README.md
```

---

## API

Toutes les routes sont préfixées par `/api`.

### Authentification
| Méthode | Route | Description |
|---|---|---|
| POST | `/register` | Créer un compte |
| POST | `/login` | Se connecter |
| POST | `/logout` | Se déconnecter |
| GET | `/user` | Utilisateur connecté |
| GET | `/user/{username}` | Profil public |
| POST | `/user/setup` | Configurer le profil |
| DELETE | `/user` | Supprimer le compte |

### Films
| Méthode | Route | Description |
|---|---|---|
| GET | `/films/{tmdbId}/status` | Statut utilisateur sur un film |
| POST | `/films/{tmdbId}/like` | Liker / disliker |
| DELETE | `/films/{tmdbId}/like` | Retirer le like |
| POST | `/films/{tmdbId}/watchlist` | Ajouter à la watchlist |
| DELETE | `/films/{tmdbId}/watchlist` | Retirer de la watchlist |
| POST | `/films/{tmdbId}/watched` | Marquer comme vu (+ note) |
| DELETE | `/films/{tmdbId}/watched` | Retirer des films vus |
| GET | `/films/{tmdbId}/comments` | Commentaires d'un film |
| POST | `/films/{tmdbId}/comments` | Ajouter un commentaire |

### Social
| Méthode | Route | Description |
|---|---|---|
| GET | `/posts` | Tous les posts |
| POST | `/posts` | Créer un post |
| POST | `/posts/{id}/like` | Liker un post |
| POST | `/posts/{id}/comments` | Commenter un post |

### Amis
| Méthode | Route | Description |
|---|---|---|
| GET | `/friends` | Liste d'amis |
| GET | `/friends/search?q=` | Rechercher des utilisateurs |
| GET | `/friends/pending` | Demandes en attente |
| POST | `/friends/request/{id}` | Envoyer une demande |
| POST | `/friends/accept/{id}` | Accepter |
| POST | `/friends/reject/{id}` | Refuser |
| DELETE | `/friends/{id}` | Retirer un ami |

### Follow
| Méthode | Route | Description |
|---|---|---|
| POST | `/users/{id}/follow` | Suivre |
| DELETE | `/users/{id}/follow` | Ne plus suivre |
| GET | `/users/{id}/followers` | Liste des abonnés |
| GET | `/users/{id}/following` | Liste des abonnements |

---

## Base de données

25 tables dont les principales :

- **users** — Comptes utilisateurs
- **films** — Films référencés localement
- **likes** — Likes/dislikes sur les films
- **watchlist** — Films à voir
- **watched** — Films vus avec note
- **comments** — Commentaires sur les films
- **followers** — Relations de follow
- **friendships** — Relations d'amitié (pending/accepted/rejected)
- **posts** — Publications sociales
- **post_comments** — Commentaires sur les posts (avec réponses imbriquées)
- **post_likes** — Likes sur les posts

---

## Scripts utiles

```bash
# Backend
php artisan serve              # Lancer le serveur API
php artisan migrate            # Exécuter les migrations
php artisan migrate:fresh      # Réinitialiser la base
php artisan db:show --counts   # Voir les tables et leur contenu

# Frontend
npm run dev                    # Serveur de développement
npm run build                  # Build de production
npm run preview                # Prévisualiser le build
```

---

## Déploiement

### Base de données
La base MySQL peut être hébergée sur **Aiven Cloud** (ou tout service MySQL compatible). Configurer les variables `DB_*` dans le `.env` backend et ajouter le certificat SSL si nécessaire.

### Backend
Déployable sur tout hébergeur supportant PHP 8.3+ (Railway, Render, VPS, etc.).

### Frontend
```bash
cd frontend
npm run build
```
Le dossier `dist/` généré peut être déployé sur Vercel, Netlify, ou tout hébergeur statique. Configurer les variables d'environnement TMDB et l'URL de l'API backend.

---

## Auteur

**Moussa Montassar**

---

## Licence

Projet personnel — Tous droits réservés.
