import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  mergeMap,
  tap,
  catchError,
  EMPTY,
  throwError,
} from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Recipe } from './recipe.model';

@Injectable({
  providedIn: 'root',
})
export class Recipe2Service {
  apiURL = environment.apiURL;

  private _recipes = signal<Recipe[]>([]);

  recipes = computed(() => this._recipes());

  constructor(private http: HttpClient) {
    this.fetchAllRecipes();
  }

  private fetchAllRecipes() {
    this.getAll().subscribe();
  }

  private getAll() {
    return this.http.get<Recipe[]>(this.apiURL).pipe(
      tap((recipes) => this._recipes.set(recipes)),
      catchError((error) => this.handleError(error))
    );
  }

  private getOne(id: number) {
    return toSignal(
      this.http
        .get<Recipe>(`${this.apiURL}/${id}`)
        .pipe(catchError((error) => this.handleError(error)))
    );
  }

  create(recipe: Recipe) {
    return this.http.post<Recipe>(this.apiURL, recipe).pipe(
      tap((newRecipe) => this._recipes.set([...this.recipes(), newRecipe])),
      catchError((error) => this.handleError(error))
    );
  }

  delete(id: number) {
    return this.http.delete(`${this.apiURL}/${id}`).pipe(
      tap(() =>
        this._recipes.set(this._recipes().filter((recipe) => recipe.id !== id))
      ),
      catchError((error) => this.handleError(error))
    );
  }

  update(recipe: Recipe) {
    return this.http.put<Recipe>(`${this.apiURL}/${recipe.id}`, recipe).pipe(
      tap((updatedRecipe) => {
        const updatedRecipes = this._recipes().map((recipe) =>
          recipe.id === updatedRecipe.id ? updatedRecipe : recipe
        );
        this._recipes.set(updatedRecipes);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
