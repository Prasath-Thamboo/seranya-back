# Utiliser une image de base officielle de Node.js
FROM node:18-alpine

# Installer le CLI NestJS globalement
RUN npm install -g @nestjs/cli

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
