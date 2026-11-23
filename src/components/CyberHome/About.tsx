'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GraduationCap, ShieldCheck, Database, Award, ArrowUpRight, CheckCircle2 } from 'lucide-react'

export const CyberAbout: React.FC = () => {
  return (
    <section id="sobre-mi" className="py-24 bg-black relative border-b border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with Cyber Frames */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden border-2 border-white/10 group shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
              
              {/* Image */}
              <Image
                src="/assets/wilfredo-set.jpg"
                alt="Wilfredo Abad Mancilla - Ingeniero de Sistemas y Especialista en Marketing"
                fill
                className="object-cover object-center grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 420px"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

              {/* Floating Badge (Bottom Corner) */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/85 border border-white/15 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Lic. en Ingeniería de Sistemas</h4>
                    <p className="text-[11px] text-gray-400">Univ. Salesiana de Bolivia (TPN-U Serie C)</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Bio & Core Authority */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest self-start">
              Perfil Profesional de Alto Nivel
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              No contratas a un diseñador.{' '}
              <span className="cyber-gradient-orange">
                Contratas a un Departamento de TI y Marketing
              </span>{' '}
              en una sola persona.
            </h2>

            <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
              <p>
                Cuento con más de dos décadas de trayectoria profesional, combinando cargos de 
                <strong className="text-white"> Dirección Tecnológica e Informática en el sector público</strong> 
                (Ministerio de Desarrollo Rural, INE, Agencia Nacional de Hidrocarburos, GAM El Alto) 
                con la consultoría internacional independiente en ecosistemas digitales desde 2011.
              </p>
              <p>
                Esta dualidad me permite ofrecer una visión inusual: el rigor arquitectónico para asegurar 
                que tus servidores no se caigan bajo picos masivos de tráfico, junto con la persuasión publicitaria 
                y automatizaciones necesarias para multiplicar ventas y captar leads calificados.
              </p>
            </div>

            {/* 2 Key Pillars Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">Seguridad & Rendimiento</h4>
                  <p className="text-gray-400 text-xs mt-1">Cero caídas, protección contra ataques, copias automáticas y tiempos de carga instantáneos.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <Database className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">Automatización & CRM</h4>
                  <p className="text-gray-400 text-xs mt-1">Flujos con agentes IA (n8n), sincronización con Clientify y embudos automatizados.</p>
                </div>
              </div>
            </div>

            {/* CTA Link */}
            <div className="pt-2">
              <Link
                href="#experiencia"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-bold text-xs uppercase tracking-widest group"
              >
                <span>Conocer trayectoria y cargos directivos</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
