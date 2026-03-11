import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  // Every task belongs to exactly one organization (tenant boundary)
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  org_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigned_to?: Types.ObjectId;

  @Prop({ required: true, default: 'open' })
  status: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
