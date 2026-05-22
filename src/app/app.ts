import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawingService, Drawing } from './services/drawing';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  dibujos: Drawing[] = [];
  nuevoDibujo: Drawing = { titulo: '', descripcion: '', imagenUrl: '' };
  mostrarForm = false;
  menuAbierto = false;
  guardando = false;
  toastVisible = false;
  toastMensaje = '';

  constructor(
    private drawingService: DrawingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarGaleria();
  }

  cargarGaleria() {
    this.drawingService.getDrawings().subscribe((data: Drawing[]) => {
      this.dibujos = data;
      this.cdr.detectChanges();
    });
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
    this.cdr.detectChanges();
  }

  openForm() {
    this.mostrarForm = true;
    this.menuAbierto = false;
    this.cdr.detectChanges();
  }

  mostrarToast(mensaje: string) {
    this.toastMensaje = mensaje;
    this.toastVisible = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  agregar() {
    if (this.guardando) return;
    
    if (!this.nuevoDibujo.titulo.trim()) {
      this.mostrarToast('❌ El título es obligatorio');
      return;
    }
    
    if (!this.nuevoDibujo.imagenUrl.trim()) {
      this.mostrarToast('❌ La URL de la imagen es obligatoria');
      return;
    }
    
    this.guardando = true;
    this.cdr.detectChanges();
    
    const newId = Math.random().toString(36).substring(2, 10);
    const nuevoDibujoConId = { 
      ...this.nuevoDibujo, 
      id: newId 
    };
    
    this.dibujos.push(nuevoDibujoConId);
    
    this.mostrarForm = false;
    this.menuAbierto = false;
    this.nuevoDibujo = { titulo: '', descripcion: '', imagenUrl: '' };
    this.guardando = false;
    this.mostrarToast('✅ Dibujo guardado correctamente');
    this.cdr.detectChanges();
  }

  eliminar(id: string) {
    if (confirm('¿Eliminar este dibujo?')) {
      this.dibujos = this.dibujos.filter(d => d.id !== id);
      this.mostrarToast('🗑️ Dibujo eliminado');
      this.cdr.detectChanges();
    }
  }
}