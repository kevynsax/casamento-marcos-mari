import { Component } from '@angular/core';
import { Menu } from '../menu/menu';
import { Shop } from '../shop/shop';
import { Cover } from '../cover/cover';
import { Where } from '../where/where';

@Component({
  selector: 'app-home',
  imports: [
    Menu,
    Shop,
    Cover,
    Where
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
