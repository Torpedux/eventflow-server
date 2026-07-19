# EventFlow — Serveur (API)

API REST pour EventFlow, une application de gestion d'organisation d'événements (mariages, séminaires, anniversaires, conférences...). Permet de créer un événement, y ajouter des tâches avec suivi de statut, inviter des participants et leur assigner des tâches.

Ce dépôt contient uniquement le **serveur**. Le client associé se trouve dans le dépôt [eventflow-client](https://github.com/Torpedux/eventflow-client).

## Stack technique

- **Node.js** + **Express** — serveur HTTP et API REST
- **TypeScript** — typage statique
- **Prisma** (v6) — ORM et migrations
- **PostgreSQL** — base de données relationnelle
- **JWT** (`jsonwebtoken`) — authentification par token
- **bcrypt** — hachage des mots de passe
- **Zod** — validation des données entrantes

## Prérequis

- [Node.js](https://nodejs.org) v20 ou supérieur
- [PostgreSQL](https://www.postgresql.org/download/) v14 ou supérieur (installé en local, ou via Docker)
- npm

## Installation

1. **Cloner le dépôt et installer les dépendances**
```bash
   git clone https://github.com/Torpedux/eventflow-server.git
   cd eventflow-server
   npm install
```

2. **Créer la base de données PostgreSQL**

   Connecte-toi à PostgreSQL et crée une base nommée `eventflow` :
```bash
   psql -U postgres
```
```sql
   CREATE DATABASE eventflow;
   \q
```

3. **Configurer les variables d'environnement**

   Crée un fichier `.env` à la racine (copie `.env.example` si présent) :
```dotenv
   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/eventflow?schema=public"
   JWT_SECRET="votre_secret_jwt"
   PORT=4000
```

4. **Appliquer les migrations**
```bash
   npx prisma migrate dev
```
   Ça crée les 4 tables : `users`, `projects`, `project_participants`, `tasks`.

5. **Peupler la base avec des données de démo**
```bash
   npm run prisma:seed
```

6. **Lancer le serveur en mode développement**
```bash
   npm run dev
```
   Le serveur démarre sur `http://localhost:4000`.

## Comptes de démonstration

Créés automatiquement par le script de seed :

| Rôle | Email | Mot de passe |
|---|---|---|
| Organisateur (propriétaire) | `organisateur@eventflow.com` | `demo1234` |
| Participant | `marc@eventflow.com` | `demo1234` |

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur en mode développement (rechargement automatique) |
| `npm run build` | Compile le TypeScript vers `dist/` |
| `npm start` | Lance le serveur compilé (production) |
| `npm run prisma:migrate` | Applique les migrations Prisma |
| `npm run prisma:seed` | Peuple la base avec des données de démo |

## Structure du projet
src/
├── config/
│   └── prisma.ts              # Client Prisma singleton
├── middleware/
│   ├── auth.middleware.ts     # Vérification du JWT
│   └── error.middleware.ts    # Gestion centralisée des erreurs
├── utils/
│   ├── AppError.ts            # Classe d'erreur personnalisée
│   └── asyncHandler.ts        # Wrapper async pour les routes Express
├── modules/
│   ├── auth/                  # Inscription, connexion (FT1)
│   ├── projects/              # CRUD événements (FT2)
│   ├── tasks/                 # CRUD tâches, statuts, affectation (FT3, FT4, FT6)
│   └── participants/          # Gestion des participants (FT5)
├── app.ts                     # Configuration Express
└── index.ts                   # Point d'entrée

Chaque module suit le pattern **routes → controller → service** : les routes définissent les endpoints, les controllers valident les entrées (Zod) et formatent les réponses, les services contiennent la logique métier et les accès à la base de données via Prisma.

## Principales routes de l'API

Toutes les routes sous `/api/projects` nécessitent un header `Authorization: Bearer <token>`.

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Créer un compte |
| `POST` | `/api/auth/login` | Se connecter (retourne un JWT) |
| `GET` | `/api/projects` | Lister mes événements (owner + participant) |
| `POST` | `/api/projects` | Créer un événement |
| `GET/PUT/DELETE` | `/api/projects/:id` | Consulter, modifier, supprimer un événement |
| `GET/POST` | `/api/projects/:projectId/tasks` | Lister / créer une tâche (`?status=` pour filtrer) |
| `PUT/DELETE` | `/api/projects/:projectId/tasks/:taskId` | Modifier, supprimer une tâche |
| `PATCH` | `/api/projects/:projectId/tasks/:taskId/status` | Changer le statut d'une tâche |
| `PATCH` | `/api/projects/:projectId/tasks/:taskId/assign` | Assigner/désassigner une tâche (`userId` ou `null`) |
| `GET/POST` | `/api/projects/:projectId/participants` | Lister / ajouter un participant (par email) |
| `DELETE` | `/api/projects/:projectId/participants/:userId` | Retirer un participant |

## Gestion des erreurs

Toutes les erreurs métier passent par une classe `AppError(statusCode, message)`, interceptée par un middleware central qui renvoie un format JSON cohérent :
```json
{ "error": true, "message": "Description de l'erreur" }
```
Les erreurs de validation (Zod) et les erreurs inattendues sont également capturées et formatées de la même façon.