# Utiliser Node 18 Alpine
FROM node:18

# Installer la compatibilité C pour Alpine (utilisé par certains paquets natifs, ex. bcrypt)
RUN apk add --no-cache libc6-compat

# Installer le CLI NestJS globalement
RUN npm install -g @nestjs/cli

# Limiter la mémoire Node.js à 512 Mo (à ajuster selon tes besoins)
ENV NODE_OPTIONS="--max-old-space-size=512"

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier le fichier package.json et package-lock.json dans le répertoire de travail
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm install --only=production

# Copier le reste du code de l'application dans le répertoire de travail
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Compiler l'application en production
RUN npm run build

# Exposer le port que l'application va utiliser
EXPOSE 5000

# Démarrer l'application en mode production
CMD ["npm", "run", "start:prod"]
