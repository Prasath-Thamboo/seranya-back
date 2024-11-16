import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, ResetPasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '../mailer/mailer.service';
import * as fs from 'fs';
import * as path from 'path';
import { extname } from 'path';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    await this.mailerService.sendMail(
      user.email,
      'Bienvenue sur notre plateforme',
      `Bonjour ${user.name}, bienvenue sur notre plateforme !`,
    );

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    profileImage?: Express.Multer.File,
  ) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (profileImage) {
      const userFolder = this.createUserFolder(id);
      const profileImagePath = path.join(
        userFolder,
        `ProfileImage${extname(profileImage.originalname)}`,
      );

      await this.replaceExistingImage(userFolder); // Supprimer l'image existante

      // Vérifiez si le chemin du fichier est défini avant de le déplacer
      if (profileImage.path) {
        this.moveFile(profileImage, profileImagePath);
      } else {
        throw new Error('Le chemin du fichier téléchargé est invalide.');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  private async replaceExistingImage(userFolder: string) {
    if (fs.existsSync(userFolder)) {
      const profileImage = fs
        .readdirSync(userFolder)
        .find((file) => file.startsWith('ProfileImage'));

      if (profileImage) {
        try {
          fs.unlinkSync(path.join(userFolder, profileImage)); // Supprime l'ancienne image de profil
        } catch (error) {
          Logger.warn(
            `Impossible de supprimer l'image existante pour l'utilisateur dans le dossier ${userFolder}.`,
          );
        }
      }
    }
  }

  private moveFile(file: Express.Multer.File, destination: string) {
    fs.renameSync(file.path, destination);
  }

  private createUserFolder(userId: number) {
    const userFolder = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'users',
      `${userId}`,
    );
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    return userFolder;
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async generateResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valable 1 heure

    await this.prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // Envoyer un email avec le token de réinitialisation
    await this.mailerService.sendMail(
      user.email,
      'Réinitialisation du mot de passe',
      `Voici votre token de réinitialisation de mot de passe : ${resetToken}`,
    );

    return resetToken;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword, resetToken } = resetPasswordDto;
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        resetToken,
        resetTokenExpiry: {
          gte: new Date(), // Vérifie si le token est encore valide
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token or email');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  // Utilisation du MailerService pour envoyer un email simple
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
