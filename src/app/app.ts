import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
export class AppComponent implements OnInit, OnDestroy {
  dibujos: Drawing[] = [];
  nuevoDibujo: Drawing = { titulo: '', descripcion: '', imagenUrl: '' };
  mostrarForm = false;
  menuAbierto = false;
  guardando = false;
  toastVisible = false;
  toastMensaje = '';
  indiceActual = 0;
  private intervaloAuto: any;

  constructor(
    private drawingService: DrawingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarGaleria();
    this.iniciarAutoSlide();
  }

  ngOnDestroy() {
    this.detenerAutoSlide();
  }

  iniciarAutoSlide() {
    if (this.intervaloAuto) {
      clearInterval(this.intervaloAuto);
    }
    this.intervaloAuto = setInterval(() => {
      if (this.dibujos.length > 0) {
        this.siguienteSlide();
        this.cdr.detectChanges();
      }
    }, 4000);
  }

  detenerAutoSlide() {
    if (this.intervaloAuto) {
      clearInterval(this.intervaloAuto);
      this.intervaloAuto = null;
    }
  }

  reiniciarAutoSlide() {
    this.detenerAutoSlide();
    this.iniciarAutoSlide();
  }

  cargarGaleria() {
    this.drawingService.getDrawings().subscribe((data: Drawing[]) => {
      this.dibujos = data;
      this.indiceActual = 0;
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

  siguienteSlide() {
    if (this.dibujos.length === 0) return;
    // Avanzar al siguiente slide (derecha a izquierda)
    this.indiceActual = (this.indiceActual + 1) % this.dibujos.length;
    this.scrollAlSlide(this.indiceActual);
    this.cdr.detectChanges();
  }

  anteriorSlide() {
    if (this.dibujos.length === 0) return;
    // Retroceder al slide anterior
    this.indiceActual = (this.indiceActual - 1 + this.dibujos.length) % this.dibujos.length;
    this.scrollAlSlide(this.indiceActual);
    this.cdr.detectChanges();
  }

  irAlSlide(indice: number) {
    this.indiceActual = indice;
    this.reiniciarAutoSlide();
    this.scrollAlSlide(indice);
    this.cdr.detectChanges();
  }

  scrollAlSlide(indice: number) {
    setTimeout(() => {
      const elementos = document.querySelectorAll('.carrusel-item');
      if (elementos && elementos[indice]) {
        elementos[indice].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        });
      }
    }, 50);
  }

  agregar() {
    if (this.guardando) return;
    
    if (!this.nuevoDibujo.titulo.trim()) {
      this.mostrarToast('El título es obligatorio');
      return;
    }
    
    if (!this.nuevoDibujo.imagenUrl.trim()) {
      this.mostrarToast('La URL de la imagen es obligatoria');
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
    this.mostrarToast('Imagen guardada correctamente');
    this.cdr.detectChanges();
  }

  eliminar(id: string) {
    if (confirm('¿Eliminar esta imagen?')) {
      this.dibujos = this.dibujos.filter(d => d.id !== id);
      if (this.indiceActual >= this.dibujos.length && this.dibujos.length > 0) {
        this.indiceActual = this.dibujos.length - 1;
      }
      this.mostrarToast('Imagen eliminada');
      this.cdr.detectChanges();
    }
  }
}