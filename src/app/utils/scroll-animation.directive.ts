import { Directive, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';

@Directive({
  selector: '[appScrollAnimation]',
  standalone: true,
})
export class ScrollAnimationDirective implements OnInit, OnDestroy {
  @Input() animationClass = 'fadeInUp';
  @Input() animationDuration = '1000ms';
  @Input() animationDelay = '0ms';
  private observer: IntersectionObserver | undefined;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.style.visibility = 'hidden';
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.el.nativeElement.style.visibility = 'visible';
          this.el.nativeElement.style.animationDuration = this.animationDuration;
          this.el.nativeElement.style.animationDelay = this.animationDelay;
          this.el.nativeElement.classList.add('animate__animated', `animate__${this.animationClass}`);
          this.observer?.unobserve(this.el.nativeElement);
        }
      });
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
