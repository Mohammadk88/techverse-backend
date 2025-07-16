import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
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
  async createProject(userId: number, createProjectDto: CreateProjectDto) {
    return await this.prisma.project.create({
      data: {
        ...createProjectDto,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async getProjects(filterDto: ProjectFilterDto) {
    const { page = 1, limit = 10, status, search, isPublic = true } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
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
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
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

  async getProjectById(id: number, userId?: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        tasks: {
          include: {
            _count: {
              select: {
                applications: true,
              },
            },
            assignment: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user can view private project
    if (!project.isPublic && project.ownerId !== userId) {
      throw new ForbiddenException('This project is private');
    }

    return project;
  }

  async updateProject(
    id: number,
    userId: number,
    updateProjectDto: UpdateProjectDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can update this project');
    }

    return await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async deleteProject(id: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignment: true,
            payment: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can delete this project');
    }

    // Check if any tasks are assigned or paid
    const hasActiveWork = project.tasks.some(
      (task) => task.assignment || task.payment?.isPaid,
    );

    if (hasActiveWork) {
      throw new BadRequestException(
        'Cannot delete project with assigned or paid tasks',
      );
    }

    return await this.prisma.project.delete({
      where: { id },
    });
  }

  // Task Management
  async createTask(
    projectId: number,
    userId: number,
    createTaskDto: CreateTaskDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can add tasks');
    }

    return await this.prisma.projectTask.create({
      data: {
        ...createTaskDto,
        projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            owner: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
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
        isPublic: true, // Only show tasks from public projects
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
      this.prisma.projectTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              owner: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
          assignment: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.projectTask.count({ where }),
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
    const task = await this.prisma.projectTask.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                xp: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        assignment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if task's project is public or if user is owner
    if (!task.project.isPublic) {
      throw new ForbiddenException('This task belongs to a private project');
    }

    return task;
  }

  async updateTask(id: number, userId: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.projectTask.findUnique({
      where: { id },
      include: {
        project: true,
        assignment: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can update this task');
    }

    // Don't allow status changes if task is assigned
    if (task.assignment && updateTaskDto.status === TaskStatus.PENDING) {
      throw new BadRequestException('Cannot change status of assigned task');
    }

    return await this.prisma.projectTask.update({
      where: { id },
      data: updateTaskDto,
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });
  }

  async deleteTask(id: number, userId: number) {
    const task = await this.prisma.projectTask.findUnique({
      where: { id },
      include: {
        project: true,
        assignment: true,
        payment: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can delete this task');
    }

    if (task.assignment || task.payment?.isPaid) {
      throw new BadRequestException('Cannot delete assigned or paid task');
    }

    return await this.prisma.projectTask.delete({
      where: { id },
    });
  }

  // Task Application Management
  async applyToTask(taskId: number, userId: number, applyDto: ApplyToTaskDto) {
    const task = await this.prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        assignment: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.project.ownerId === userId) {
      throw new BadRequestException('Cannot apply to your own task');
    }

    if (!task.project.isPublic) {
      throw new ForbiddenException('Cannot apply to private project task');
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new BadRequestException('Task is not accepting applications');
    }

    if (task.assignment) {
      throw new ConflictException('Task is already assigned');
    }

    // Check if user already applied
    const existingApplication = await this.prisma.taskApplication.findUnique({
      where: {
        taskId_applicantId: {
          taskId,
          applicantId: userId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied to this task');
    }

    return await this.prisma.taskApplication.create({
      data: {
        taskId,
        applicantId: userId,
        message: applyDto.message,
      },
      include: {
        applicant: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            xp: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            project: {
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

  async assignTask(taskId: number, applicantId: number, ownerId: number) {
    const task = await this.prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        assignment: true,
        applications: {
          where: { applicantId },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.project.ownerId !== ownerId) {
      throw new ForbiddenException('Only project owner can assign tasks');
    }

    if (task.assignment) {
      throw new ConflictException('Task is already assigned');
    }

    if (task.applications.length === 0) {
      throw new BadRequestException('User has not applied to this task');
    }

    // Check if project owner has enough TechCoin using WalletService
    const hasEnough = await this.walletService.hasEnoughTechCoin(
      ownerId,
      task.price,
    );

    if (!hasEnough) {
      throw new BadRequestException(
        `Insufficient TechCoin balance. Need ${task.price} TechCoin to assign this task.`,
      );
    }

    // Deduct TechCoin from owner's wallet (escrow)
    await this.walletService.spendTechCoin(ownerId, {
      amount: task.price,
      description: `Escrowed for task: ${task.title}`,
    });

    // Create assignment and payment record
    return await this.prisma.$transaction(async (prisma) => {
      // Create assignment
      const assignment = await prisma.taskAssignment.create({
        data: {
          taskId,
          userId: applicantId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      // Create payment record
      await prisma.taskPayment.create({
        data: {
          taskId,
          userId: applicantId,
          amount: task.price,
        },
      });

      // Update task status
      await prisma.projectTask.update({
        where: { id: taskId },
        data: { status: TaskStatus.ASSIGNED },
      });

      return assignment;
    });
  }

  async completeTask(taskId: number, userId: number) {
    const task = await this.prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        assignment: true,
        payment: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can complete tasks');
    }

    if (!task.assignment) {
      throw new BadRequestException('Task is not assigned');
    }

    if (task.status === TaskStatus.DONE) {
      throw new BadRequestException('Task is already completed');
    }

    if (task.payment?.isPaid) {
      throw new BadRequestException('Task payment has already been processed');
    }

    // Complete task and process payment using WalletService
    return await this.prisma.$transaction(async (prisma) => {
      // Update task status
      await prisma.projectTask.update({
        where: { id: taskId },
        data: { status: TaskStatus.DONE },
      });

      // Process payment
      await prisma.taskPayment.update({
        where: { taskId },
        data: {
          isPaid: true,
          paidAt: new Date(),
        },
      });

      // Award TechCoin to task assignee using WalletService
      if (!task.assignment) {
        throw new ForbiddenException('Task must be assigned before payment');
      }

      await this.walletService.earnTechCoin(task.assignment.userId, {
        amount: task.price,
        description: `Completed task: ${task.title}`,
      });

      // Award XP using WalletService
      await this.walletService.addXP(
        task.assignment.userId,
        10,
        `Completed task: ${task.title}`,
      );

      return { message: 'Task completed and payment processed successfully' };
    });
  }

  // Get user's projects
  async getUserProjects(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { ownerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where: { ownerId: userId } }),
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

  // Get user's task applications
  async getUserApplications(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.taskApplication.findMany({
        where: { applicantId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          task: {
            include: {
              project: {
                select: {
                  id: true,
                  title: true,
                  owner: {
                    select: {
                      id: true,
                      username: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
              assignment: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.taskApplication.count({ where: { applicantId: userId } }),
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
  async getUserAssignedTasks(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      this.prisma.taskAssignment.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { assignedAt: 'desc' },
        include: {
          task: {
            include: {
              project: {
                select: {
                  id: true,
                  title: true,
                  owner: {
                    select: {
                      id: true,
                      username: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
              payment: true,
            },
          },
        },
      }),
      this.prisma.taskAssignment.count({ where: { userId } }),
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
