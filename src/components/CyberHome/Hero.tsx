'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Sparkles, Terminal, Code2, Cpu } from 'lucide-react'

export const CyberHero: React.FC = () => {
  return (
    <section id="inicio" className="relative min-h-[95vh] pt-32 pb-20 flex items-center overflow-hidden bg-black">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[160px] pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '4rem 4rem'
        }}
      />

      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-gray-200">
                SISTEMA DE DESPLIEGUE & GROWTH v3.0
              </span>
            </div>

            {/* Giant Title */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-white">
              ESTRATEGIA{' '}
              <span className="cyber-gradient-orange drop-shadow-[0_0_35px_rgba(234,88,12,0.4)]">
                TECNOLÓGICA
              </span>{' '}
              PARA NEGOCIOS
            </h1>

            {/* Description with Orange Left Accent */}
            <p className="text-base sm:text-lg text-gray-300 font-medium leading-relaxed border-l-4 border-orange-500 pl-5 max-w-2xl bg-gradient-to-r from-orange-500/[0.05] to-transparent py-2 rounded-r-lg">
              Soy <strong className="text-white font-bold">Wilfredo Abad</strong>, Ingeniero de Sistemas y Especialista Senior en Growth Marketing. 
              Uno el rigor de la arquitectura de software, bases de datos y automatización con IA, 
              con embudos de conversión masiva para empresas y campañas en EE.UU., España, Colombia y Bolivia.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <Link
                href="#contacto"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(234,88,12,0.45)] hover:shadow-[0_0_40px_rgba(234,88,12,0.7)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <span>Iniciar Proyecto</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#arsenal"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/15 hover:border-orange-500/50 text-white font-bold text-sm uppercase tracking-wider transition-all duration-200"
              >
                <Zap className="w-4 h-4 text-orange-400" />
                <span>Ver Arsenal $0 Costo</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 w-full max-w-xl">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">15+</div>
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Años Experiencia</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-orange-400">+200</div>
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Proyectos Online</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">$2,500+</div>
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Arsenal Incluido</div>
              </div>
            </div>

          </div>

          {/* Right Column (Holographic Card / Badge) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-[320px] sm:w-[380px] h-[380px] sm:h-[440px] flex items-center justify-center">
              
              {/* Outer rotating decorative dashed ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-orange-500/25 animate-spin-slow pointer-events-none" />
              <div className="absolute inset-6 rounded-full border border-white/10 pointer-events-none" />

              {/* Main Glowing Orb / Core */}
              <div className="relative w-[260px] sm:w-[300px] h-[260px] sm:h-[300px] rounded-3xl bg-gradient-to-br from-[#121212] via-[#0A0A0A] to-black border-2 border-orange-500/40 shadow-[0_0_60px_rgba(234,88,12,0.35)] p-6 flex flex-col items-center justify-center text-center animate-cyber-float">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-4 text-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.2)]">
                  <Cpu className="w-8 h-8" />
                </div>
                
                <span className="text-5xl font-black text-white tracking-tighter">15+</span>
                <span className="text-sm font-extrabold uppercase tracking-widest text-orange-400 mt-1">
                  Años de Trayectoria
                </span>
                
                <p className="text-xs text-gray-400 mt-3 px-4 font-medium leading-relaxed">
                  Ingeniería de Sistemas + Despliegue Cloud + Marketing de Alta Conversión
                </p>

                {/* Status chip inside */}
                <div className="mt-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Infraestructura Blindada</span>
                </div>
              </div>

              {/* Floating badges around orb */}
              <div className="absolute -top-3 -right-4 px-4 py-2 rounded-xl bg-black/90 border border-white/15 backdrop-blur-xl text-xs font-bold text-white shadow-xl flex items-center gap-2">
                <Terminal className="w-4 h-4 text-orange-400" />
                <span>Docker & Cloud</span>
              </div>

              <div className="absolute -bottom-3 -left-4 px-4 py-2 rounded-xl bg-black/90 border border-white/15 backdrop-blur-xl text-xs font-bold text-white shadow-xl flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Agentes IA & n8n</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
