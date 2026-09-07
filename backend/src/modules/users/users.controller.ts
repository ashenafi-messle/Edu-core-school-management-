import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Authenticate a user
   * POST /users/login
   */
  @Post('login')
  login(@Body() body: { email: string; password_hash: string }) {
    return this.usersService.login(body.email, body.password_hash);
  }

  /**
   * Create a user for the school
   * POST /users
   */
  @Post()
  create(@Body() body: { email: string; password_hash: string; full_name: string; role: string; phone?: string }) {
    return this.usersService.create(body);
  }

  /**
   * Find all users of the school (Tenant bounded)
   * GET /users
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Find single user (Tenant bounded)
   * GET /users/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Update school user details
   * PUT /users/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  /**
   * Delete user account from school
   * DELETE /users/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
