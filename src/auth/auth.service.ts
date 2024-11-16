import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import {
  RegisterUserDto,
  LoginUserDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { passwordResetTemplate } from 'src/mailer/templates/passwordResetTemplate';

@Injectable()
export class AuthService {
  // Liste des tokens révoqués (pour l'exemple)
  private revokedTokens: Set<string> = new Set();

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  // Enregistrement d'un utilisateur
  async register(registerUserDto: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    const userData: Prisma.UserCreateInput = {
      email: registerUserDto.email,
      password: hashedPassword,
      pseudo: registerUserDto.pseudo,
      role: registerUserDto.role || 'USER',
      status: 'verifie', // Définit le statut à "verifie" automatiquement
    };

    const user = await this.prisma.user.create({ data: userData });

    Logger.log(`Utilisateur créé et vérifié automatiquement: ${user.email}`);

    return {
      message: 'Inscription réussie. Utilisateur vérifié automatiquement.',
      user,
    };
  }

  // Confirmation de l'email via le token// Confirmation de l'email via le token
  async confirmEmail(token: string) {
    Logger.debug(`Début de la confirmation de l'email avec le token: ${token}`);

    // Étape 1: Vérifier si le token existe et n'est pas expiré
    const user = await this.prisma.user.findFirst({
      where: {
        confirmationToken: token,
        confirmationTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      Logger.error(`Aucun utilisateur trouvé avec le token ${token}`);
      throw new UnauthorizedException('Token invalide ou expiré.');
    }

    Logger.debug(
      `Utilisateur trouvé avec email: ${user.email}, ID: ${user.id}, statut actuel: ${user.status}`,
    );

    // Étape 2: Vérifier si l'utilisateur est déjà vérifié
    if (user.status === 'verifie') {
      Logger.warn(`L'utilisateur ${user.email} est déjà vérifié.`);
      return {
        message: "L'utilisateur est déjà vérifié.",
        user,
      };
    }

    // Étape 3: Mettre à jour le statut de l'utilisateur
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'verifie',
          confirmationToken: null, // Supprime le token de confirmation
          confirmationTokenExpiry: null, // Supprime la date d'expiration
        },
      });

      Logger.debug(
        `Le statut de l'utilisateur ${updatedUser.email} a été mis à jour avec succès.`,
      );

      return {
        message: 'Confirmation réussie. Votre email a été vérifié avec succès.',
        user: updatedUser,
      };
    } catch (error) {
      Logger.error(
        `Erreur lors de la mise à jour du statut de l'utilisateur avec ID ${user.id}: ${error.message}`,
      );
      throw new Error(
        "Une erreur est survenue lors de la mise à jour du statut de l'utilisateur.",
      );
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (
      !user ||
      !(await bcrypt.compare(loginUserDto.password, user.password))
    ) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // Ajoute ici les statuts autorisés (ex: "active", "verifie")
    if (user.status !== 'verifie' && user.status !== 'active') {
      throw new UnauthorizedException(
        'Votre email doit être vérifié pour vous connecter.',
      );
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });

    return accessToken;
  }

  // Déconnexion utilisateur
  async logout(token: string) {
    // Ajouter le token à la liste des tokens révoqués
    this.revokedTokens.add(token);
    return { message: 'Logout successful' };
  }

  // Vérification de token révoqué (optionnel)
  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  // Générer un token de réinitialisation de mot de passe
  async generateResetToken(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(
        'If this email is registered, a reset link will be sent.',
      );
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 15); // Token valide 15 minutes

    await this.prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // Choisir l'URL en fonction de l'environnement (production ou développement)
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://www.spectralunivers.com'
        : 'http://localhost:3000';

    const resetUrl = `${baseUrl}/auth/resetPassword?token=${resetToken}`;

    // Utilisation du template d'email avec lien de réinitialisation
    await this.mailerService.sendMail(
      user.email,
      'Réinitialisation de votre mot de passe',
      `Votre token de réinitialisation de mot de passe est : ${resetToken}.`,
      passwordResetTemplate(resetUrl), // Utilisation du template HTML
    );

    return resetToken;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { newPassword, resetToken } = resetPasswordDto;

    // Chercher l'utilisateur correspondant au token et vérifier son expiration
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: { gte: new Date() }, // Vérifier que le token n'a pas expiré
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token or token expired');
    }

    // Hashage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour l'utilisateur avec le nouveau mot de passe et supprimer le token
    return this.prisma.user.update({
      where: { id: user.id }, // Utiliser l'ID de l'utilisateur
      data: {
        password: hashedPassword,
        resetToken: null, // Effacer le token après l'utilisation
        resetTokenExpiry: null, // Effacer l'expiration du token
      },
    });
  }

  // Suppression de compte utilisateur
  async deleteAccount(email: string) {
    const user = await this.prisma.user.delete({
      where: { email },
    });

    await this.mailerService.sendMail(
      user.email,
      'Compte supprimé',
      `Votre compte a été supprimé avec succès.`,
    );

    return { message: 'Account deleted successfully' };
  }

  async getUser(userId: number) {
    if (!userId) {
      throw new Error('User ID is undefined or null');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        pseudo: true,
        role: true,
        name: true,
        lastName: true,
        address: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        isSubscribed: true, // Ajout de isSubscribed
        stripeSubscriptionId: true, // Ajout de stripeSubscriptionId
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Construction du chemin de l'image de profil
    const profileImagePath = `/uploads/users/${user.id}/ProfileImage.png`;

    return {
      ...user,
      profileImage: profileImagePath, // Ajoute le chemin de l'image de profil
    };
  }
}
