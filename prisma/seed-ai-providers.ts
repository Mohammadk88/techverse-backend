import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function seedAIProviders() {
  console.log('🤖 Seeding AI Providers...');

  // Create AI providers
  const openaiProvider = await prisma.aIProvider.upsert({
    where: { name: 'openai' },
    update: {},
    create: {
      name: 'openai',
      label: 'OpenAI',
      isActive: true,
      isDefault: true,
    },
  });

  const geminiProvider = await prisma.aIProvider.upsert({
    where: { name: 'gemini' },
    update: {},
    create: {
      name: 'gemini',
      label: 'Google Gemini',
      isActive: true,
      isDefault: false,
    },
  });

  const claudeProvider = await prisma.aIProvider.upsert({
    where: { name: 'claude' },
    update: {},
    create: {
      name: 'claude',
      label: 'Anthropic Claude',
      isActive: true,
      isDefault: false,
    },
  });

  console.log('Created AI Providers:', {
    openai: openaiProvider.id,
    gemini: geminiProvider.id,
    claude: claudeProvider.id,
  });

  // Add system-level API keys if environment variables exist
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const claudeKey = process.env.CLAUDE_API_KEY;

  if (openaiKey) {
    const existingKey = await prisma.aIKey.findFirst({
      where: {
        userId: null,
        providerId: openaiProvider.id,
      },
    });

    if (!existingKey) {
      await prisma.aIKey.create({
        data: {
          providerId: openaiProvider.id,
          secretKey: encrypt(openaiKey),
          isActive: true,
        },
      });
      console.log('✅ Added system OpenAI key');
    } else {
      console.log('ℹ️ System OpenAI key already exists');
    }
  }

  if (geminiKey) {
    const existingKey = await prisma.aIKey.findFirst({
      where: {
        userId: null,
        providerId: geminiProvider.id,
      },
    });

    if (!existingKey) {
      await prisma.aIKey.create({
        data: {
          providerId: geminiProvider.id,
          secretKey: encrypt(geminiKey),
          isActive: true,
        },
      });
      console.log('✅ Added system Gemini key');
    } else {
      console.log('ℹ️ System Gemini key already exists');
    }
  }

  if (claudeKey) {
    const existingKey = await prisma.aIKey.findFirst({
      where: {
        userId: null,
        providerId: claudeProvider.id,
      },
    });

    if (!existingKey) {
      await prisma.aIKey.create({
        data: {
          providerId: claudeProvider.id,
          secretKey: encrypt(claudeKey),
          isActive: true,
        },
      });
      console.log('✅ Added system Claude key');
    } else {
      console.log('ℹ️ System Claude key already exists');
    }
  }

  console.log('🎉 AI Provider seeding completed!');
}

// Simple encryption function (in production, use proper encryption)
function encrypt(text: string): string {
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

function decrypt(encryptedData: string): string {
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

export { encrypt, decrypt };

if (require.main === module) {
  seedAIProviders()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
