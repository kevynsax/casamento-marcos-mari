import { Component } from '@angular/core';
import { ScrollAnimationDirective } from '../utils/scroll-animation.directive';

@Component({
  selector: 'app-where',
  imports: [
    ScrollAnimationDirective
  ],
  templateUrl: './where.html',
  styleUrl: './where.scss',
})
export class Where {

}
