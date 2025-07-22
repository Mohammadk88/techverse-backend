import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BuyTechCoinDto, SpendTechCoinDto, EarnTechCoinDto } from './dto';
import { transaction_types, wallets, wallet_transactions } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

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

  // Buy TechCoin (Mock Stripe payment)
  async buyTechCoin(user_id: number, buyDto: BuyTechCoinDto) {
    // Mock Stripe payment process
    const paymentSuccess = await this.mockStripePayment(buyDto.amount);
    
    if (!paymentSuccess) {
      throw new BadRequestException('Payment failed');
    }

    // Update wallet and create transaction
    const [updatedWallet, transaction] = await this.prisma.$transaction([
      this.prisma.wallets.update({
        where: { user_id },
        data: {
          tech_coin: {
            increment: buyDto.amount,
          },
        },
      }),
      this.prisma.wallet_transactions.create({
        data: {
          user_id,
          type: transaction_types.BUY,
          amount: buyDto.amount,
          description: `Purchased ${buyDto.amount} TechCoin`,
        },
      }),
    ]);

    return {
      wallet: updatedWallet,
      transaction,
    };
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

  // Add XP to wallet
  async addXP(user_id: number, xpAmount: number, description: string) {
    const updatedWallet = await this.prisma.wallets.update({
      where: { user_id },
      data: {
        xp: {
          increment: xpAmount,
        },
      },
    });

    // Log XP gain as a transaction (amount = 0, description shows XP)
    await this.prisma.wallet_transactions.create({
      data: {
        user_id,
        type: transaction_types.EARN,
        amount: 0,
        description: `${description} (+${xpAmount} XP)`,
      },
    });

    return updatedWallet;
  }

  // Check if user has enough TechCoin
  async hasEnoughTechCoin(user_id: number, amount: number): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(user_id);
    return wallet.tech_coin >= amount;
  }

  // Get transaction history
  async getTransactionHistory(user_id: number, page: number = 1, limit: number = 20) {
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

  // Mock Stripe payment (replace with real Stripe integration)
  private async mockStripePayment(amount: number): Promise<boolean> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock 95% success rate
    return Math.random() > 0.05;
  }
}
