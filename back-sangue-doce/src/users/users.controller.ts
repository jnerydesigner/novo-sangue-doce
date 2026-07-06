import { AuthGuard } from "@app/@infra/guard/auth.guard";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Public } from "@app/auth/decorators/public.decorator";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import type { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get("search")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findEmail(@Query("email") email: string) {
    return this.usersService.findEmail(email);
  }

  @Get(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }
}
