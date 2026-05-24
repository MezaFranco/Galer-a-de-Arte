import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('carouselRef') carouselRef!: ElementRef;

  dibujos: Drawing[] = [];
  nuevoDibujo: Drawing = { titulo: '', descripcion: '', imagenUrl: '' };
  mostrarForm = false;
  menuAbierto = false;
  guardando = false;
  toastVisible = false;
  toastMensaje = '';
  lightboxAbierto = false;
  lightboxImagen = '';
  lightboxTitulo = '';
  
  // NUEVAS VARIABLES PARA LA EDICIÓN
  editando = false; 

  private intervaloAuto: any;

  constructor(
    private drawingService: DrawingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarGaleria();
  }

  ngOnDestroy() {
    this.detenerAutoSlide();
  }

  iniciarAutoSlide() {
    this.detenerAutoSlide();
    this.intervaloAuto = setInterval(() => {
      const el = this.carouselRef?.nativeElement;
      if (!el) return;
      const cardWidth = 260 + 24;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 2500);
  }

  detenerAutoSlide() {
    if (this.intervaloAuto) {
      clearInterval(this.intervaloAuto);
      this.intervaloAuto = null;
    }
  }

  cargarGaleria() {
    this.drawingService.getDrawings().subscribe((data: Drawing[]) => {
      this.dibujos = data;
      this.cdr.detectChanges();
      setTimeout(() => this.iniciarAutoSlide(), 500);
    });
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
    this.cdr.detectChanges();
  }

  openForm() {
    this.editando = false; // Nos aseguramos de que va a agregar uno nuevo
    this.nuevoDibujo = { titulo: '', descripcion: '', imagenUrl: '' };
    this.mostrarForm = true;
    this.menuAbierto = false;
    this.cdr.detectChanges();
  }

  // NUEVA FUNCIÓN: Abre el formulario cargando los datos del dibujo a editar
  editar(dibujo: Drawing) {
    this.editando = true;
    // Usamos la destructuración ({...}) para clonar el objeto y que no se modifique en la tarjeta mientras escribes
    this.nuevoDibujo = { ...dibujo }; 
    this.mostrarForm = true;
    this.cdr.detectChanges();
  }

  // NUEVA FUNCIÓN: Resetea el estado del formulario al cerrar
  cerrarFormulario() {
    this.mostrarForm = false;
    this.editando = false;
    this.nuevoDibujo = { titulo: '', descripcion: '', imagenUrl: '' };
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

  abrirLightbox(dibujo: Drawing) {
    this.lightboxImagen = dibujo.imagenUrl;
    this.lightboxTitulo = dibujo.titulo;
    this.lightboxAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarLightbox() {
    this.lightboxAbierto = false;
    this.lightboxImagen = '';
    this.lightboxTitulo = '';
    this.cdr.detectChanges();
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

    if (this.editando) {
      // ------ MODO EDICIÓN (PUT) ------
      this.drawingService.updateDrawing(this.nuevoDibujo).subscribe({
        next: (dibujoActualizado) => {
          // Buscamos el dibujo en el arreglo local y lo reemplazamos con los nuevos datos
          this.dibujos = this.dibujos.map(d => d.id === dibujoActualizado.id ? dibujoActualizado : d);
          
          this.cerrarFormulario();
          this.guardando = false;
          this.mostrarToast('Imagen actualizada correctamente');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.guardando = false;
          this.mostrarToast('Error al actualizar en el servidor');
          this.cdr.detectChanges();
        }
      });
    } else {
      // ------ MODO CREACIÓN (POST) ------
      this.drawingService.addDrawing(this.nuevoDibujo).subscribe({
        next: (dibujoGuardado) => {
          this.dibujos.push(dibujoGuardado);
          this.cerrarFormulario();
          this.guardando = false;
          this.mostrarToast('Imagen guardada correctamente');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.guardando = false;
          this.mostrarToast('Error al conectar con el servidor');
          this.cdr.detectChanges();
        }
      });
    }
  }

  eliminar(id: string) {
    if (confirm('¿Eliminar esta imagen?')) {
      this.drawingService.deleteDrawing(id).subscribe({
        next: () => {
          this.dibujos = this.dibujos.filter(d => d.id !== id);
          this.mostrarToast('Imagen eliminada');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.mostrarToast('No se pudo eliminar en el servidor');
        }
      });
    }
  }
}