import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    // Goal:
    // - If org does NOT exist yet: create it and make the registering user the 'owner'
    // - If org already exists: register user as a normal 'member'

    // 0. Enforce unique email (User schema has unique index, but we return a clean 400)
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // 1. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 2. Create user
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    // 3. Find organization by name
    let organization = await this.orgModel.findOne({
      org_name: dto.org_name,
    });

    // We'll decide role based on whether the org is newly created or pre-existing
    let role: string = 'member';

    // 4. If org does not exist, create it
    if (!organization) {
      organization = await this.orgModel.create({
        org_name: dto.org_name,
      });

      // First user who creates the org becomes the org owner
      role = 'owner';
    }

    // 5. Create user-org mapping with role
    // (If you later add an "invite" flow, you might only create this mapping after approval.)
    const existingMapping = await this.mapModel.findOne({
      user_id: user._id,
      org_id: organization._id,
    });
    if (existingMapping) {
      throw new BadRequestException(
        'User already belongs to this organization',
      );
    }

    await this.mapModel.create({
      user_id: user._id,
      org_id: organization._id,
      role,
    });

    return {
      message: 'User registered successfully as a ' + role + ' of the company',
    };
  }

  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Fetch user-organization mappings (with organization details)
    const mappings = await this.mapModel
      .find({ user_id: user._id })
      .populate('org_id');

    // 4. Build organization payload from mappings
    const organizations = mappings.map((m: any) => ({
      org_id: m.org_id._id,
      org_name: m.org_id.org_name,
      role: m.role,
    }));

    // 5. Create JWT payload
    const payload = {
      sub: user._id,
      email: user.email,
      organizations,
    };

    // 6. Sign and return token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  //   role
  async assignUserToOrganization(userId: string, orgId: string, role: string) {
    const existing = await this.mapModel.findOne({
      user_id: userId,
      org_id: orgId,
    });

    if (existing) {
      throw new Error('User already belongs to this organization');
    }

    const { Types } = await import('mongoose');

    return this.mapModel.create({
      user_id: new Types.ObjectId(userId),
      org_id: new Types.ObjectId(orgId),
      role,
    });
  }
}
