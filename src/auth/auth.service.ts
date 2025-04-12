import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { SignupInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from './../users/users.service';

@Injectable()
export class AuthService {

    constructor(
        private readonly usesrService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    private getJwtToken( userId: string ) {
        return this.jwtService.sign({ id: userId })
    }

    async signup( signupInput:SignupInput): Promise<AuthResponse> {

        // TODO: crear usuario
        const user = await this.usesrService.create( signupInput )

        // TODO: crear JWT
        const token = this.getJwtToken(user.id);

        return { token, user }
    }

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        
        const { email, password } = loginInput;
        
        const user = await this.usesrService.findOneByEmail(email);

        if( !bcrypt.compareSync( password, user.password )) {
            throw new BadRequestException('Email/password do not match')
        }

        const token = this.getJwtToken(user.id);
        return {
            token,
            user
        }
    }
}
