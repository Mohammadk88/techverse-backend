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
import { user_roles } from '@prisma/client';

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
      first_name,
      last_name,
      username,
      country_id,
      city_id,
      language_id,
    } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if username is taken
    const existingUsername = await this.prisma.users.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Validate language exists
    const language = await this.prisma.languages.findUnique({
      where: { id: language_id },
    });

    if (!language) {
      throw new BadRequestException('Invalid language selected');
    }

    // Validate country exists
    const country = await this.prisma.countries.findUnique({
      where: { id: country_id },
    });

    if (!country) {
      throw new BadRequestException('Invalid country selected');
    }

    // Validate city belongs to the selected country
    const city = await this.prisma.cities.findUnique({
      where: { id: city_id },
      include: { countries: true },
    });

    if (!city) {
      throw new BadRequestException('Invalid city selected');
    }

    if (city.country_id !== country_id) {
      throw new BadRequestException('Selected city does not belong to the selected country');
    }

    // Hash password
    const saltRounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get default MEMBER role
    const memberRole = await this.prisma.global_roles.findUnique({
      where: { name: 'MEMBER' },
    });

    if (!memberRole) {
      throw new BadRequestException('Default member role not found');
    }

    // Create user
    const user = await this.prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
        username,
        country_id,
        city_id,
        language_id,
        role: user_roles.MEMBER, // Default role (legacy enum)
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        xp: true,
        tech_coin: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        languages: {
          select: {
            id: true,
            name: true,
            native_name: true,
            code: true,
            direction: true,
          },
        },
        countries: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        cities: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Assign default global role
    await this.prisma.user_global_roles.create({
      data: {
        user_id: user.id,
        role_id: memberRole.id,
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
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        first_name: true,
        last_name: true,
        username: true,
        role: true,
        user_global_roles: {
          include: {
            global_roles: true,
          },
        },
        xp: true,
        is_active: true,
        languages: {
          select: {
            id: true,
            name: true,
            native_name: true,
            code: true,
            direction: true,
          },
        },
        countries: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        cities: {
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

    if (!user.is_active) {
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
      role:
        user.user_global_roles?.[0]?.global_roles?.name ||
        user.role ||
        'MEMBER',
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
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        user_global_roles: true,
        xp: true,
        is_active: true,
      },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async addXP(user_id: number, points: number) {
    return this.prisma.users.update({
      where: { id: user_id },
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
