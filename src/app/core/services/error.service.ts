import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private _error = signal<string | null>(null);

  error = computed(() => this._error);

  setError(message: string) {
    this._error.set(message);
  }

  clearError() {
    this._error.set(null);
  }
}
