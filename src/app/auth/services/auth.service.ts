import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroments } from 'src/enviroments/enviroments';
import { User } from '../interfaces/user.interface';
import { Observable, catchError, map, of, tap } from 'rxjs';


@Injectable({providedIn: 'root'})
export class AuthService {
    constructor(
        private http: HttpClient) { }
    
    private baseUrl = enviroments.baseUrl;
    private user!: User;

    get currentUser(): User | undefined {
        if( !this.user ) return undefined;
        return structuredClone( this.user );
    }

    login( email: string , password: string):Observable<User> {
        // posteriormente usaremos el 
        // http.post('login', { email, password })
        return this.http.get<User>(`${this.baseUrl}/users/1`)
            .pipe(
                tap(user => this.user = user),
                tap(user => localStorage.setItem('token', user.id.toString()))
            );
    }

    // login( email: string , password: string):Observable<User> {
    //     .pipe(
    //         tap( user => {
    //             this.user = user;
    //             localStorage.setItem('token', user.id.toString());
    //         })
    //     )
    // }
    checarAutenticacion(): Observable<boolean> {
        if ( !localStorage.getItem('token')) return of( false);
        
        const token = localStorage.getItem('token');

        //return of(true);

        return this.http.get<User>(`${ this.baseUrl }/users/1`)
            .pipe(
                tap( user => this.user = user),
                map( user =>  !!user ),
                catchError( err => of(false))
            );
    }   

    logout() {
        this.user = {
            id: 0,
            user: '',
            email: ''
        }
        
        localStorage.clear();
    }


}