import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/imputs';

import { User } from '../users/entities/user.entity';
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

  async findAll(user: User): Promise<Item[]> {
    // TODO: Paginar, Filtrar, por usuarios...

    return this.itemRepository.find({ 
      where: {
        user: {
          id: user.id
        }
      }
    });
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemRepository.findOneBy({ id, user: {id: user.id} })
    if(!item) throw new NotFoundException(`Item with ID ${id} not found`)

    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {

    const item = await this.itemRepository.preload( updateItemInput )

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
}
