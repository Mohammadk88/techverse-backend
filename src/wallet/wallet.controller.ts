import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { BuyTechCoinDto, SpendTechCoinDto, EarnTechCoinDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('💰 Digital Wallet & TechCoin')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get user wallet information',
    description: 'Retrieve complete wallet information including TechCoin balance, XP, and recent transactions'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet information retrieved successfully',
    schema: {
      example: {
        id: 1,
        user_id: 123,
        tech_coin: 250,
        xp: 850,
        created_at: '2025-07-16T00:00:00Z',
        updated_at: '2025-07-16T12:00:00Z',
        recentTransactions: [
          {
            id: 5,
            type: 'EARN',
            amount: 25,
            description: 'Task completion reward',
            created_at: '2025-07-16T10:30:00Z'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async getWallet(@Request() req: any) {
    return this.walletService.getWallet(req.user.id);
  }

  @Post('buy')
  @ApiOperation({ 
    summary: 'Purchase TechCoin',
    description: 'Buy TechCoin using mock Stripe payment integration. 1 USD = 10 TechCoin'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'TechCoin purchased successfully',
    schema: {
      example: {
        success: true,
        transaction: {
          id: 10,
          type: 'BUY',
          amount: 100,
          description: 'Purchased 100 TechCoin for $10.00',
          stripePaymentId: 'pi_mock_12345',
          created_at: '2025-07-16T12:30:00Z'
        },
        wallet: {
          tech_coin: 350,
          xp: 850
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Payment failed or invalid amount' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async buyTechCoin(@Request() req: any, @Body() buyDto: BuyTechCoinDto) {
    return this.walletService.buyTechCoin(req.user.id, buyDto);
  }

  @Post('spend')
  @ApiOperation({ 
    summary: 'Spend TechCoin',
    description: 'Spend TechCoin for various platform activities (joining challenges, creating cafes, etc.)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'TechCoin spent successfully',
    schema: {
      example: {
        success: true,
        transaction: {
          id: 11,
          type: 'SPEND',
          amount: -50,
          description: 'Joined challenge: Code Master',
          created_at: '2025-07-16T12:45:00Z'
        },
        remainingBalance: 300
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Insufficient TechCoin balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async spendTechCoin(@Request() req: any, @Body() spendDto: SpendTechCoinDto) {
    return this.walletService.spendTechCoin(req.user.id, spendDto);
  }

  @Post('earn')
  @ApiOperation({ 
    summary: 'Earn TechCoin',
    description: 'Earn TechCoin through various activities (completing tasks, winning challenges, etc.)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'TechCoin earned successfully',
    schema: {
      example: {
        success: true,
        transaction: {
          id: 12,
          type: 'EARN',
          amount: 75,
          description: 'Won challenge: Code Master',
          created_at: '2025-07-16T13:00:00Z'
        },
        newBalance: 375,
        xpGained: 25
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async earnTechCoin(@Request() req: any, @Body() earnDto: EarnTechCoinDto) {
    return this.walletService.earnTechCoin(req.user.id, earnDto);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Retrieve paginated transaction history for the user wallet',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'type', required: false, enum: ['BUY', 'SPEND', 'EARN'], description: 'Filter by transaction type' })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    schema: {
      example: {
        transactions: [
          {
            id: 12,
            type: 'EARN',
            amount: 75,
            description: 'Won challenge: Code Master',
            created_at: '2025-07-16T13:00:00Z',
          },
          {
            id: 11,
            type: 'SPEND',
            amount: -50,
            description: 'Joined challenge: Code Master',
            created_at: '2025-07-16T12:45:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 25,
          totalPages: 2,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async getTransactionHistory(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
  ) {
    return this.walletService.getTransactionHistory(
      req.user.id,
      page || 1,
      Math.min(limit || 20, 100),
    );
  }

  @Get('balance')
  @ApiOperation({
    summary: 'Check wallet balance',
    description:
      'Get current TechCoin balance and XP, optionally check if user has enough for a specific amount',
  })
  @ApiQuery({
    name: 'amount',
    required: false,
    type: Number,
    description: 'Amount to check if user has enough TechCoin',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance information retrieved successfully',
    schema: {
      example: {
        balance: 375,
        xp: 875,
        hasEnough: true,
        requiredAmount: 100,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async checkBalance(
    @Request() req: any,
    @Query('amount') amount?: number,
  ) {
    if (amount) {
      const hasEnough = await this.walletService.hasEnoughTechCoin(
        req.user.id,
        amount,
      );
      const wallet = await this.walletService.getOrCreateWallet(
        req.user.id,
      );
      return {
        balance: wallet.tech_coin,
        xp: wallet.xp,
        hasEnough,
        requiredAmount: amount,
      };
    }

    const wallet = await this.walletService.getOrCreateWallet(req.user.id);
    return { balance: wallet.tech_coin, xp: wallet.xp };
  }
}
