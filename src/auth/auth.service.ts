import {
  Injectable,
  UnauthorizedException,
  ConflictException,
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

// Champs jamais renvoyés au client : hash du mot de passe et tous les tokens.
const SAFE_USER_SELECT = {
  id: true,
  name: true,
  lastName: true,
  address: true,
  email: true,
  phone: true,
  status: true,
  pseudo: true,
  role: true,
  profileImage: true,
  createdAt: true,
  updatedAt: true,
  isSubscribed: true,
  stripeSubscriptionId: true,
} as const;

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

    const confirmationToken = uuidv4();
    const confirmationTokenExpiry = new Date();
    confirmationTokenExpiry.setHours(confirmationTokenExpiry.getHours() + 24); // valide 24h

    const userData: Prisma.UserCreateInput = {
      email: registerUserDto.email,
      password: hashedPassword,
      pseudo: registerUserDto.pseudo,
      // Le rôle n'est jamais lu depuis la requête client : l'auto-inscription
      // publique ne doit produire que des comptes USER. Les comptes EDITOR/ADMIN
      // sont créés exclusivement via POST /users (réservé aux ADMIN).
      role: 'USER',
      status: 'en_attente',
      confirmationToken,
      confirmationTokenExpiry,
    };

    let user;
    try {
      user = await this.prisma.user.create({ data: userData, select: SAFE_USER_SELECT });
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] ?? 'email';
        Logger.warn(
          `Tentative d'inscription refusée (${field} déjà utilisé): ${registerUserDto.email}`,
        );
        throw new ConflictException(
          field === 'pseudo'
            ? 'Ce pseudo est déjà utilisé.'
            : 'Un compte existe déjà avec cet email.',
        );
      }
      throw error;
    }

    // L'envoi de l'email est isolé de la création du compte : une panne du
    // fournisseur mail (ex. Resend sans domaine vérifié) ne doit pas faire
    // échouer l'inscription alors que le compte existe déjà en base.
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const confirmationUrl = `${baseUrl}/auth/confirm?token=${confirmationToken}`;
    let emailSent = true;
    try {
      await this.mailerService.sendConfirmationEmail(user.email, confirmationUrl);
      Logger.log(`Utilisateur créé, email de confirmation envoyé à: ${user.email}`);
    } catch (error) {
      emailSent = false;
      Logger.error(
        `Utilisateur ${user.email} créé mais l'envoi de l'email de confirmation a échoué: ${error.message}`,
      );
    }

    return {
      message: emailSent
        ? 'Inscription réussie. Un email de confirmation a été envoyé.'
        : "Inscription réussie, mais l'email de confirmation n'a pas pu être envoyé. Contactez le support pour activer votre compte.",
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
      select: SAFE_USER_SELECT,
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
        select: SAFE_USER_SELECT,
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
  async generateResetToken(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Ne pas révéler si l'email est enregistré ou non (anti-énumération de comptes).
      Logger.warn(`Demande de réinitialisation pour un email inconnu: ${email}`);
      return;
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 15); // Token valide 15 minutes

    await this.prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/resetPassword?token=${resetToken}`;

    // Utilisation du template d'email avec lien de réinitialisation
    await this.mailerService.sendMail(
      user.email,
      'Réinitialisation de votre mot de passe',
      `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetUrl}`,
      passwordResetTemplate(resetUrl), // Utilisation du template HTML
    );
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
      select: SAFE_USER_SELECT,
    });
  }

  // Suppression du compte de l'utilisateur authentifié (jamais d'un autre compte).
  async deleteAccount(userId: number) {
    const user = await this.prisma.user.delete({
      where: { id: userId },
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
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
