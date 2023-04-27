import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroService } from '../../services/heroes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit{

  constructor(
    private fb: FormBuilder,
    private heroesService: HeroService,
    private activateRouter:ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog:MatDialog ){
  }
  ngOnInit(): void {
    // ocupamos aber los parametro que viene por la URL 
    if( !this.router.url.includes('edit')) return;

    this.activateRouter.params
    .pipe(
      switchMap( ({ id }) => this.heroesService.getHeroById( id )),
    ).subscribe( hero => {

      if(!hero) return this.router.navigateByUrl('/');

      this.formHeroe.reset( hero );
      return;
    });
  }

  formHeroe = this.fb.group({
    id:               new FormControl<string>(''),
    superhero:        new FormControl<string>('', { nonNullable: true }),
    publisher:        new FormControl<Publisher>(Publisher.DCComics),
    alter_ego:        new FormControl(),
    first_appearance: new FormControl(),
    characters:       new FormControl(),
    alt_img:         new FormControl(), 
  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC -Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' },
  ];

  get currentHero(): Hero {
    const hero = this.formHeroe.value as Hero;
    return hero;
  }

  onSubmit(): void {

    if ( this.formHeroe.invalid ) return;

    if ( this.currentHero.id) {
      this.heroesService.updateHero(this.currentHero)
      .subscribe( hero => {
        this.showStackbar(`${ hero.superhero } actualizado`);
      });
      return;
    }

    this.heroesService.addHero( this.currentHero )
    .subscribe( hero => {
      this.router.navigate(['/heroes/edit', hero.id]);
      this.showStackbar(`${ hero.superhero } creado`);
    });

    console.log({
      formisValid: this.formHeroe.valid,
      value: this.formHeroe.value,
    });    
  }

  onDeleteHero() {
    if ( !this.currentHero.id ) throw Error('El héroe es requerido');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.formHeroe.value,
    });

    dialogRef.afterClosed()
    .pipe(
      filter( (result: boolean) => result),
      switchMap( () => this.heroesService.deleteHeroById( this.currentHero.id )),
      // tap( eliminado => console.log( { eliminado}) ), // con el tap, podemos ver que devuelve
      filter( (eliminado: boolean) => eliminado),
    )
    .subscribe( ()=> {  // si llegaos a este punto es que se elimno correctamente
      this.router.navigate(['/heroes'])
    })



    // esto comentado se mejora en la parte de arriba para no tener un suscribe dentro de otro suscribe
    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed !!');
    //   this.heroesService.deleteHeroById( this.currentHero.id )
    //   .subscribe( eliminado => {
    //     if( eliminado)
    //     this.router.navigate(['/heroes']);
    //   })
    // });
  }

  showStackbar(mensaje: string) {
    this.snackbar.open( mensaje, 'done', {
      duration: 2500,
    })
  }
}
