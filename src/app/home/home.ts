import { Component } from '@angular/core';
import { Menu } from '../menu/menu';
import { Shop } from '../shop/shop';
import { Cover } from '../cover/cover';

@Component({
  selector: 'app-home',
  imports: [
    Menu,
    Shop,
    Cover
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
