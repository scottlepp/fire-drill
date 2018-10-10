import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'ff-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fire-drill';

  constructor(private router: Router) {
    // this.router.events.subscribe(event => {
    //  if (event instanceof NavigationEnd) {
    //    (<any>window).ga('set', 'page', event.urlAfterRedirects);
    //    (<any>window).ga('send', 'pageview');
    //  }
    // });
 }
}
