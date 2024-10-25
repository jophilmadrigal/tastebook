import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { Recipe2Service } from './recipe2.service';
import { Recipe } from './recipe.model';
import { tap } from 'rxjs';
import { RecipeService } from './recipe.service';
import { ErrorService } from '../core/services/error.service';

@Component({
  selector: 'app-recipe',
  template: `
    @for (rec of recipes(); track rec.id) {
    <div>{{ rec.id }}</div>
    <div>{{ rec.recipe }}</div>
    <button (click)="delete(rec.id!)" type="button" class="btn btn-primary">
      delete
    </button>
    <button (click)="update(rec.id!)" type="button" class="btn btn-danger">
      update
    </button>
    }

    <button (click)="add()" type="button" class="btn btn-primary">add</button>
  `,
})
export class RecipeComponent {
  recipeService = inject(RecipeService);

  recipes = this.recipeService.recipes;

  e = effect(() => {
    const error = this.recipeService.error;
    if (error() !== null) alert(this.recipeService.error());
  });

  add() {
    this.recipeService.create({ recipe: 'new recipe' });
  }

  delete(id: number) {
    this.recipeService.delete(id);
  }

  update(id: number) {
    this.recipeService.update({ id, recipe: 'updated recipe' });
  }
}
