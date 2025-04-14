import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';

import { CreateUserInput } from './dto/inputs';
import { UpdateUserInput } from './dto/inputs';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

import { SignupInput } from './../auth/dto/inputs';
import { ArrayContainedBy, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {

  private logger: Logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {};

  async create(signupInput: SignupInput): Promise<User> {

    try {
      
      const newUser = this.usersRepository.create( {
        ...signupInput,
        password: bcrypt.hashSync( signupInput.password, 10)
      } );

      return await this.usersRepository.save( newUser );

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll( roles: ValidRoles[]): Promise<User[]> {

    try {
      if( roles.length === 0) return await this.usersRepository.find({
        //? relations No es necesario porque tenemos "lazy" la propiedad 'lastUpdatedBy'
        // relations: {
        //   lastUpdateBy: true
        // }
      });
  
      return this.usersRepository.createQueryBuilder()
      .andWhere( 'ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();   
    } catch (error) {
      this.handleDBErrors(error);
    }

    
  }

  async findOneByEmail(email: string): Promise<User> {
   
    try {
      return await this.usersRepository.findOneByOrFail({ email })
    } catch (error) {
      throw new NotFoundException(`Email ${email} not found`)
    }
  }

  async findOneById( id: string ): Promise<User> {
   
    try {
      return await this.usersRepository.findOneByOrFail({ id })
    } catch (error) {
      throw new NotFoundException(`Email ${id} not found`)
    }
  }

  async update(
    id: string, 
    updateUserInput: UpdateUserInput, 
    updatedBy: User
  ): Promise<User> {
  
    try {
      const user = await this.usersRepository.preload({
        ...updateUserInput,
        id
      });

      if(!user) throw new NotFoundException(`User with id ${id} not found`);

      if( updateUserInput.password) user.password = bcrypt.hashSync(updateUserInput.password, 10);

      user.lastUpdateBy = updatedBy;

      return await this.usersRepository.save( user )
    } catch (error) {
      this.handleDBErrors(error)
    }
    

  }
  async block(id: string, adminUser: User): Promise<User> {
    const userToBlock = await this.findOneById( id );

    userToBlock.isActive = !userToBlock.isActive;
    userToBlock.lastUpdateBy = adminUser;

    return await this.usersRepository.save( userToBlock );
  }

  private handleDBErrors(error: any): never {
    
    if( error.code === '23505'){
      throw new BadRequestException( error.detail.replace('Key ', ''));
    };
    
    this.logger.error(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
