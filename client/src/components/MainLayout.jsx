import { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from './Header';
import { Footer } from './Footer';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MainLayout() {
  const scope = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const root = scope.current;
      if (!root) return;

      if (root.querySelector('.hero-text')) {
        gsap.from('.hero-text', {
          y: 30,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.12,
          clearProps: 'all',
        });
      }
      if (root.querySelector('.hero-photo')) {
        gsap.from('.hero-photo', {
          x: 25,
          autoAlpha: 0,
          duration: 1,
          clearProps: 'all',
        });
      }
      gsap.utils.toArray('.reveal').forEach((el) =>
        gsap.from(el, {
          y: 30,
          autoAlpha: 0,
          duration: 0.65,
          clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 95%', once: true },
        })
      );
      if (root.querySelector('.floating-image')) {
        gsap.to('.floating-image', {
          y: -9,
          duration: 2.4,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      }
    },
    { scope, dependencies: [pathname], revertOnUpdate: true }
  );

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#2D3138]">
      <Header />
      <main ref={scope}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
