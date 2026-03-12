'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SlideshowInit() {
  const pathname = usePathname();

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.slideshow').forEach((el) => {
      const slides = el.querySelectorAll<HTMLElement>('.slideshow__slide');
      if (slides.length === 0) return;

      let current = 0;

      function show(n: number) {
        slides[current].classList.remove('is-active');
        current = (n + slides.length) % slides.length;
        slides[current].classList.add('is-active');
      }

      slides[0].classList.add('is-active');

      el.querySelector('.slideshow__btn--prev')?.addEventListener('click', () => show(current - 1));
      el.querySelector('.slideshow__btn--next')?.addEventListener('click', () => show(current + 1));
    });
  }, [pathname]);

  return null;
}
