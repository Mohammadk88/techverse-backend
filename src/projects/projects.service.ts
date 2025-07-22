import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { task_status } from '@prisma/client';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateTaskDto,
  UpdateTaskDto,
  ApplyToTaskDto,
  ProjectFilterDto,
  TaskFilterDto,
  ProjectStatus,
  TaskStatus,
} from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  // Project Management
  async createProject(user_id: number, createProjectDto: CreateProjectDto) {
    const project = await this.prisma.projects.create({
      data: {
        owner_id: user_id,
        title: createProjectDto.title,
        description: createProjectDto.description,
        is_public: createProjectDto.is_public,
        updated_at: new Date(),
      },
    });

    return project;
  }

  async getProjects(filterDto: ProjectFilterDto) {
    const { page = 1, limit = 10, status, search, is_public = true } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (is_public !== undefined) {
      where.is_public = is_public;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      this.prisma.projects.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              project_tasks: true,
            },
          },
        },
      }),
      this.prisma.projects.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProjectById(id: number, user_id?: number) {
    const project = await this.prisma.projects.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar: true,
          },
        },
        project_tasks: {
          include: {
            _count: {
              select: {
                task_applications: true,
              },
            },
            task_assignments: {
              include: {
                users: {
                  select: {
                    id: true,
                    username: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: {
            project_tasks: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user can view private project
    if (!project.is_public && project.owner_id !== user_id) {
      throw new ForbiddenException('This project is private');
    }

    return project;
  }

  async updateProject(
    id: number,
    user_id: number,
    updateProjectDto: UpdateProjectDto,
  ) {
    const project = await this.prisma.projects.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner_id !== user_id) {
      throw new ForbiddenException('Only project owner can update this project');
    }

    return await this.prisma.projects.update({
      where: { id },
      data: updateProjectDto,
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            project_tasks: true,
          },
        },
      },
    });
  }

  async deleteProject(id: number, user_id: number) {
    const project = await this.prisma.projects.findUnique({
      where: { id },
      include: {
        project_tasks: {
          include: {
            task_assignments: true,
            task_payments: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner_id !== user_id) {
      throw new ForbiddenException('Only project owner can delete this project');
    }

    // Check if any tasks are assigned or paid
    const hasActiveWork = project.project_tasks.some(
      (task) => task.task_assignments || task.task_payments?.is_paid,
    );

    if (hasActiveWork) {
      throw new BadRequestException(
        'Cannot delete project with assigned or paid tasks',
      );
    }

    return await this.prisma.projects.delete({
      where: { id },
    });
  }

  // Task Management
  async createTask(
    project_id: number,
    user_id: number,
    createTaskDto: CreateTaskDto,
  ) {
    const project = await this.prisma.projects.findUnique({
      where: { id: project_id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner_id !== user_id) {
      throw new ForbiddenException('Only project owner can add tasks');
    }

    return await this.prisma.project_tasks.create({
      data: {
        ...createTaskDto,
        project_id,
        updated_at: new Date(),
      },
      include: { projects: {
          select: {
            id: true,
            title: true,
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        _count: {
          select: {
            task_applications: true,
          },
        },
      },
    });
  }

  async getTasks(filterDto: TaskFilterDto) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      minPrice,
      maxPrice,
    } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {
      project: {
        is_public: true, // Only show tasks from public projects
      },
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const [tasks, total] = await Promise.all([
      this.prisma.project_tasks.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { projects: {
            select: {
              id: true,
              title: true,
              users: {
                select: {
                  id: true,
                  username: true,
                  first_name: true,
                  last_name: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              task_applications: true,
            },
          },
          task_assignments: {
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  first_name: true,
                  last_name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.project_tasks.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(id: number) {
    const task = await this.prisma.project_tasks.findUnique({
      where: { id },
      include: { projects: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                avatar: true,
              },
            },
          },
        },
        task_applications: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                avatar: true,
                xp: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
        task_assignments: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                avatar: true,
              },
            },
          },
        },
        task_payments: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if task's project is public or if user is owner
    if (!task.projects.is_public) {
      throw new ForbiddenException('This task belongs to a private project');
    }

    return task;
  }

  async updateTask(id: number, user_id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.project_tasks.findUnique({
      where: { id },
      include: { projects: true,
        task_assignments: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.projects.owner_id !== user_id) {
      throw new ForbiddenException('Only project owner can update this task');
    }

    // Don't allow status changes if task is assigned
    if (task.task_assignments && updateTaskDto.status === task_status.PENDING) {
      throw new BadRequestException('Cannot change status of assigned task');
    }

    return await this.prisma.project_tasks.update({
      where: { id },
      data: updateTaskDto,
      include: { projects: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            task_applications: true,
          },
        },
      },
    });
  }

  async deleteTask(id: number, user_id: number) {
    const task = await this.prisma.project_tasks.findUnique({
      where: { id },
      include: { projects: true,
        task_assignments: true,
        task_payments: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.projects.owner_id !== user_id) {
      throw new ForbiddenException('Only project owner can delete this task');
    }

    if (task.task_assignments || task.task_payments?.is_paid) {
      throw new BadRequestException('Cannot delete assigned or paid task');
    }

    return await this.prisma.project_tasks.delete({
      where: { id },
    });
  }

  // Task Application Management
  async applyToTask(task_id: number, user_id: number, applyDto: ApplyToTaskDto) {
    const task = await this.prisma.project_tasks.findUnique({
      where: { id: task_id },
      include: { projects: true,
        task_assignments: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.projects.owner_id === user_id) {
      throw new BadRequestException('Cannot apply to your own task');
    }

    if (!task.projects.is_public) {
      throw new ForbiddenException('Cannot apply to private project task');
    }

    if (task.status !== task_status.PENDING) {
      throw new BadRequestException('Task is not accepting applications');
    }

    if (task.task_assignments) {
      throw new ConflictException('Task is already assigned');
    }

    // Check if user already applied
    const existingApplication = await this.prisma.task_applications.findUnique({
      where: {
        task_id_applicant_id: {
          task_id,
          applicant_id: user_id,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied to this task');
    }

    return await this.prisma.task_applications.create({
      data: {
        task_id,
        applicant_id: user_id,
        message: applyDto.message,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar: true,
            xp: true,
          },
        },
        project_tasks: {
          select: {
            id: true,
            title: true,
            projects: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  async assignTask(task_id: number, applicant_id: number, owner_id: number) {
    const task = await this.prisma.project_tasks.findUnique({
      where: { id: task_id },
      include: { projects: true,
        task_assignments: true,
        task_applications: {
          where: { applicant_id },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.projects.owner_id !== owner_id) {
      throw new ForbiddenException('Only project owner can assign tasks');
    }

    if (task.task_assignments) {
      throw new ConflictException('Task is already assigned');
    }

    if (task.task_applications.length === 0) {
      throw new BadRequestException('User has not applied to this task');
    }

    // Check if project owner has enough TechCoin using WalletService
    const hasEnough = await this.walletService.hasEnoughTechCoin(
      owner_id,
      task.price,
    );

    if (!hasEnough) {
      throw new BadRequestException(
        `Insufficient TechCoin balance. Need ${task.price} TechCoin to assign this task.`,
      );
    }

    // Deduct TechCoin from owner's wallet (escrow)
    await this.walletService.spendTechCoin(owner_id, {
      amount: task.price,
      description: `Escrowed for task: ${task.title}`,
    });

    // Create assignment and payment record
    return await this.prisma.$transaction(async (prisma) => {
      // Create assignment
      const assignment = await prisma.task_assignments.create({
        data: {
          task_id,
          user_id: applicant_id,
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              avatar: true,
            },
          },
        },
      });

      // Create payment record
      await prisma.task_payments.create({
        data: {
          task_id,
          user_id: applicant_id,
          amount: task.price,
        },
      });

      // Update task status
      await prisma.project_tasks.update({
        where: { id: task_id },
        data: { status: task_status.ASSIGNED },
      });

      return assignment;
    });
  }

  async completeTask(task_id: number, user_id: number) {
    const task = await this.prisma.project_tasks.findUnique({
      where: { id: task_id },
      include: { projects: true,
        task_assignments: true,
        task_payments: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.projects.owner_id !== user_id) {
      throw new ForbiddenException('Only project owner can complete tasks');
    }

    if (!task.task_assignments) {
      throw new BadRequestException('Task is not assigned');
    }

    if (task.status === task_status.DONE) {
      throw new BadRequestException('Task is already completed');
    }

    if (task.task_payments?.is_paid) {
      throw new BadRequestException('Task payment has already been processed');
    }

    // Complete task and process payment using WalletService
    return await this.prisma.$transaction(async (prisma) => {
      // Update task status
      await prisma.project_tasks.update({
        where: { id: task_id },
        data: { status: task_status.DONE },
      });

      // Process payment
      await prisma.task_payments.update({
        where: { task_id },
        data: {
          is_paid: true,
          paid_at: new Date(),
        },
      });

      // Award TechCoin to task assignee using WalletService
      if (!task.task_assignments) {
        throw new ForbiddenException('Task must be assigned before payment');
      }

      await this.walletService.earnTechCoin(task.task_assignments.user_id, {
        amount: task.price,
        description: `Completed task: ${task.title}`,
      });

      // Award XP using WalletService
      await this.walletService.addXP(
        task.task_assignments.user_id,
        10,
        `Completed task: ${task.title}`,
      );

      return { message: 'Task completed and payment processed successfully' };
    });
  }

  // Get user's projects
  async getUserProjects(user_id: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.prisma.projects.findMany({
        where: { owner_id: user_id },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: {
              project_tasks: true,
            },
          },
        },
      }),
      this.prisma.projects.count({ where: { owner_id: user_id } }),
    ]);

    return {
      data: projects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get user's task.task_applications
  async getUserApplications(user_id: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.task_applications.findMany({
        where: { applicant_id: user_id },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { project_tasks: {
            include: { projects: {
                select: {
                  id: true,
                  title: true,
                  users: {
                    select: {
                      id: true,
                      username: true,
                      first_name: true,
                      last_name: true,
                    },
                  },
                },
              },
              task_assignments: {
                select: {
                  user_id: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.task_applications.count({ where: { applicant_id: user_id } }),
    ]);

    return {
      data: applications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get user's assigned tasks
  async getUserAssignedTasks(user_id: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      this.prisma.task_assignments.findMany({
        where: { user_id },
        skip,
        take: limit,
        orderBy: { assigned_at: 'desc' },
        include: { project_tasks: {
            include: { projects: {
                select: {
                  id: true,
                  title: true,
                  users: {
                    select: {
                      id: true,
                      username: true,
                      first_name: true,
                      last_name: true,
                    },
                  },
                },
              },
              task_payments: true,
            },
          },
        },
      }),
      this.prisma.task_assignments.count({ where: { user_id } }),
    ]);

    return {
      data: assignments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
