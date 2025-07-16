import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BuyTechCoinDto, SpendTechCoinDto, EarnTechCoinDto } from './dto';
import { TransactionType, Wallet, WalletTransaction } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  // Get or create user wallet
  async getOrCreateWallet(userId: number): Promise<Wallet> {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId: userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          techCoin: 100, // Starting balance
          xp: 0,
        },
      });
    }

    return wallet;
  }

  // Get wallet with transaction history
  async getWallet(userId: number) {
    const wallet = await this.getOrCreateWallet(userId);
    
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Latest 20 transactions
    });

    return {
      ...wallet,
      transactions,
    };
  }

  // Buy TechCoin (Mock Stripe payment)
  async buyTechCoin(userId: number, buyDto: BuyTechCoinDto) {
    // Mock Stripe payment process
    const paymentSuccess = await this.mockStripePayment(buyDto.amount);
    
    if (!paymentSuccess) {
      throw new BadRequestException('Payment failed');
    }

    // Update wallet and create transaction
    const [updatedWallet, transaction] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId },
        data: {
          techCoin: {
            increment: buyDto.amount,
          },
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId,
          type: TransactionType.BUY,
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
  async spendTechCoin(userId: number, spendDto: SpendTechCoinDto) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.techCoin < spendDto.amount) {
      throw new BadRequestException('Insufficient TechCoin balance');
    }

    // Update wallet and create transaction
    const [updatedWallet, transaction] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId },
        data: {
          techCoin: {
            decrement: spendDto.amount,
          },
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId,
          type: TransactionType.SPEND,
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
  async earnTechCoin(userId: number, earnDto: EarnTechCoinDto) {
    // Update wallet and create transaction
    const [updatedWallet, transaction] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId },
        data: {
          techCoin: {
            increment: earnDto.amount,
          },
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId,
          type: TransactionType.EARN,
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
  async addXP(userId: number, xpAmount: number, description: string) {
    const updatedWallet = await this.prisma.wallet.update({
      where: { userId },
      data: {
        xp: {
          increment: xpAmount,
        },
      },
    });

    // Log XP gain as a transaction (amount = 0, description shows XP)
    await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: TransactionType.EARN,
        amount: 0,
        description: `${description} (+${xpAmount} XP)`,
      },
    });

    return updatedWallet;
  }

  // Check if user has enough TechCoin
  async hasEnoughTechCoin(userId: number, amount: number): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.techCoin >= amount;
  }

  // Get transaction history
  async getTransactionHistory(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.walletTransaction.count({
        where: { userId },
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
