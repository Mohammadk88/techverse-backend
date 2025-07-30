import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { RoleUpgradeService } from '../users/role-upgrade.service';
import { BuyTechCoinDto, SpendTechCoinDto, EarnTechCoinDto } from './dto';
import { transaction_types, wallets } from '@prisma/client';
import { Paddle, Environment } from '@paddle/paddle-node-sdk';

@Injectable()
export class WalletService {
  private paddle: Paddle | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private roleUpgradeService: RoleUpgradeService,
  ) {
    const paddleApiKey = this.configService.get('PADDLE_API_KEY');
    const paddleEnvironment = this.configService.get('PADDLE_ENVIRONMENT') || 'sandbox';
    
    if (paddleApiKey && paddleApiKey !== 'pdl_sandbox_placeholder_key_replace_with_your_actual_paddle_api_key') {
      this.paddle = new Paddle(paddleApiKey, {
        environment: paddleEnvironment === 'production' ? Environment.production : Environment.sandbox,
      });
    } else {
      console.warn('⚠️ Paddle not initialized: PADDLE_API_KEY is missing or using placeholder value');
    }
  }

  // Get or create user wallet
  async getOrCreateWallet(user_id: number): Promise<wallets> {
    let wallet = await this.prisma.wallets.findUnique({
      where: { user_id: user_id },
    });

    if (!wallet) {
      wallet = await this.prisma.wallets.create({
        data: {
          user_id,
          tech_coin: 0,
          xp: 0,
          updated_at: new Date(),
        },
      });
    }

    return wallet;
  }

  // Get wallet with transaction history
  async getWallet(user_id: number) {
    const wallet = await this.getOrCreateWallet(user_id);
    
    const transactions = await this.prisma.wallet_transactions.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
      take: 20, // Latest 20 transactions
    });

    return {
      ...wallet,
      transactions,
    };
  }

  // Add TechCoin to user's wallet
  private async addTechCoin(user_id: number, amount: number): Promise<void> {
    await this.prisma.wallets.upsert({
      where: { user_id },
      update: {
        tech_coin: {
          increment: amount,
        },
        updated_at: new Date(),
      },
      create: {
        user_id,
        tech_coin: amount,
        xp: 0,
        updated_at: new Date(),
      },
    });
  }

  // Buy TechCoin with Paddle Checkout
  async createPaddleCheckoutSession(
    user_id: number,
    buyDto: BuyTechCoinDto,
  ): Promise<{ checkout_url: string; transaction_id: string }> {
    if (!this.paddle) {
      throw new BadRequestException('Paddle payment processing is not available. Please configure Paddle keys.');
    }

    try {
      const transaction = await this.paddle.transactions.create({
        items: [
          {
            price: {
              description: `Purchase ${buyDto.amount} TechCoin`,
              name: 'TechCoin',
              product: {
                name: 'TechCoin',
                description: 'Digital currency for TechVerse Café',
                taxCategory: 'standard',
              },
              unitPrice: {
                amount: (buyDto.amount * 0.01 * 100).toString(), // $0.01 per TechCoin in cents
                currencyCode: 'USD',
              },
            },
            quantity: 1,
          },
        ],
        customData: {
          user_id: user_id.toString(),
          tech_coin_amount: buyDto.amount.toString(),
        },
      });

      return {
        checkout_url: transaction.checkout!.url!,
        transaction_id: transaction.id,
      };
    } catch (error) {
      console.error('Paddle checkout creation failed:', error);
      throw new BadRequestException('Failed to create checkout session');
    }
  }

  // Process confirmed Paddle payment
  async processPaddlePayment(transaction_id: string): Promise<void> {
    if (!this.paddle) {
      throw new BadRequestException(
        'Paddle payment processing is not available. Please configure Paddle keys.',
      );
    }

    const transaction = await this.paddle.transactions.get(transaction_id);

    if (transaction.status !== 'completed') {
      throw new BadRequestException('Payment not completed');
    }

    const customData = transaction.customData as Record<string, any>;
    const user_id = parseInt(String(customData?.user_id || '0'));
    const tech_coin_amount = parseFloat(
      String(customData?.tech_coin_amount || '0'),
    );

    if (!user_id || !tech_coin_amount) {
      throw new BadRequestException('Invalid payment metadata');
    }

    // Add TechCoin to user's wallet
    await this.addTechCoin(user_id, tech_coin_amount);

    // Create wallet transaction record
    await this.prisma.wallet_transactions.create({
      data: {
        user_id,
        type: 'BUY',
        amount: tech_coin_amount,
        description: `Purchased ${tech_coin_amount} TechCoin via Paddle (Transaction: ${transaction_id})`,
      },
    });
  }

  // Paddle webhook handler
  async handlePaddleWebhook(payload: string, signature: string) {
    if (!this.paddle) {
      throw new BadRequestException(
        'Paddle payment processing is not available. Please configure Paddle keys.',
      );
    }

    const webhookSecret = this.configService.get<string>(
      'PADDLE_WEBHOOK_SECRET',
    );

    let event: any;
    try {
      // Verify webhook signature
      event = this.paddle.webhooks.unmarshal(
        payload,
        webhookSecret || '',
        signature,
      );
    } catch (err) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${err}`,
      );
    }

    switch ((event as any).eventType) {
      case 'transaction.completed': {
        const transaction = (event as any).data;
        await this.processPaddlePayment(String(transaction.id));
        break;
      }

      case 'transaction.payment_failed':
        console.log('Payment failed for transaction:', (event as any).data.id);
        break;

      default:
        console.log(`Unhandled event type: ${(event as any).eventType}`);
    }

    return { received: true };
  }

  // Spend TechCoin
  async spendTechCoin(user_id: number, spendDto: SpendTechCoinDto) {
    const wallet = await this.getOrCreateWallet(user_id);

    if (wallet.tech_coin < spendDto.amount) {
      throw new BadRequestException('Insufficient TechCoin balance');
    }

    // Update wallet and create transaction
    const [updatedWallet, transaction] = await this.prisma.$transaction([
      this.prisma.wallets.update({
        where: { user_id },
        data: {
          tech_coin: {
            decrement: spendDto.amount,
          },
        },
      }),
      this.prisma.wallet_transactions.create({
        data: {
          user_id,
          type: transaction_types.SPEND,
          amount: -spendDto.amount, // Negative for spending
          description: spendDto.description,
        },
      }),
    ]);

    return {
      wallet: updatedWallet,
      transaction,
    };
  }

  // Earn TechCoin (for completing tasks, winning challenges, etc.)
  async earnTechCoin(user_id: number, earnDto: EarnTechCoinDto) {
    // Update wallet and create transaction
    const [updatedWallet, transaction] = await this.prisma.$transaction([
      this.prisma.wallets.update({
        where: { user_id },
        data: {
          tech_coin: {
            increment: earnDto.amount,
          },
        },
      }),
      this.prisma.wallet_transactions.create({
        data: {
          user_id,
          type: transaction_types.EARN,
          amount: earnDto.amount,
          description: earnDto.description,
        },
      }),
    ]);

    return {
      wallet: updatedWallet,
      transaction,
    };
  }

  // Add XP to user and check for role upgrades
  async addXP(user_id: number, xpAmount: number, description: string) {
    // Use role upgrade service to award XP and handle role upgrades
    const xpResult = await this.roleUpgradeService.awardXP(
      user_id,
      xpAmount,
      description,
    );

    // Update wallet XP
    const updatedWallet = await this.prisma.wallets.update({
      where: { user_id },
      data: {
        xp: xpResult.totalXP,
        updated_at: new Date(),
      },
    });

    // Log XP gain as a transaction
    await this.prisma.wallet_transactions.create({
      data: {
        user_id,
        type: transaction_types.EARN,
        amount: 0,
        description: `${description} (+${xpAmount} XP)`,
      },
    });

    return {
      wallet: updatedWallet,
      xpGained: xpResult.xpAwarded,
      totalXP: xpResult.totalXP,
      roleUpgrade: xpResult.roleUpgrade,
    };
  }

  // Check if user has enough TechCoin
  async hasEnoughTechCoin(user_id: number, amount: number): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(user_id);
    return wallet.tech_coin >= amount;
  }

  // Get transaction history
  async getTransactionHistory(
    user_id: number,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      this.prisma.wallet_transactions.findMany({
        where: { user_id },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.wallet_transactions.count({
        where: { user_id },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // XP reward constants
  private readonly XP_REWARDS = {
    ARTICLE_PUBLISH: 100,
    CAFE_COMMENT: 50,
    CHALLENGE_WIN: 200,
    GET_FOLLOWED: 20,
    FOLLOW_USER: 10,
    PROJECT_COMPLETION: 150,
    TASK_COMPLETION: 75,
  };

  // Award XP for different activities
  async awardXPForActivity(
    user_id: number,
    activity: keyof typeof this.XP_REWARDS,
    customAmount?: number,
  ) {
    const xpAmount = customAmount || this.XP_REWARDS[activity];
    const activityDescriptions = {
      ARTICLE_PUBLISH: 'Published an article',
      CAFE_COMMENT: 'Posted a café comment',
      CHALLENGE_WIN: 'Won a challenge',
      GET_FOLLOWED: 'Gained a new follower',
      FOLLOW_USER: 'Followed a user',
      PROJECT_COMPLETION: 'Completed a project',
      TASK_COMPLETION: 'Completed a task',
    };

    return this.addXP(user_id, xpAmount, activityDescriptions[activity]);
  }

  // Get XP thresholds from role upgrade service
  getXPThresholds() {
    return this.roleUpgradeService.getXPThresholds();
  }

  // Get next role information
  async getNextRoleInfo(user_id: number) {
    return this.roleUpgradeService.getNextRoleInfo(user_id);
  }
}
