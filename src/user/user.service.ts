import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '../mailer/mailer.service';
import { FileService } from '../files/file.service';

// Champs jamais renvoyés au client : hash du mot de passe et tous les tokens
// (reset password, confirmation email, changement d'email).
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
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly fileService: FileService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password: hashedPassword },
      select: SAFE_USER_SELECT,
    });

    await this.mailerService.sendMail(
      user.email,
      'Bienvenue sur notre plateforme',
      `Bonjour ${user.name}, bienvenue sur notre plateforme !`,
    );

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({ select: SAFE_USER_SELECT });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id }, select: SAFE_USER_SELECT });
  }

  async isPseudoAvailable(pseudo: string, currentUserId: number): Promise<{ available: boolean }> {
    const existing = await this.prisma.user.findFirst({
      where: {
        pseudo: { equals: pseudo, mode: 'insensitive' },
        NOT: { id: currentUserId },
      },
    });
    return { available: !existing };
  }

  validatePseudoFormat(pseudo: string): { valid: boolean; reason?: string } {
    if (pseudo.length < 3)  return { valid: false, reason: 'Minimum 3 caractères.' };
    if (pseudo.length > 20) return { valid: false, reason: 'Maximum 20 caractères.' };
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(pseudo) && pseudo.length > 1) {
      return { valid: false, reason: 'Commence et finit par une lettre ou un chiffre. Seuls _ et - sont autorisés au milieu.' };
    }
    if (/__|--/.test(pseudo)) return { valid: false, reason: 'Pas de caractères spéciaux consécutifs.' };

    const normalized = pseudo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const blocked = [
      'connard','connasse','salope','pute','putain','enculé','encule','batard','bâtard',
      'fdp','niquer','nique','pedé','pede','pedale','pedalo','fiotte','tapette','gouine',
      'sexe','porno','porn','bite','couille','chatte','penis','hitler','nazi','negre',
      'fuck','shit','bitch','whore','slut','nigger','faggot','cunt','asshole',
    ];
    const found = blocked.find((w) => normalized.includes(w.normalize('NFD').replace(/[̀-ͯ]/g, '')));
    if (found) return { valid: false, reason: 'Ce pseudo contient un terme non autorisé.' };

    return { valid: true };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    profileImage?: Express.Multer.File,
  ) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    let profileImageUrl: string | undefined;

    if (profileImage) {
      profileImageUrl = await this.fileService.uploadProfileImage(profileImage, id);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        ...(profileImageUrl && { profileImage: profileImageUrl }),
      },
      select: SAFE_USER_SELECT,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id }, select: SAFE_USER_SELECT });
  }

  async requestEmailChange(userId: number, newEmail: string): Promise<void> {
    const current = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!current) throw new Error('User not found');

    if (newEmail === current.email) {
      throw new BadRequestException('C\'est déjà votre adresse email actuelle.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé.');

    const emailChangeToken = uuidv4();
    const emailChangeTokenExpiry = new Date();
    emailChangeTokenExpiry.setHours(emailChangeTokenExpiry.getHours() + 1); // valide 1h

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const confirmUrl = `${baseUrl}/auth/confirmEmailChange?token=${emailChangeToken}`;

    // On envoie d'abord l'email : si l'envoi échoue, on ne veut pas laisser le
    // compte dans un état "changement en attente" que l'utilisateur n'a aucun
    // moyen de confirmer.
    await this.mailerService.sendEmailChangeConfirmation(newEmail, confirmUrl);

    await this.prisma.user.update({
      where: { id: userId },
      data: { pendingEmail: newEmail, emailChangeToken, emailChangeTokenExpiry },
    });
  }

  async confirmEmailChange(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailChangeToken: token,
        emailChangeTokenExpiry: { gte: new Date() },
      },
    });

    if (!user || !user.pendingEmail) {
      throw new UnauthorizedException('Token invalide ou expiré.');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeTokenExpiry: null,
      },
      select: SAFE_USER_SELECT,
    });
  }

  async send(to: string, subject: string, text: string) {
    try {
      await this.mailerService.sendMail(to, subject, text);
      Logger.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
      Logger.error('Error sending email:', error.stack);
      throw new Error('Failed to send email');
    }
  }
}
