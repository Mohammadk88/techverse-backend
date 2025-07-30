import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Headers,
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
import { Public } from '../auth/decorators/public.decorator';

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

  @Post('checkout')
  @ApiOperation({ 
    summary: 'Create Paddle checkout session',
    description: 'Create a Paddle checkout session to purchase TechCoin. Returns checkout URL for payment'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Checkout session created successfully',
    schema: {
      example: {
        checkout_url: 'https://buy.paddle.com/checkout/...',
        transaction_id: 'txn_...',
        amount: 100,
        price: 1.00
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid amount or configuration error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async createCheckout(@Request() req: any, @Body() buyDto: BuyTechCoinDto) {
    return this.walletService.createPaddleCheckoutSession(req.user.id, buyDto);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ 
    summary: 'Paddle webhook endpoint',
    description: 'Handle Paddle webhook events for payment processing'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook processed successfully'
  })
  async paddleWebhook(
    @Body() body: string,
    @Headers('paddle-signature') signature: string,
  ) {
    return this.walletService.handlePaddleWebhook(body, signature);
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

  @Get('xp/next-role')
  @ApiOperation({
    summary: 'Get next role information',
    description: 'Get information about the next role and XP required to reach it',
  })
  @ApiResponse({
    status: 200,
    description: 'Next role information retrieved successfully',
    schema: {
      example: {
        currentRole: 'MEMBER',
        currentXP: 850,
        nextRole: 'JOURNALIST',
        xpRequired: 150,
        progress: 85,
      },
    },
  })
  async getNextRoleInfo(@Request() req: any) {
    return this.walletService.getNextRoleInfo(req.user.id);
  }

  @Get('xp/thresholds')
  @ApiOperation({
    summary: 'Get XP thresholds for all roles',
    description: 'Get the XP requirements for each role level',
  })
  @ApiResponse({
    status: 200,
    description: 'XP thresholds retrieved successfully',
    schema: {
      example: {
        GUEST: 0,
        MEMBER: 0,
        JOURNALIST: 1000,
        THINKER: 3000,
        BARISTA: 7000,
      },
    },
  })
  getXPThresholds() {
    return this.walletService.getXPThresholds();
  }
}
