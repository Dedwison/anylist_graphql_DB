import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SEED_ITEMS, SEED_USERS } from './data/seed-data';

import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';

import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';

@Injectable()
export class SeedService {

    private isProd: boolean;
    constructor(
        private readonly configService: ConfigService,

        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService
    ){
        this.isProd = configService.get('STATE') === 'prod';
    }

    async executeSeed(): Promise<boolean>{
        if( this.isProd ) throw new UnauthorizedException('We can not run SEED on Prod');

        await this.deleteDatabase()

        // crear usuarios
        const user = await this.loadUsers();

        // crear items
        await this.loadItems(user);

        return true;
    }

    async deleteDatabase(){
        // borrar items
        await this.itemsRepository.createQueryBuilder()
        .delete()
        .where({})
        .execute()

        // borrar users
        await this.usersRepository.createQueryBuilder()
        .delete()
        .where({})
        .execute()
    }

    async loadUsers(): Promise<User>{
        const users: User[] = [];

        for( const user of SEED_USERS ){
            users.push( await this.usersService.create( user ))
        }

        return users[0];
    }

    async loadItems( user: User ): Promise<void>{
        const itemsPromises: Promise<Item>[] = [];

        for(const item of SEED_ITEMS){
            itemsPromises.push( this.itemsService.create(item, user))
        }

        await Promise.all( itemsPromises )
    }
}
