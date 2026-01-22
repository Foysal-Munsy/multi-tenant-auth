import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema()
export class Organization {
  @Prop({ required: true, unique: true })
  org_id: string;

  @Prop({ required: true })
  org_name: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
