import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterUserDto {
  @ApiProperty({ description: "Nom de l'utilisateur", required: false })
  name?: string;

  @ApiProperty({
    description: "Nom de famille de l'utilisateur",
    required: false,
  })
  lastName?: string;

  @ApiProperty({ description: "Email de l'utilisateur" })
  email: string;

  @ApiProperty({ description: "Mot de passe de l'utilisateur" })
  password: string;

  @ApiProperty({ description: "Adresse de l'utilisateur", required: false })
  address?: string;

  @ApiProperty({
    description: "Numéro de téléphone de l'utilisateur",
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: "Statut de l'utilisateur",
    required: false,
    default: 'active',
  })
  status?: string;

  @ApiProperty({ description: "Pseudo de l'utilisateur" })
  pseudo: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    enum: Role,
    required: false,
    default: Role.USER,
  })
  role?: Role;
}

export class LoginUserDto {
  @ApiProperty({ description: "Email de l'utilisateur" })
  email: string;

  @ApiProperty({ description: "Mot de passe de l'utilisateur" })
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: "Email de l'utilisateur" })
  email: string;

  @ApiProperty({ description: "Nouveau mot de passe de l'utilisateur" })
  newPassword: string;

  @ApiProperty({ description: 'Token de réinitialisation de mot de passe' })
  resetToken: string;
}
