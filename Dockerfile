# Image Node 18 (Debian, glibc) — pas besoin de libc6-compat (spécifique Alpine/musl)
FROM node:18

# Limiter la mémoire Node.js à 512 Mo (à ajuster selon tes besoins)
ENV NODE_OPTIONS="--max-old-space-size=512"

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier le fichier package.json et package-lock.json dans le répertoire de travail
COPY package*.json ./

# Installer toutes les dépendances (devDependencies incluses : nécessaires pour
# le CLI Prisma et la compilation TypeScript à l'étape suivante)
RUN npm install

# Copier le reste du code de l'application dans le répertoire de travail
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Compiler l'application en production
RUN npm run build

# Ne garder que les dépendances de production dans l'image finale
RUN npm prune --omit=dev

# Exposer le port que l'application va utiliser (Render/Lightsail redéfinissent
# PORT au besoin ; voir main.ts qui écoute sur process.env.PORT)
EXPOSE 5000

# Démarrer l'application en mode production
CMD ["npm", "run", "start:prod"]
