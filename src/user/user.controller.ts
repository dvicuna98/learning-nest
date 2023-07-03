import {Body, Controller, Get, Patch, Req, UseGuards} from '@nestjs/common';
import {JwtGuard} from "../auth/guard";
import {GetUser} from "../auth/decorator";
import {User} from "@prisma/client";
import {UserService} from "./user.service";
import {EditUserDto} from "./dto/edit-user.dto";

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Get('me')
    getme(@GetUser() user:User) {

        return user;
    }

    @Patch()
    edituser(
        @GetUser('id') userId:number,
        @Body() dto:EditUserDto
    ){

        return this.userService.editUser(userId,dto);

    }
}
