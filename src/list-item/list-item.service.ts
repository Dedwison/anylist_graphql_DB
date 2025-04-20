import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ListItem } from './entities/list-item.entity';
import { List } from './../lists/entities/list.entity';

import { PaginationArgs, SearchArgs } from './../common/dto/args';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';

@Injectable()
export class ListItemService {

  constructor(
    @InjectRepository( ListItem )
    private readonly listItemsRepository: Repository<ListItem>
  ){}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = createListItemInput;
    
    const newListItem = this.listItemsRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId }
    })

    return this.listItemsRepository.save( newListItem )
  }

  async findAll( list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs ): Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemsRepository.createQueryBuilder('listItem')
    .innerJoin('listItem.item', 'item')
    .take( limit )
    .skip( offset )
    .where(`"listId" = :listId`, { listId: list.id });

    if( search ) {
      queryBuilder.andWhere('LOWER(item.name) like :name', { name: `%${ search.toLowerCase() }%`})
    }

    return queryBuilder.getMany();
  }

  async countListItemByList( list: List): Promise<number> {
    return this.listItemsRepository.count({
      where: {
        list: {
          id: list.id
        }
      }
    })
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} listItem`;
  // }

  // update(id: number, updateListItemInput: UpdateListItemInput) {
  //   return `This action updates a #${id} listItem`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} listItem`;
  // }
}
