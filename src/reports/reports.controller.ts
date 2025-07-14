import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Prisma, ReportStatus } from '@prisma/client';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() createReportDto: Prisma.ReportCreateInput) {
    return this.reportsService.create(createReportDto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: ReportStatus,
  ) {
    return this.reportsService.findAll(
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
      status,
    );
  }

  @Get('stats')
  getReportStats() {
    return this.reportsService.getReportStats();
  }

  @Get('content-type/:contentType')
  findByContentType(@Param('contentType') contentType: string) {
    return this.reportsService.findByContentType(contentType);
  }

  @Get('reporter/:reporterId')
  findByReporter(@Param('reporterId') reporterId: string) {
    return this.reportsService.findByReporter(+reporterId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: Prisma.ReportUpdateInput) {
    return this.reportsService.update(+id, updateReportDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: ReportStatus }) {
    return this.reportsService.updateStatus(+id, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }
}
