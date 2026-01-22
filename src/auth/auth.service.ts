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

    // 4. If org does not exist, create it
    if (!organization) {
      organization = await this.orgModel.create({
        org_name: dto.org_name,
      });
    }

    // 5. Create user-org mapping with role
    await this.mapModel.create({
      user_id: user._id,
      org_id: organization._id,
      role: 'member',
    });

    return { message: 'User registered successfully' };
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

  //   decode(token: string) {
  //     return this.jwtService.decode(token);
  //   }
}
