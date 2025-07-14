import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { UserRole } from '../common/decorators/roles.decorator';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const {
      email,
      password,
      firstName,
      lastName,
      username,
      countryId,
      cityId,
      languageId,
    } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if username is taken
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Validate language exists
    const language = await this.prisma.language.findUnique({
      where: { id: languageId },
    });

    if (!language) {
      throw new BadRequestException('Invalid language selected');
    }

    // Validate country exists
    const country = await this.prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      throw new BadRequestException('Invalid country selected');
    }

    // Validate city belongs to the selected country
    const city = await this.prisma.city.findUnique({
      where: { id: cityId },
      include: { country: true },
    });

    if (!city) {
      throw new BadRequestException('Invalid city selected');
    }

    if (city.countryId !== countryId) {
      throw new BadRequestException('Selected city does not belong to the selected country');
    }

    // Hash password
    const saltRounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get default MEMBER role
    const memberRole = await this.prisma.globalRole.findUnique({
      where: { name: 'MEMBER' },
    });

    if (!memberRole) {
      throw new BadRequestException('Default member role not found');
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        countryId,
        cityId,
        languageId,
        role: UserRole.MEMBER, // Default role (legacy enum)
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        xp: true,
        language: {
          select: {
            id: true,
            name: true,
            nativeName: true,
            code: true,
            direction: true,
          },
        },
        country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Assign default global role
    await this.prisma.userGlobalRole.create({
      data: {
        userId: user.id,
        roleId: memberRole.id,
      },
    });

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        xp: true,
        isActive: true,
        language: {
          select: {
            id: true,
            name: true,
            nativeName: true,
            code: true,
            direction: true,
          },
        },
        country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async validateUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        xp: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async addXP(userId: number, points: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: points,
        },
      },
      select: {
        id: true,
        xp: true,
      },
    });
  }
}
