import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';

import { Item } from './../items/entities/item.entity';
import { User } from './../users/entities/user.entity';
import { List } from './../lists/entities/list.entity';
import { ListItem } from './../list-item/entities/list-item.entity';

import { UsersService } from './../users/users.service';
import { ItemsService } from './../items/items.service';
import { ListsService } from './../lists/lists.service';
import { ListItemService } from './../list-item/list-item.service';

@Injectable()
export class SeedService {

    private isProd: boolean;
    constructor(
        private readonly configService: ConfigService,

        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(List)
        private readonly listRepository: Repository<List>,

        @InjectRepository(ListItem)
        private readonly ListItemsRepository: Repository<ListItem>,

        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listsService: ListsService,
        private readonly listItemService: ListItemService,
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

        // crear listas
        const list = await this.loadLists( user );

        // crear listItems
        const items = await this.itemsService.findAll(user, {limit: 15, offset: 0}, {});
        await this.loadListItem( list, items )

        return true;
    }

    async deleteDatabase(){

         // borrar listItems
         await this.ListItemsRepository.createQueryBuilder()
         .delete()
         .where({})
         .execute()

        // borrar list
        await this.listRepository.createQueryBuilder()
        .delete()
        .where({})
        .execute()

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


    async loadLists( user: User ): Promise<List>{
        const lists: List[] = [];

        for( const list of SEED_LISTS ){
            lists.push( await this.listsService.create( list, user ))
        }

        return lists[0]; 
    }

    async loadListItem( list: List, items: Item[]) {
        const promises: Promise<ListItem>[] = []
    
        for (const item of items) {
            promises.push(this.listItemService.create({
                quantity: 1,
                completed: Math.random() > 0.5,                
                listId: list.id,
                itemId: item.id
            }))
        }
        
        await Promise.all(promises)
    }
}
