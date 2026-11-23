'use client'

import React from 'react'
import { Target, Layers, Rocket, TrendingUp, CheckCircle2 } from 'lucide-react'

export const CyberMethodology: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Diagnóstico & Estrategia',
      icon: Target,
      description:
        'Auditoría integral de la situación actual, requerimientos técnicos, cuellos de botella de conversión y diseño de la hoja de ruta estratégica.',
      tags: ['Análisis TI', 'Investigación de Mercado', 'Arquitectura'],
    },
    {
      number: '02',
      title: 'Arquitectura & Diseño',
      icon: Layers,
      description:
        'Modelado de bases de datos, flujos de automatización, wireframing de alta conversión y selección precisa de herramientas sin deuda técnica.',
      tags: ['UX/UI Cyber', 'Bases de Datos', 'Flujos de Venta'],
    },
    {
      number: '03',
      title: 'Despliegue & Blindaje',
      icon: Rocket,
      description:
        'Construcción limpia en código y CMS, integración de pasarelas, certificados SSL, seguridad perimetral y optimización extrema de Core Web Vitals.',
      tags: ['Carga <1s', 'Docker Cloud', 'Seguridad Robusta'],
    },
    {
      number: '04',
      title: 'Growth & Automatización',
      icon: TrendingUp,
      description:
        'Activación de campañas publicitarias de alto ROAS, agentes de inteligencia artificial para soporte/ventas y trazabilidad analítica sin cookies.',
      tags: ['Agentes IA', 'Campañas Ads', 'Escalabilidad'],
    },
  ]

  return (
    <section className="py-24 bg-[#050505] relative border-b border-white/5">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
            Metodología Comprobada
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            INGENIERÍA APLICADA AL{' '}
            <span className="cyber-gradient-orange">MARKETING DIGITAL</span>
          </h2>
          <p className="text-gray-400 mt-4 text-base font-medium">
            No dejamos nada a la improvisación. Cada entrega sigue un proceso estructurado 
            que une estabilidad de sistemas con efectividad de ventas.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="cyber-glass-card rounded-2xl p-7 flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Top Corner Number */}
                <div className="absolute top-4 right-5 text-4xl font-black text-white/5 group-hover:text-orange-500/20 transition-colors">
                  {step.number}
                </div>

                <div>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6 font-medium">
                    {step.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                  {step.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
