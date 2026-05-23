import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Drawing {
  id?: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class DrawingService {
  private apiUrl = 'http://localhost:3000/drawings';

  constructor(private http: HttpClient) {}

  getDrawings(): Observable<Drawing[]> {
    return this.http.get<Drawing[]>(this.apiUrl);
  }

  addDrawing(drawing: Drawing): Observable<Drawing> {
    return this.http.post<Drawing>(this.apiUrl, drawing);
  }

  deleteDrawing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}