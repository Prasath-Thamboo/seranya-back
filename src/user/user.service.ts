import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, ResetPasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '../mailer/mailer.service';
import { FileService } from '../files/file.service';

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
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
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
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async generateResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) throw new Error('User not found');

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    await this.prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

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
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid token or email');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
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
