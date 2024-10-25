import { Injectable, signal, computed, inject } from '@angular/core';
import { Recipe } from './recipe.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  tap,
  catchError,
  Observable,
  throwError,
  shareReplay,
  finalize,
} from 'rxjs';

import { environment } from '../../environments/environment.development';
import { ErrorService } from '../core/services/error.service';
import { toSignal } from '@angular/core/rxjs-interop';

export interface State {
  isLoading: boolean;
  recipes: Recipe[];
  recipe: {};
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private apiURL = environment.apiURL;

  private http = inject(HttpClient);

  private state = signal<State>({
    isLoading: false,
    recipes: [],
    recipe: {},
    error: null,
  });

  isLoading = computed(() => this.state().isLoading);
  recipes = computed(() => this.state().recipes);
  recipe = computed(() => this.state().recipe);
  error = computed(() => this.state().error);

  constructor() {
    this.getAll();
  }

  private setLoading(isLoading: boolean) {
    this.state.update((state) => ({ ...state, isLoading }));
  }

  private setRecipes(recipes: Recipe[]) {
    this.state.update((state) => ({ ...state, recipes }));
  }

  private setRecipe(recipe: Recipe) {
    this.state.update((state) => ({ ...state, recipe }));
  }

  private setError(error: string | null) {
    this.state.update((state) => ({ ...state, error }));
  }

  private getAll() {
    this.setLoading(true);
    this.http
      .get<Recipe[]>(this.apiURL)
      .pipe(
        tap((recipes) => {
          this.setRecipes(recipes);
          this.setLoading(false);
        }),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      )
      .subscribe();
  }

  private getOne(id: number) {
    this.setLoading(true);
    this.http
      .get<Recipe>(this.apiURL)
      .pipe(
        tap((recipe) => {
          this.setRecipe(recipe);
          this.setLoading(false);
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      )
      .subscribe();
  }

  create(recipe: Recipe) {
    this.setLoading(true);
    this.http
      .post<Recipe>(this.apiURL, recipe)
      .pipe(
        tap((newRecipe) => {
          this.setRecipes([...this.state().recipes, newRecipe]);
          this.setLoading(false);
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      )
      .subscribe();
  }

  delete(recipeId: number) {
    this.setLoading(true);
    this.http
      .delete<void>(`${this.apiURL}/${recipeId}`)
      .pipe(
        tap(() => {
          const deletedRecipe = this.state().recipes.filter(
            (recipe) => recipe.id !== recipeId
          );
          this.setRecipes(deletedRecipe);
          this.setLoading(false);
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      )
      .subscribe();
  }

  update(recipe: Recipe) {
    this.setLoading(true);
    this.http
      .put<Recipe>(`${this.apiURL}/${recipe.id}`, recipe)
      .pipe(
        tap((updatedRecipe) => {
          const updatedRecipes = this.state().recipes.map((recipe) =>
            recipe.id === updatedRecipe.id ? updatedRecipe : recipe
          );
          this.setRecipes(updatedRecipes);
          this.setLoading(false);
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      )
      .subscribe();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} ${error.message}`;
    }

    this.setError(errorMessage);
    this.setLoading(false);

    return throwError(() => new Error(errorMessage));
  }
}
