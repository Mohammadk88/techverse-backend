import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { IssuesService } from './issues.service';
import { Prisma, IssueStatus } from '@prisma/client';

@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  create(@Body() createIssueDto: Prisma.IssueCreateInput) {
    return this.issuesService.create(createIssueDto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: IssueStatus,
  ) {
    return this.issuesService.findAll(
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
      status,
    );
  }

  @Get('rankings')
  getDeveloperRankings(@Query('take') take?: string) {
    return this.issuesService.getDeveloperRankings(
      take ? parseInt(take) : undefined,
    );
  }

  @Get('creator/:creatorId')
  findByCreator(@Param('creatorId') creatorId: string) {
    return this.issuesService.findByCreator(+creatorId);
  }

  @Get('solver/:solverId')
  findBySolver(@Param('solverId') solverId: string) {
    return this.issuesService.findBySolver(+solverId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIssueDto: Prisma.IssueUpdateInput,
  ) {
    return this.issuesService.update(+id, updateIssueDto);
  }

  @Patch(':id/solve')
  markAsSolved(@Param('id') id: string, @Body() body: { solverId: number }) {
    return this.issuesService.markAsSolved(+id, body.solverId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.issuesService.remove(+id);
  }
}
