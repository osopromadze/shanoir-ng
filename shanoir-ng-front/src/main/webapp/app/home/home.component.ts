import { Component } from '@angular/core';

import { LoginService } from '../login/login.service';

@Component({
    selector: 'shanoir-home',
    templateUrl: './app/home/home.html'
})

export class HomeComponent {

    constructor(private loginService: LoginService) {
    }
    
    logout(event): void {  
        event.preventDefault();
        this.loginService.logout();
    }
    
}