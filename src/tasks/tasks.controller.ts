import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OrganizationGuard } from 'src/auth/guards/organization.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Endpoint #1 (RBAC): Create a task
  // - Requires valid JWT + active organization (OrganizationGuard)
  // - Only org roles 'manager' or 'lead' can create tasks (RolesGuard)
  //
  // Client must send:
  // - Authorization: Bearer <token>
  // - X-Organization-Id: <orgId>
  @Roles('manager', 'developer')
  @UseGuards(OrganizationGuard, RolesGuard)
  @Post()
  createTask(@Req() req, @Body() dto: CreateTaskDto) {
    // OrganizationGuard attaches these to the request:
    // - req.user.id (from JWT sub)
    // - req.organization.org_id (from JWT organizations array)
    return this.tasksService.createTask(
      req.organization.org_id,
      req.user.id,
      dto,
    );
  }
}
