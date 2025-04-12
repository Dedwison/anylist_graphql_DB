import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "./../../users/entities/user.entity";


@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        private configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get<string>('JWT_SECRET') || '',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    };

    async validate(...payload: any[]): Promise<User> {
        console.log({ payload })
        throw new UnauthorizedException("Token not valid.");
    }

}