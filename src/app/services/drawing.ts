import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  private drawingsLocal: Drawing[] = [
    {
      id: "1",
      titulo: "Picle Rick",
      descripcion: "Dibujo de paisaje con técnica digital",
      imagenUrl: "assets/images/PiccoloRick.jpg"
    },
    {
      id: "2",
      titulo: "Pegatina",
      descripcion: "Retrato a lápiz",
      imagenUrl: "assets/images/PresaFacil.jpg"
    },
    {
      id: "3",
      titulo: "Picle Rick",
      descripcion: "No se",
      imagenUrl: "assets/images/Bestia1.jpg"
    }
  ];

  constructor() { }

  getDrawings(): Observable<Drawing[]> {
    return of([...this.drawingsLocal]).pipe(delay(300));
  }

  addDrawing(drawing: Drawing): Observable<Drawing> {
    const newId = Math.random().toString(36).substring(2, 10);
    const newDrawing = { ...drawing, id: newId };
    this.drawingsLocal.push(newDrawing);
    return of(newDrawing).pipe(delay(500));
  }

  deleteDrawing(id: string): Observable<void> {
    this.drawingsLocal = this.drawingsLocal.filter(d => d.id !== id);
    return of(void 0).pipe(delay(300));
  }
}