import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationGuard } from 'src/auth/guards/organization.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Task, TaskSchema } from './task.schema';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),

    // OrganizationGuard needs JwtService; easiest is to register JwtModule here too.
    // Keep secret consistent with AuthModule.
    JwtModule.register({
      secret: 'JWT_SECRET',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService, OrganizationGuard, RolesGuard],
})
export class TasksModule {}
