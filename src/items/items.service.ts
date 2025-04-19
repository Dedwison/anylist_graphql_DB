import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { CreateItemInput, UpdateItemInput } from './dto/imputs';
import { PaginationArgs, SearchArgs } from './../common/dto/args';

import { User } from './../users/entities/user.entity';
import { Item } from './entities/item.entity';
@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository( Item )
    private readonly itemRepository : Repository<Item>
  ) {

  }


  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemRepository.create({ ...createItemInput, user })

    try {
      return await this.itemRepository.save( newItem )
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }

  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<Item[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;
    // TODO: Paginar, Filtrar

    const queryBuilder = this.itemRepository.createQueryBuilder()
    .take( limit )
    .skip( offset )
    .where(`"userId" = :userId`, { userId: user.id });

    if( search ) {
      queryBuilder.andWhere('LOWER(name) like :name', { name: `%${ search.toLowerCase() }%`})
    }

    return queryBuilder.getMany();

    // return this.itemRepository.find({ 
    //   take: limit,
    //   skip: offset,
    //   where: {
    //     user: {
    //       id: user.id
    //     },
    //     name: Like(`%${ search?.toLowerCase() }%`)
    //   }
    // });
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemRepository.findOneBy({ id, user: {id: user.id} })
    if(!item) throw new NotFoundException(`Item with ID ${id} not found`)

    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {
    await this.findOne( id, user )
    const item = await this.itemRepository.preload( {...updateItemInput, user} )

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    
    try {
      return await this.itemRepository.save(item);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string, user: User): Promise<Item> {
    // TODO: Soft delete, integridad referencial
    const item = await this.findOne( id, user )
    await this.itemRepository.remove( item )
    return {...item, id};
  }

  async itemCountByUser( user: User ): Promise<number>{

    return this.itemRepository.count({
      where: {
        user: {
          id: user.id
        }
      }
    })
  }
}
