import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserOrgMapDocument = HydratedDocument<UserOrgMap>;

@Schema()
export class UserOrgMap {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  // Store the org_id value from the User document (not an Organization ObjectId ref)
  @Prop({ type: String, required: true })
  org_id: string;
}

export const UserOrgMapSchema = SchemaFactory.createForClass(UserOrgMap);
