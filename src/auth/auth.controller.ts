import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OrganizationGuard } from './guards/organization.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(OrganizationGuard)
  @Get('organization-details')
  getOrganization(@Req() req) {
    return {
      user: req.user,
      organization: req.organization,
    };
  }

  @Post('org/assign-user')
  @UseGuards(OrganizationGuard, RolesGuard)
  @Roles('owner')
  assignUserToOrganization(
    @Req() req,
    @Body('user_id') userId: string,
    @Body('role') role: string,
  ) {
    return this.authService.assignUserToOrganization(
      userId,
      req.organization.org_id,
      role,
    );
  }
}
