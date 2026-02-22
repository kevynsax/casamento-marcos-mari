import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MenuItem {
  label: string;
  sectionId: string;
}

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu implements OnInit {
  protected isSticky = signal(false);
  protected activeSection = signal('home');
  protected isMenuOpen = signal(false);

  protected menuItems: MenuItem[] = [
    { label: 'Início', sectionId: 'home' },
    { label: 'Local', sectionId: 'local' },
    { label: 'Presentes', sectionId: 'shop' }
  ];

  ngOnInit(): void {
    this.updateActiveSection();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const offset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isSticky.set(offset > 100);
    this.updateActiveSection();
    this.isMenuOpen.set(false); // Close mobile menu on scroll
  }

  private updateActiveSection(): void {
    const sections = this.menuItems.map(item => item.sectionId);
    const scrollPosition = window.scrollY + 200; // offset for better UX

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i]);
      if (section) {
        const sectionTop = section.offsetTop;
        if (scrollPosition >= sectionTop) {
          this.activeSection.set(sections[i]);
          break;
        }
      }
    }
  }

  protected scrollToSection(sectionId: string): void {
    this.isMenuOpen.set(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // menu height offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  protected isActive(sectionId: string): boolean {
    return this.activeSection() === sectionId;
  }

  protected toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
}
