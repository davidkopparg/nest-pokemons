import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokemonResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';

@Injectable()
export class SeedService {

  constructor(

    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
)  {}

  private readonly axios : AxiosInstance = axios;

  async executeSeed(){
    const { data } = await this.axios.get<PokemonResponse>  ('https://pokeapi.co/api/v2/pokemon?limit=10');
    
    await this.pokemonModel.deleteMany({})

    data.results.forEach(async( {name ,url}) => {
      
      const segments = url.split('/')
      const no :number= +segments[segments.length -2 ];
      console.log(name, no)
      const pokemon = {
        'no':no,
        'name': name,
      }

      await this.pokemonModel.insertMany(pokemon)
    } )
    
    return 'Seed Executed';
    
  }

}
