import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAIKeyDto, UpdateAIKeyDto } from './dto/ai-key.dto';
import * as crypto from 'crypto';

@Injectable()
export class AIKeysService {
  constructor(private prisma: PrismaService) {}

  // Encryption functions
  private encrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(
      process.env.ENCRYPTION_KEY || 'default-32-byte-key-for-development',
      'utf8',
    ).slice(0, 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(encryptedData: string): string {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(
      process.env.ENCRYPTION_KEY || 'default-32-byte-key-for-development',
      'utf8',
    ).slice(0, 32);
    
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Get all AI providers
  async getProviders() {
    return this.prisma.aIProvider.findMany({
      where: { isActive: true },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  // Get user's API keys
  async getUserKeys(userId: number) {
    return this.prisma.aIKey.findMany({
      where: { userId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            label: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Create new API key for user
  async createUserKey(userId: number, createKeyDto: CreateAIKeyDto) {
    const { providerId, secretKey } = createKeyDto;

    // Check if provider exists and is active
    const provider = await this.prisma.aIProvider.findFirst({
      where: { id: providerId, isActive: true },
    });

    if (!provider) {
      throw new NotFoundException('AI provider not found or inactive');
    }

    // Check if user already has a key for this provider
    const existingKey = await this.prisma.aIKey.findFirst({
      where: { userId, providerId },
    });

    if (existingKey) {
      throw new ForbiddenException(
        `You already have an API key for ${provider.label}`,
      );
    }

    return this.prisma.aIKey.create({
      data: {
        userId,
        providerId,
        secretKey: this.encrypt(secretKey),
        isActive: true,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            label: true,
          },
        },
      },
    });
  }

  // Update user's API key
  async updateUserKey(
    userId: number,
    keyId: number,
    updateKeyDto: UpdateAIKeyDto,
  ) {
    const key = await this.prisma.aIKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    const updateData: any = {};
    
    if (updateKeyDto.secretKey) {
      updateData.secretKey = this.encrypt(updateKeyDto.secretKey);
    }
    
    if (updateKeyDto.isActive !== undefined) {
      updateData.isActive = updateKeyDto.isActive;
    }

    return this.prisma.aIKey.update({
      where: { id: keyId },
      data: updateData,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            label: true,
          },
        },
      },
    });
  }

  // Delete user's API key
  async deleteUserKey(userId: number, keyId: number) {
    const key = await this.prisma.aIKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.aIKey.delete({
      where: { id: keyId },
    });

    return { message: 'API key deleted successfully' };
  }

  // Get the best available API key for a provider (user key first, then system key)
  async getApiKeyForProvider(providerId: number, userId?: number): Promise<string | null> {
    let key: any = null;

    // Try to get user's key first if userId is provided
    if (userId) {
      key = await this.prisma.aIKey.findFirst({
        where: {
          userId,
          providerId,
          isActive: true,
        },
      });
    }

    // If no user key found, try to get system key
    if (!key) {
      key = await this.prisma.aIKey.findFirst({
        where: {
          userId: null,
          providerId,
          isActive: true,
        },
      });
    }

    return key ? this.decrypt(key.secretKey) : null;
  }

  // Admin: Get all system keys
  async getSystemKeys() {
    return this.prisma.aIKey.findMany({
      where: { userId: null },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            label: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Admin: Create system API key
  async createSystemKey(createKeyDto: CreateAIKeyDto) {
    const { providerId, secretKey } = createKeyDto;

    const provider = await this.prisma.aIProvider.findFirst({
      where: { id: providerId, isActive: true },
    });

    if (!provider) {
      throw new NotFoundException('AI provider not found or inactive');
    }

    // Check if system key already exists for this provider
    const existingKey = await this.prisma.aIKey.findFirst({
      where: { userId: null, providerId },
    });

    if (existingKey) {
      throw new ForbiddenException(
        `System API key for ${provider.label} already exists`,
      );
    }

    return this.prisma.aIKey.create({
      data: {
        providerId,
        secretKey: this.encrypt(secretKey),
        isActive: true,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            label: true,
          },
        },
      },
    });
  }

  // Admin: Update system API key
  async updateSystemKey(keyId: number, updateKeyDto: UpdateAIKeyDto) {
    const key = await this.prisma.aIKey.findFirst({
      where: { id: keyId, userId: null },
    });

    if (!key) {
      throw new NotFoundException('System API key not found');
    }

    const updateData: any = {};
    
    if (updateKeyDto.secretKey) {
      updateData.secretKey = this.encrypt(updateKeyDto.secretKey);
    }
    
    if (updateKeyDto.isActive !== undefined) {
      updateData.isActive = updateKeyDto.isActive;
    }

    return this.prisma.aIKey.update({
      where: { id: keyId },
      data: updateData,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            label: true,
          },
        },
      },
    });
  }

  // Admin: Delete system API key
  async deleteSystemKey(keyId: number) {
    const key = await this.prisma.aIKey.findFirst({
      where: { id: keyId, userId: null },
    });

    if (!key) {
      throw new NotFoundException('System API key not found');
    }

    await this.prisma.aIKey.delete({
      where: { id: keyId },
    });

    return { message: 'System API key deleted successfully' };
  }
}
