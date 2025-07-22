import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateTaskDto,
  UpdateTaskDto,
  ApplyToTaskDto,
  ProjectFilterDto,
  TaskFilterDto,
} from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('�️ Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new project',
    description: 'Create a new project to organize tasks and collaborations',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    schema: {
      example: {
        id: 25,
        title: 'TechVerse Mobile App',
        description: 'React Native mobile application for TechVerse platform',
        is_private: false,
        status: 'ACTIVE',
        createdBy: {
          id: 123,
          username: 'johndoe',
        },
        taskCount: 0,
        created_at: '2025-07-16T15:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.createProject(req.user.id, createProjectDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all projects with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async getProjects(@Query() filterDto: ProjectFilterDto) {
    return this.projectsService.getProjects(filterDto);
  }

  @Get('my-projects')
  @ApiOperation({ summary: 'Get current user projects' })
  @ApiResponse({ status: 200, description: 'User projects retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyProjects(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.getUserProjects(
      req.user.id,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  @Get('my-applications')
  @ApiOperation({ summary: 'Get current user task.task_applications' })
  @ApiResponse({
    status: 200,
    description: 'User applications retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyApplications(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.getUserApplications(
      req.user.id,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get current user assigned tasks' })
  @ApiResponse({
    status: 200,
    description: 'User assigned tasks retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyTasks(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.getUserAssignedTasks(
      req.user.id,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Project is private' })
  @ApiParam({ name: 'id', type: 'number' })
  async getProject(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.projectsService.getProjectById(id, req.user?.user_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Only project owner can update' })
  @ApiParam({ name: 'id', type: 'number' })
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.updateProject(id, req.user.id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Only project owner can delete' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete project with active tasks',
  })
  @ApiParam({ name: 'id', type: 'number' })
  async deleteProject(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.projectsService.deleteProject(id, req.user.id);
  }

  // Task Management
  @Post(':id/tasks')
  @ApiOperation({ summary: 'Create a task for a project' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Only project owner can add tasks' })
  @ApiParam({ name: 'id', type: 'number' })
  async createTask(
    @Param('id', ParseIntPipe) project_id: number,
    @Body() createTaskDto: CreateTaskDto,
    @Request() req,
  ) {
    return this.projectsService.createTask(
      project_id,
      req.user.id,
      createTaskDto,
    );
  }

  @Get('tasks/all')
  @Public()
  @ApiOperation({ summary: 'Get all tasks with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async getAllTasks(@Query() filterDto: TaskFilterDto) {
    return this.projectsService.getTasks(filterDto);
  }

  @Get('tasks/:id')
  @Public()
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Task belongs to private project' })
  @ApiParam({ name: 'id', type: 'number' })
  async getTask(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getTaskById(id);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Only project owner can update task' })
  @ApiResponse({
    status: 400,
    description: 'Cannot change status of assigned task',
  })
  @ApiParam({ name: 'id', type: 'number' })
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    return this.projectsService.updateTask(id, req.user.id, updateTaskDto);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Only project owner can delete task' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete assigned or paid task',
  })
  @ApiParam({ name: 'id', type: 'number' })
  async deleteTask(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.projectsService.deleteTask(id, req.user.id);
  }

  // Task Application Management
  @Post('tasks/:id/apply')
  @ApiOperation({ summary: 'Apply to a task' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot apply to own task or task not accepting applications',
  })
  @ApiResponse({ status: 409, description: 'Already applied or task assigned' })
  @ApiParam({ name: 'id', type: 'number' })
  async applyToTask(
    @Param('id', ParseIntPipe) task_id: number,
    @Body() applyDto: ApplyToTaskDto,
    @Request() req,
  ) {
    return this.projectsService.applyToTask(task_id, req.user.id, applyDto);
  }

  @Post('tasks/:task_id/assign/:applicant_id')
  @ApiOperation({ summary: 'Assign task to an applicant' })
  @ApiResponse({ status: 201, description: 'Task assigned successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Only project owner can assign tasks' })
  @ApiResponse({
    status: 400,
    description: 'User has not applied or insufficient balance',
  })
  @ApiResponse({ status: 409, description: 'Task already assigned' })
  @ApiParam({ name: 'task_id', type: 'number' })
  @ApiParam({ name: 'applicant_id', type: 'number' })
  async assignTask(
    @Param('task_id', ParseIntPipe) task_id: number,
    @Param('applicant_id', ParseIntPipe) applicant_id: number,
    @Request() req,
  ) {
    return this.projectsService.assignTask(task_id, applicant_id, req.user.id);
  }

  @Post('tasks/:id/complete')
  @ApiOperation({ summary: 'Complete task and process payment' })
  @ApiResponse({
    status: 200,
    description: 'Task completed and payment processed',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Only project owner can complete tasks' })
  @ApiResponse({
    status: 400,
    description: 'Task not assigned or already completed',
  })
  @ApiParam({ name: 'id', type: 'number' })
  async completeTask(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.projectsService.completeTask(id, req.user.id);
  }
}
