import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from 'src/schemas/organization.schema';
import { UserOrgMap } from 'src/schemas/user-org-map.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    // 1.User
    @InjectModel(User.name) private userModel: Model<User>,
    // 2.Organization
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
    // 3.UserOrgMap
    @InjectModel(UserOrgMap.name) private mapModel: Model<UserOrgMap>,
    // 4.Jwt
    private jwtService: JwtService,
  ) {}
}
