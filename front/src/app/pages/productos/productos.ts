import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto';
import { Categoria } from '../../models/categoria';
import { Marca } from '../../models/marca';
import { Local } from '../../models/local';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { MarcaService } from '../../services/marca.service';
import { LocalService } from '../../services/local.service';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { TarjetaProducto } from '../../components/tarjeta-producto/tarjeta-producto';

@Component({
  selector: 'app-productos',
  imports: [TarjetaProducto],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class Productos implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private marcaService = inject(MarcaService);
  private localService = inject(LocalService);
  public pedidoService = inject(PedidoService);
  public auth = inject(AuthService);
  private router = inject(Router);

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  marcas = signal<Marca[]>([]);
  locales = signal<Local[]>([]);
  
  categoriaSel = signal('todas');
  marcaSel = signal('todas');
  localSel = signal<string>('');
  error = signal('');
  mensaje = signal('');

  visibles = computed(() => {
    const cat = this.categoriaSel();
    const marca = this.marcaSel();

    return this.productos().filter(p => {
      const okCategoria = cat === 'todas' || p.categoriaId === Number(cat);
      const okMarca = marca === 'todas' || (marca === 'ninguna' ? p.marcaId === null : p.marcaId === Number(marca));
      return okCategoria && okMarca;
    });
  });

  ngOnInit() {
    this.categoriaService.listar().subscribe(datos => this.categorias.set(datos));
    this.marcaService.listar().subscribe(datos => this.marcas.set(datos));
    this.localService.listar().subscribe(datos => this.locales.set(datos.filter(l => l.activo)));
    this.productoService.listar().subscribe(datos => this.productos.set(datos));
  }

  agregarAlCarrito(p: Producto) {
    const localId = Number(this.localSel());
    if (!localId) return;

    this.pedidoService.agregarAlCarrito(p, localId);
    this.mensaje.set(`${p.nombre} agregado al carrito`);
    setTimeout(() => this.mensaje.set(''), 2000);
  }

  irAlCarrito() {
    this.router.navigate(['/pedidos/nuevo']);
  }
}