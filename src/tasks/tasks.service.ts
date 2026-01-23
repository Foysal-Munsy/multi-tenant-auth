import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async createTask(orgId: string, creatorUserId: string, dto: CreateTaskDto) {
    // This service assumes OrganizationGuard already validated the org context
    // and RolesGuard already validated the caller's role.

    const title = (dto.title ?? '').trim();
    if (!title) {
      throw new BadRequestException('title is required');
    }

    return this.taskModel.create({
      org_id: new Types.ObjectId(orgId),
      title,
      description: dto.description?.trim(),
      created_by: new Types.ObjectId(creatorUserId),
      assigned_to: dto.assigned_to
        ? new Types.ObjectId(dto.assigned_to)
        : undefined,
    });
  }
}
