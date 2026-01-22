/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from 'src/schemas/organization.schema';
import { UserOrgMap } from 'src/schemas/user-org-map.schema';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: 'member',
    });

    if (dto.org_id) {
      const org = await this.orgModel.findOne({ org_id: dto.org_id });
      if (org) {
        await this.mapModel.create({
          user_id: user._id,
          org_id: org.org_id,
        });
      }
    }

    return { message: 'User registered successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException();

    // fetch user-organization
    const mappings = await this.mapModel.find({ user_id: user._id });
    // extract org id
    const orgIds = mappings.map((m) => m.org_id);
    // fetch organization details
    const orgs = await this.orgModel.find({
      org_id: { $in: orgIds },
    });

    const organizations = orgs.map((org) => ({
      org_id: org.org_id,
      org_name: org.org_name,
    }));

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      organizations,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  decode(token: string) {
    return this.jwtService.decode(token);
  }
}
