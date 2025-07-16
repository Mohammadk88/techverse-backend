import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { SchedulerService } from './scheduler.service';

class RescheduleDto {
  newScheduleTime: string; // ISO date string
}

@ApiTags('⚙️ System')
@ApiBearerAuth()
@Controller('scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('publish')
  @ApiOperation({ summary: 'Manually trigger publishing of scheduled content' })
  @ApiResponse({
    status: 200,
    description: 'Scheduled content publishing triggered',
  })
  @Roles(UserRole.BARISTA, UserRole.JOURNALIST, UserRole.MEMBER) // Added MEMBER for testing
  @HttpCode(HttpStatus.OK)
  async publishScheduledContent(): Promise<{ message: string }> {
    await this.schedulerService.publishScheduledContent();
    return { message: 'Scheduled content publishing triggered' };
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Get all scheduled content' })
  @ApiResponse({
    status: 200,
    description: 'List of scheduled articles',
  })
  @Roles(UserRole.BARISTA, UserRole.JOURNALIST, UserRole.THINKER, UserRole.MEMBER) // Added MEMBER for testing
  async getScheduledContent() {
    return this.schedulerService.getScheduledContent();
  }

  @Post('articles/:id/reschedule')
  @ApiOperation({ summary: 'Reschedule an article' })
  @ApiResponse({
    status: 200,
    description: 'Article rescheduled successfully',
  })
  @Roles(UserRole.BARISTA, UserRole.JOURNALIST)
  async rescheduleArticle(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleDto,
  ): Promise<{ message: string }> {
    const newScheduleTime = new Date(rescheduleDto.newScheduleTime);
    await this.schedulerService.rescheduleContent(
      'article',
      parseInt(id),
      newScheduleTime,
    );
    return { message: 'Article rescheduled successfully' };
  }

  @Delete('articles/:id/schedule')
  @ApiOperation({ summary: 'Cancel scheduled article' })
  @ApiResponse({
    status: 200,
    description: 'Article schedule cancelled successfully',
  })
  @Roles(UserRole.BARISTA, UserRole.JOURNALIST)
  async cancelArticleSchedule(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.schedulerService.cancelScheduledContent('article', parseInt(id));
    return { message: 'Article schedule cancelled successfully' };
  }
}
