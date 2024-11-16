// src/auth/auth.types.ts
import { User } from '@prisma/client'; // ou importez votre modèle d'utilisateur Prisma

export interface RequestWithUser extends Request {
  user: User & { id: number }; // Assurez-vous que l'ID est inclus ici
}
