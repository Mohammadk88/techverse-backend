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
    return this.prisma.ai_providers.findMany({
      where: { is_active: true },
      orderBy: [
        { is_default: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  // Get user's API keys
  async getUserKeys(user_id: number) {
    return this.prisma.ai_keys.findMany({
      where: { user_id },
      include: {
        ai_providers: {
          select: {
            id: true,
            name: true,
            label: true,
            is_active: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Create new API key for user
  async createUserKey(user_id: number, createKeyDto: CreateAIKeyDto) {
    const { provider_id, secret_key } = createKeyDto;

    // Check if provider exists and is active
    const provider = await this.prisma.ai_providers.findFirst({
      where: { id: provider_id, is_active: true },
    });

    if (!provider) {
      throw new NotFoundException('AI provider not found or inactive');
    }

    // Check if user already has a key for this provider
    const existingKey = await this.prisma.ai_keys.findFirst({
      where: { user_id, provider_id },
    });

    if (existingKey) {
      throw new ForbiddenException(
        `You already have an API key for ${provider.label}`,
      );
    }

    return this.prisma.ai_keys.create({
      data: {
        user_id,
        provider_id,
        secret_key: this.encrypt(secret_key),
        is_active: true,
        updated_at: new Date(),
      },
      include: {
        ai_providers: {
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
    user_id: number,
    keyId: number,
    updateKeyDto: UpdateAIKeyDto,
  ) {
    const key = await this.prisma.ai_keys.findFirst({
      where: { id: keyId, user_id },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    const updateData: any = {};
    
    if (updateKeyDto.secret_key) {
      updateData.secret_key = this.encrypt(updateKeyDto.secret_key);
    }
    
    if (updateKeyDto.is_active !== undefined) {
      updateData.is_active = updateKeyDto.is_active;
    }

    return this.prisma.ai_keys.update({
      where: { id: keyId },
      data: updateData,
      include: {
        ai_providers: {
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
  async deleteUserKey(user_id: number, keyId: number) {
    const key = await this.prisma.ai_keys.findFirst({
      where: { id: keyId, user_id },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.ai_keys.delete({
      where: { id: keyId },
    });

    return { message: 'API key deleted successfully' };
  }

  // Get the best available API key for a provider (user key first, then system key)
  async getApiKeyForProvider(provider_id: number, user_id?: number): Promise<string | null> {
    let key: any = null;

    // Try to get user's key first if user_id is provided
    if (user_id) {
      key = await this.prisma.ai_keys.findFirst({
        where: {
          user_id,
          provider_id,
          is_active: true,
        },
      });
    }

    // If no user key found, try to get system key
    if (!key) {
      key = await this.prisma.ai_keys.findFirst({
        where: {
          user_id: null,
          provider_id,
          is_active: true,
        },
      });
    }

    return key ? this.decrypt(key.secret_key) : null;
  }

  // Admin: Get all system keys
  async getSystemKeys() {
    return this.prisma.ai_keys.findMany({
      where: { user_id: null },
      include: {
        ai_providers: {
          select: {
            id: true,
            name: true,
            label: true,
            is_active: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Admin: Create system API key
  async createSystemKey(createKeyDto: CreateAIKeyDto) {
    const { provider_id, secret_key } = createKeyDto;

    const provider = await this.prisma.ai_providers.findFirst({
      where: { id: provider_id, is_active: true },
    });

    if (!provider) {
      throw new NotFoundException('AI provider not found or inactive');
    }

    // Check if system key already exists for this provider
    const existingKey = await this.prisma.ai_keys.findFirst({
      where: { user_id: null, provider_id },
    });

    if (existingKey) {
      throw new ForbiddenException(
        `System API key for ${provider.label} already exists`,
      );
    }

    return this.prisma.ai_keys.create({
      data: {
        provider_id,
        secret_key: this.encrypt(secret_key),
        is_active: true,
        updated_at: new Date(),
      },
      include: {
        ai_providers: {
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
    const key = await this.prisma.ai_keys.findFirst({
      where: { id: keyId, user_id: null },
    });

    if (!key) {
      throw new NotFoundException('System API key not found');
    }

    const updateData: any = {};
    
    if (updateKeyDto.secret_key) {
      updateData.secret_key = this.encrypt(updateKeyDto.secret_key);
    }
    
    if (updateKeyDto.is_active !== undefined) {
      updateData.is_active = updateKeyDto.is_active;
    }

    return this.prisma.ai_keys.update({
      where: { id: keyId },
      data: updateData,
      include: {
        ai_providers: {
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
    const key = await this.prisma.ai_keys.findFirst({
      where: { id: keyId, user_id: null },
    });

    if (!key) {
      throw new NotFoundException('System API key not found');
    }

    await this.prisma.ai_keys.delete({
      where: { id: keyId },
    });

    return { message: 'System API key deleted successfully' };
  }
}
