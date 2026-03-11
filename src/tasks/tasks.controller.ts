import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OrganizationGuard } from 'src/auth/guards/organization.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(OrganizationGuard, RolesGuard)
  @Roles('developer')
  @Post()
  createTask(@Req() req, @Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(
      req.organization.org_id,
      req.user.id,
      dto,
    );
  }
}
