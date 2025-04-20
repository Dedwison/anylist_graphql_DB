import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { ItemsModule } from './../items/items.module';

import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { ListsModule } from 'src/lists/lists.module';

@Module({
  providers: [
    UsersResolver, 
    UsersService
  ],
  imports: [
    TypeOrmModule.forFeature([ User ]),
    ItemsModule,
    ListsModule
  ],
  exports: [
    TypeOrmModule,
    UsersService
  ]
})
export class UsersModule {}
