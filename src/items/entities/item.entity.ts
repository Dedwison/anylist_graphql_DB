import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './../../users/entities/user.entity'; 
import { ListItem } from 'src/list-item/entities/list-item.entity';

@Entity({name:'items'})
@ObjectType()
export class Item {
 
  @PrimaryGeneratedColumn('uuid')
  @Field( () => ID )
  id: string;

  @Column()
  @Field( () => String )
  name: string;

  // @Column()
  // @Field( () => Float )
  // quantity: number;

  @Column({ nullable: true })
  @Field( () => String, { nullable: true } )
  quantityUnits?: string; // g, ml, kg, tsp

  //stores
  //users
  @ManyToOne( () => User, (user) => user.items, { nullable: false, eager: true } )
  @Index('userId-index')
  @Field( () => User )
  user: User;

  @OneToMany( () => ListItem, (listItem) => listItem.item, { lazy: true } )
  @Field( () => [ListItem])
  listItem: ListItem[] 

}
