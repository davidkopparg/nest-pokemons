import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(

      @InjectModel( Pokemon.name )
      private readonly pokemonModel: Model<Pokemon>,
      private readonly configService:ConfigService,

  )  {
    this.defaultLimit = configService.get<number>('defaultLimit');
  }


  async create(createPokemonDto: CreatePokemonDto) {
    
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()
   
    try {
      
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    
    } catch (error) {
      
      this.handleExceptions( error )
        
    }
   
    
  }




  findAll(paginationDto:PaginationDto) {
    
    const {limit = this.defaultLimit , offset = 0 } = paginationDto;

    
    return this.pokemonModel.find()
    .limit(limit)
    .skip(offset)
    .sort({
      no: 1
    })
    .select('no name -_id').exec();
    
  }

  
  async findOne(term: string) {
  
    let pokemon: Pokemon;

    //verificar si existe un poke por id
    if ( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne({ no:term });
    }

    // verificar si es un mongo id
    if ( isValidObjectId (term) ){
      pokemon = await this.pokemonModel.findById( term );
    }
    
    // verificar por name
    if (!pokemon){
      pokemon = await this.pokemonModel.findOne({ name:term.toLocaleLowerCase().trim() });

    }


    if ( !pokemon ) throw new NotFoundException(`Pokemon with id, name or no ${term} not found!`)
    return pokemon;
  }

  
  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
    if ( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try {
      
      await pokemon.updateOne( updatePokemonDto)
      return {...pokemon.toJSON(), ...updatePokemonDto};
    
    } catch (error) {
        this.handleExceptions( error )
        }

   
  }

  
  async remove(id: string) {
   //const pokemon = await this.findOne( id );
   //await pokemon.deleteOne();

   const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id })
    if (deletedCount === 0 )
      throw new BadRequestException( `Pokemon with id ${id} not found ` )
    return;
  }

  private handleExceptions( error :any ){

    if ( error.code === 11000 ){
      throw new BadRequestException(`Pokemon exists en db ${JSON.stringify( error.keyValue)}`);
    }
    throw new InternalServerErrorException(`Cant create Pokemon - Check server logs`);
  

  }

}
