import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/imputs';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository( Item )
    private readonly itemRepository : Repository<Item>
  ) {

  }


  async create(createItemInput: CreateItemInput): Promise<Item> {
    const newItem = this.itemRepository.create( createItemInput )

    try {
      return await this.itemRepository.save( newItem )
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }

  }

  async findAll(): Promise<Item[]> {
    // TODO: Paginar, Filtrar, por usuarios...

    return this.itemRepository.find();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemRepository.findOneBy({ id })
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

  async remove(id: string): Promise<Item> {
    // TODO: Soft delete, integridad referencial
    const item = await this.findOne( id )
    await this.itemRepository.remove( item )
    return {...item, id};
  }
}
