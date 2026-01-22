import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OrganizationGuard } from './guards/organization.guard';

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

  @Post('create-org')
  createOrganization(@Body('org_name') orgName: string) {
    return this.authService.createOrganization(orgName);
  }
  // @Get('me')
  // me(@Headers('authorization') auth: string) {
  //   const token = auth.replace('Bearer ', '');
  //   return this.authService.decode(token);
  // }
}
