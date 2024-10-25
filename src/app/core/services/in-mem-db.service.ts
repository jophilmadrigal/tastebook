import { Injectable } from '@angular/core';
import {
  InMemoryDbService,
  ParsedRequestUrl,
  RequestInfoUtilities,
  ResponseOptions,
} from 'angular-in-memory-web-api';
import { Recipe } from '../../recipes/recipe.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InMemDbService implements InMemoryDbService {
  createDb() {
    let recipes = [
      { id: 1, recipe: 'Windstorm' },
      { id: 2, recipe: 'Bombasto' },
      { id: 3, recipe: 'Magneta' },
      { id: 4, recipe: 'Tornado' },
    ];
    let users = [
      { id: 1, recipe: 'Windstorm' },
      { id: 2, recipe: 'Bombasto' },
      { id: 3, recipe: 'Magneta' },
      { id: 4, recipe: 'Tornado' },
    ];
    return { recipes, users };
  }

  genId(collections: any[]): number {
    return collections.length > 0
      ? Math.max(...collections.map((collection) => collection.id || 0)) + 1
      : 1;
  }

  // genId<T extends User | Recipe>(collection: T[]): number {
  //   return collection.length > 0
  //     ? Math.max(...collection.map((item) => item.id || 0)) + 1
  //     : 1;
  // }
}
