import { Controller, Get, Post, Body, Param, Query, Put, Delete, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber } from 'class-validator';

class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  password?: string;
}

class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;
}

class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  streak?: number;
}

class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

@ApiTags('Authentication & User Management')
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new student account' })
  async register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto.email, dto.name);
  }

  @Post('auth/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login student account' })
  async login(@Body() dto: LoginDto) {
    return this.usersService.login(dto.email);
  }

  @Post('auth/google')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate with Google ID Token' })
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.usersService.googleLogin(dto.idToken);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users (Admin)' })
  async getUsers(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const limit = take ? parseInt(take, 10) : 50;
    const offset = skip ? parseInt(skip, 10) : 0;
    return this.usersService.findAll(limit, offset);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get details of a single user' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update a user (Admin)' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto.name, dto.email, dto.streak);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user (Admin)' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('feedbacks')
  @ApiOperation({ summary: 'Submit feedback (Student)' })
  async createFeedback(@Body() dto: CreateFeedbackDto) {
    return this.usersService.createFeedback(dto.userId, dto.content);
  }

  @Get('feedbacks')
  @ApiOperation({ summary: 'List all feedbacks (Admin)' })
  async getFeedbacks() {
    return this.usersService.findAllFeedbacks();
  }
}
