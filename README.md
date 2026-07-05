# Seranya — Backend

API NestJS de Seranya, plateforme de yoga/méditation à univers fantastique. Gère l'authentification, le contenu (univers, unités, classes, tutoriels, articles), les commentaires, les uploads, les abonnements Stripe et l'envoi d'emails.

## Stack

- [NestJS](https://nestjs.com/) 10 (Express)
- [Prisma](https://www.prisma.io/) + PostgreSQL
- Auth JWT (`@nestjs/passport`, `passport-jwt`)
- [Cloudinary](https://cloudinary.com/) pour le stockage des médias
- [Stripe](https://stripe.com/) pour les abonnements/paiements
- [Resend](https://resend.com/) + Nodemailer pour les emails transactionnels
- Swagger (`/api`) pour la documentation de l'API
- Helmet, throttler (rate limiting), class-validator pour la sécurité et la validation

## Prérequis

- Node.js 20+
- Une base PostgreSQL accessible

## Installation

```bash
npm install
```

Copier `.env.example` en `.env` et renseigner les variables :

| Variable | Description |
|---|---|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL |
| `JWT_SECRET`, `JWT_EXPIRATION_TIME` | Secret et durée de vie des tokens JWT |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Identifiants Cloudinary (upload d'images) |
| `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL_TO`, `DPO_EMAIL_TO` | Envoi d'emails (contact, RGPD) |
| `FRONTEND_URL`, `BACKEND_DEV_URL`, `BACKEND_PROD_URL` | URLs utilisées pour le CORS et les liens dans les emails |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Paiements et abonnements Stripe |

Puis générer le client Prisma et appliquer les migrations :

```bash
npx prisma generate
npx prisma migrate dev
```

## Lancer le projet

```bash
# développement (watch mode)
npm run start:dev

# production
npm run build
npm run start:prod
```

L'API démarre par défaut sur `http://localhost:5000`. La documentation Swagger est disponible sur `/api`.

## Tests

```bash
npm run test        # tests unitaires
npm run test:e2e    # tests end-to-end
npm run test:cov    # couverture
```

## Structure

```
src/
├── auth/        # login, JWT, guards (rôles), stratégie passport
├── user/        # gestion des utilisateurs
├── unit/        # unités de l'univers Seranya
├── class/       # classes rattachées aux unités
├── tutorial/    # tutoriels
├── post/        # articles/actualités
├── comment/     # commentaires
├── definition/  # entrées d'encyclopédie
├── files/       # upload de fichiers (Cloudinary)
├── payments/    # abonnements et paiements Stripe
├── mailer/      # envoi d'emails (contact, RGPD, notifications)
├── prisma/      # module Prisma (accès BDD)
├── filters/     # filtres d'exception globaux
└── main.ts      # bootstrap (Helmet, CORS, Swagger, pipes globaux)
```

## Déploiement (Render)

Le backend est packagé en Docker (`Dockerfile`) et déployé sur [Render](https://render.com/) via le blueprint `render.yaml`. **En production :** `https://seranya-back.onrender.com`.

1. Sur Render : **New → Blueprint**, connecter le repo GitHub `seranya-back`. Render détecte `render.yaml` et propose de créer le service `seranya-back` (runtime Docker, plan gratuit, health check sur `/health`).
2. Renseigner dans le dashboard les variables marquées `sync: false` dans `render.yaml` (secrets non versionnés) : `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION_TIME`, `CLOUDINARY_*`, `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL_TO`, `DPO_EMAIL_TO`, `FRONTEND_URL` (origine exacte du frontend Vercel, **sans slash final** — sinon le CORS de `main.ts` rejette toutes les requêtes), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. `PORT` est fourni automatiquement par Render (l'app écoute sur `process.env.PORT`, voir `main.ts`) — ne pas le définir manuellement.
3. Chaque `git push` sur la branche par défaut déclenche un nouveau build + déploiement automatique.
4. Le plan gratuit met le service en veille après ~15 min d'inactivité (redémarrage à froid ~30-50s sur la requête suivante) ; passer au plan payant dans le dashboard quand une disponibilité constante est nécessaire — aucun changement de code requis.

L'ancien déploiement Lightsail est abandonné ; `.github/workflows/deploy.yml` est obsolète et peut être supprimé.

## Supervision / monitoring

- `GET /health` : endpoint public de vérification de disponibilité. Renvoie `200 { status: 'ok', timestamp }` si l'API et la connexion à la base de données (Prisma) répondent, `503` sinon.
- Un workflow GitHub Actions (`.github/workflows/uptime-monitor.yml`) interroge `https://seranya-back.onrender.com/health` toutes les 15 minutes (`schedule` + déclenchement manuel via `workflow_dispatch`, timeout 60s pour absorber un cold start du plan gratuit) et fait échouer le job en cas d'indisponibilité, ce qui déclenche la notification par email de GitHub sur l'exécution planifiée en échec.
  - Variable de repo optionnelle `BACKEND_HEALTH_URL` : pour surveiller une autre URL que celle par défaut.
  - Variable de repo optionnelle `FRONTEND_URL` : si renseignée, le workflow vérifie aussi la disponibilité du frontend.
  - À configurer dans *Settings → Secrets and variables → Actions → Variables* du repo GitHub.

## Sécurité

- Helmet est activé, à l'exception de la CSP (`contentSecurityPolicy: false` dans `main.ts`) car une CSP stricte casse les assets inline de Swagger UI sur `/api`. Les autres en-têtes (HSTS, X-Frame-Options, X-Content-Type-Options...) restent actifs.
- Rate limiting via `@nestjs/throttler`.
- Validation des entrées via `class-validator`/`class-transformer` sur tous les DTO.
- Rôles utilisateurs (`role.guard.ts`, `roles.decorator.ts`) pour restreindre les routes d'administration.

## Licence

Projet privé (`UNLICENSED`).
