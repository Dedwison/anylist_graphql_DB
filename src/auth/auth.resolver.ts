import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Query } from '@nestjs/common';
import { SignupInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response';

@Resolver()
export class AuthResolver {

  constructor(
    private readonly authService: AuthService
  ) {}

  @Mutation( () => AuthResponse, { name: 'signup'})
  async signup(
    @Args('signupInput') signupInput: SignupInput
  ): Promise<AuthResponse> {
    return this.authService.signup( signupInput )
  }

  @Mutation( () => AuthResponse, { name: 'login'})
  async login(
    @Args('loginInput') loginInput: LoginInput
  ): Promise<AuthResponse> {
    return this.authService.login( loginInput )
  }

  // @Query( , { name: 'revalidate'})
  // async revalidateToken() {
  //   return this.authService.revalidateToken()
  // }

}
