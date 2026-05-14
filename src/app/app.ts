import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawingService, Drawing } from './services/drawing';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',  // ← CAMBIADO: .app.component.html → .app.html
  styleUrls: ['./app.css']     // ← CAMBIADO: .app.component.css → .app.css
})
export class AppComponent implements OnInit {  // ← CAMBIADO: App → AppComponent
  dibujos: Drawing[] = [];
  nuevoDibujo: Drawing = { titulo: '', descripcion: '', imagenUrl: '' };

  constructor(private drawingService: DrawingService) {}

  ngOnInit() {
    this.cargarGaleria();
  }

  cargarGaleria() {
    this.drawingService.getDrawings().subscribe((data: Drawing[]) => {  // ← Agregado tipo
      this.dibujos = data;
    });
  }

  agregar() {
    this.drawingService.addDrawing(this.nuevoDibujo).subscribe(() => {
      this.cargarGaleria();
      this.nuevoDibujo = { titulo: '', descripcion: '', imagenUrl: '' };
    });
  }

  eliminar(id: number) {
    this.drawingService.deleteDrawing(id).subscribe(() => {
      this.cargarGaleria();
    });
  }
}