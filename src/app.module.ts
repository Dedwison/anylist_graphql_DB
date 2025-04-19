import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';


@Module({
  imports: [
    ConfigModule.forRoot(),

    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [
        /*importar módulos*/ 
        AuthModule
      ],
      inject: [
        /*inyectar servicios*/
        JwtService
      ],
      useFactory: async(jwtService: JwtService) => ({
        playground: false,
        autoSchemaFile: join( process.cwd(), 'src/schema.gql'),
        plugins: [
          ApolloServerPluginLandingPageLocalDefault()
        ],
        context({ req }) {
          const token = req.headers.authorization?.replace('Bearer ', '');
          if(!token) throw new Error('Token needed')

          //! Comentar para renovar el token
          const payload = jwtService.decode( token )
          if(!payload) throw new Error('Token not valid')
        }
      })
    }),

    //? Configuración básica
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   playground: false,
    //   autoSchemaFile: join( process.cwd(), 'src/schema.gql'),
    //   plugins: [
    //     ApolloServerPluginLandingPageLocalDefault()
    //   ],
    // }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true, // cambiar a false al pasa a producción
      autoLoadEntities: true,
    }),
    ItemsModule,
    UsersModule,
    AuthModule,
    SeedModule
  ],
  controllers: [ ],
  providers: [],
})
export class AppModule {}
