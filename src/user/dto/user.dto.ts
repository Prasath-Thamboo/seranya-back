import {
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'src/enums/role.enum';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @ApiProperty({ description: 'Address of the user' })
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number of the user' })
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Status of the user' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Pseudo of the user' })
  @IsString()
  @IsNotEmpty()
  pseudo: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Role of the user', enum: Role })
  @IsEnum(Role)
  role: Role;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'First name of the user' })
  name?: string;

  @ApiPropertyOptional({ description: 'Last name of the user' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Address of the user' })
  address?: string;

  @ApiPropertyOptional({ description: 'Email of the user' })
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number of the user' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Status of the user' })
  status?: string;

  @ApiPropertyOptional({ description: 'Pseudo of the user' })
  pseudo?: string;

  @ApiPropertyOptional({ description: 'Password of the user' })
  password?: string;

  @ApiPropertyOptional({ description: 'Role of the user', enum: Role })
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Profile image of the user',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  profileImage?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Email of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'New password of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ description: 'Password reset token' })
  @IsString()
  @IsNotEmpty()
  resetToken: string;
}

// PARTIAL TYPE pour changements non obligatoires pour certains champs dans l'update
