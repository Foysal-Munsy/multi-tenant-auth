import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserOrgMapDocument = HydratedDocument<UserOrgMap>;

@Schema()
export class UserOrgMap {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  // @Prop({ type: String, required: true })
  // org_id: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  org_id: Types.ObjectId;

  @Prop({ required: true, default: 'intern' })
  role: string;
}

export const UserOrgMapSchema = SchemaFactory.createForClass(UserOrgMap);
