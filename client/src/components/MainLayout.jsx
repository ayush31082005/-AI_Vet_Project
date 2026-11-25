import { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from './Header';
import { Footer } from './Footer';
gsap.registerPlugin(useGSAP, ScrollTrigger);
export function MainLayout(){
 const scope=useRef(null);
 const {pathname}=useLocation();
 useEffect(()=>{window.scrollTo(0,0)},[pathname]);
 useGSAP(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  gsap.from('.hero-text',{y:30,autoAlpha:0,duration:.8,stagger:.12,clearProps:'all'});
  gsap.from('.hero-photo',{x:25,autoAlpha:0,duration:1,clearProps:'all'});
  gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:30,autoAlpha:0,duration:.65,clearProps:'all',scrollTrigger:{trigger:el,start:'top 95%',once:true}}));
  gsap.to('.floating-image',{y:-9,duration:2.4,yoyo:true,repeat:-1,ease:'sine.inOut'});
 },{scope,dependencies:[pathname],revertOnUpdate:true});
 return <div className="min-h-screen bg-[#FFFBF5] text-[#2D3138]">
  <Header/>
  <main ref={scope}><Outlet/></main>
  <Footer/>
 </div>;
}
