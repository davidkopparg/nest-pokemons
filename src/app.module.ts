import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedModule } from './seed/seed.module';

import { ConfigModule } from '@nestjs/config';
import { Envconfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';


@Module({
  imports: [

    ConfigModule.forRoot({
      load:[ Envconfiguration ], 
      validationSchema: JoiValidationSchema,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
      }),

      MongooseModule.forRoot( process.env.MONGODB,{
        dbName: 'pokemonsdb'
      } ),

    PokemonModule,

    SeedModule,
    
      
  ],
  controllers: [],
  providers: [],
  
})
export class AppModule {}
