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

    const newId = Math.random().toString(36).substring(2, 10);
    const nuevoDibujoConId = { ...this.nuevoDibujo, id: newId };

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
      this.mostrarToast('Imagen eliminada');
      this.cdr.detectChanges();
    }
  }
}