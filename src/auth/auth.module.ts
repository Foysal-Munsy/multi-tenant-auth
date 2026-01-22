import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import {
  Organization,
  OrganizationSchema,
} from 'src/schemas/organization.schema';
import { UserOrgMap, UserOrgMapSchema } from 'src/schemas/user-org-map.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    //1. schema register
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: UserOrgMap.name, schema: UserOrgMapSchema },
    ]),
    // 2. JWT configure
    JwtModule.register({
      secret: 'JWT_SECRET',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
