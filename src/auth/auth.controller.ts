import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import {
  NewOrChangeUserInput,
  UserInput,
  UserOutput,
  UserStraightInfo,
} from '../users/users.model';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() user: UserInput): Promise<UserOutput | null> {
    return await this.authService.login(user);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() user: NewOrChangeUserInput,
  ): Promise<UserStraightInfo | null> {
    return await this.authService.createUser(user);
  }

  @Patch('change')
  @HttpCode(HttpStatus.OK)
  async change(
    @Body() user: NewOrChangeUserInput,
  ): Promise<UserStraightInfo | null> {
    return await this.authService.passwordChanger(user);
  }
}
