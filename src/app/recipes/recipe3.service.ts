import { Injectable, signal, computed, inject } from '@angular/core';
import { Recipe } from './recipe.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, Observable, throwError, shareReplay } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { ErrorService } from '../core/services/error.service';

@Injectable({
  providedIn: 'root',
})
export class Recipe3Service {
  private apiURL = environment.apiURL;

  private http = inject(HttpClient);
  private errorService = inject(ErrorService);

  private _recipes = signal<Recipe[]>([]);
  private _loading = signal<boolean>(false);
  private _formData = signal<Recipe | null>(null);
  private _selectedId = signal<number | null>(null);

  recipes = computed(() => this._recipes());
  loading = computed(() => this._loading());
  formData = computed(() => this._formData());
  selectedId = computed(() => this._selectedId());

  constructor() {
    this.getAll();
  }

  private _getAll() {
    return this.http.get<Recipe[]>(this.apiURL);
  }

  private _getOne(id: number) {
    return this.http.get<Recipe>(`${this.apiURL}/${id}`);
  }

  private _create(recipe: Recipe) {
    return this.http.post<Recipe>(this.apiURL, recipe);
  }

  private _delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  private _update(recipe: Recipe): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiURL}/${recipe.id}`, recipe);
  }

  private getAll() {
    this._loading.set(true);
    this._getAll()
      .pipe(
        tap((recipes) => {
          this._recipes.set(recipes);
          this._loading.set(false);
        }),
        catchError((error) => this.handleError(error))
      )
      .subscribe();
  }

  getOne() {
    const id = this._selectedId();
    if (id !== null) {
      this._loading.set(true);
      this._getOne(id)
        .pipe(
          tap(() => this._loading.set(false)),
          catchError((error) => this.handleError(error))
        )
        .subscribe();
    }
  }

  create() {
    const formData = this._formData();
    if (formData) {
      this._loading.set(true);
      this._create(formData)
        .pipe(
          tap((newRecipe) => {
            this._recipes.set([...this._recipes(), newRecipe]);
            this._loading.set(false);
          }),
          catchError((error) => this.handleError(error))
        )
        .subscribe();
    }
  }

  delete() {
    const id = this._selectedId();
    if (id !== null) {
      this._loading.set(true);
      this._delete(id)
        .pipe(
          tap(() => {
            const deletedRecipe = this._recipes().filter(
              (recipe) => recipe.id !== id
            );
            this._recipes.set(deletedRecipe);
            this._loading.set(false);
          }),
          catchError((error) => this.handleError(error))
        )
        .subscribe();
    }
  }

  update() {
    const formData = this._formData();
    const id = this._selectedId();
    if (formData && id !== null) {
      this._loading.set(true);
      this._update(formData)
        .pipe(
          tap((updatedRecipe) => {
            const updatedRecipes = this._recipes().map((r) =>
              r.id === updatedRecipe.id ? updatedRecipe : r
            );
            this._recipes.set(updatedRecipes);
            this._loading.set(false);
          }),
          catchError((error) => this.handleError(error))
        )
        .subscribe();
    }
  }

  setFormData(recipe: Recipe | null) {
    this._formData.set(recipe);
  }

  setSelectedId(id: number | null) {
    this._selectedId.set(id);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} ${error.message}`;
    }

    this.errorService.setError(errorMessage);

    return throwError(() => new Error(errorMessage));
  }
}
