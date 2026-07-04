import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ description: "Nom de l'utilisateur", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Nom de famille de l'utilisateur",
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Mot de passe de l'utilisateur" })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: "Adresse de l'utilisateur", required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: "Numéro de téléphone de l'utilisateur",
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: "Statut de l'utilisateur",
    required: false,
    default: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: "Pseudo de l'utilisateur" })
  @IsString()
  @IsNotEmpty()
  pseudo: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    enum: Role,
    required: false,
    default: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class LoginUserDto {
  @ApiProperty({ description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Mot de passe de l'utilisateur" })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Nouveau mot de passe de l'utilisateur" })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ description: 'Token de réinitialisation de mot de passe' })
  @IsString()
  @IsNotEmpty()
  resetToken: string;
}
