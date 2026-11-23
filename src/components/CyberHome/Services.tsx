'use client'

import React from 'react'
import Link from 'next/link'
import { Globe, Zap, ShoppingCart, Video, Target, Database, ArrowRight, Check } from 'lucide-react'

export const CyberServices: React.FC = () => {
  const services = [
    {
      title: 'Desarrollo Web Full Stack',
      icon: Globe,
      badge: 'CORE INGENIERÍA',
      description:
        'Sitios corporativos y landing pages construidos con Next.js, Payload CMS, WordPress Enterprise y Bricks. Diseñados para cargar en menos de 1 segundo.',
      features: [
        'Arquitectura modular y escalable',
        'SEO Técnico y Core Web Vitals 95+',
        'Panel autogestionable y seguro',
        'Diseño futurista 100% responsivo',
      ],
    },
    {
      title: 'Automatización con Agentes IA',
      icon: Zap,
      badge: 'INTELIGENCIA ARTIFICIAL',
      description:
        'Flujos de automatización de procesos mediante n8n, Make y servidores MCP. Conectamos tus bases de datos con modelos LLM para operar 24/7.',
      features: [
        'Chatbots de ventas en WhatsApp/Web',
        'Sincronización de leads multi-plataforma',
        'Clasificación automática de prospectos',
        'Procesamiento inteligente de datos',
      ],
    },
    {
      title: 'E-Commerce & Dropshipping',
      icon: ShoppingCart,
      badge: 'ALTA CONVERSIÓN',
      description:
        'Tiendas en línea optimizadas para venta masiva, cálculo de envíos, pasarelas de pago internacionales y carritos con checkout en un clic.',
      features: [
        'Optimización para alto AOV',
        'Pasarelas (Stripe, PayPal, QR local)',
        'Funnels de venta directa y upsells',
        'Gestión de inventarios y logística',
      ],
    },
    {
      title: 'Producción Audiovisual & Media',
      icon: Video,
      badge: 'CREATIVIDAD & RETENCIÓN',
      description:
        'Edición de video publicitario, motion graphics, branding y diseño de identidades visuales con Adobe Premiere, After Effects y Photoshop.',
      features: [
        'Videos publicitarios de alta retención',
        'Manuales de marca y líneas gráficas',
        'Creativos para Meta & TikTok Ads',
        'Mockups 3D y packaging digital',
      ],
    },
    {
      title: 'Publicidad de Alto ROAS',
      icon: Target,
      badge: 'PERFORMANCE MARKETING',
      description:
        'Estrategia y administración de campañas publicitarias en Meta Ads, TikTok y Google. Enfoque riguroso en costo por adquisición y retorno.',
      features: [
        'Estrategias electorales y políticas',
        'Segmentación avanzada de audiencias',
        'Copywriting persuasivo directo',
        'Embudos de nutrición y retargeting',
      ],
    },
    {
      title: 'Arquitectura CRM & Datos',
      icon: Database,
      badge: 'GESTIÓN COMERCIAL',
      description:
        'Implementación y consultoría de CRM (Clientify, HubSpot) y bases de datos PostgreSQL para centralizar y rentabilizar toda la base de contactos.',
      features: [
        'Pipelines de venta transparentes',
        'Secuencias de email marketing',
        'Limpieza y gobernanza de base de datos',
        'Reportes ejecutivos de rendimiento',
      ],
    },
  ]

  return (
    <section id="servicios" className="py-24 bg-[#080808] relative border-b border-white/5">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
              Soluciones Integrales
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              SISTEMAS DE NEGOCIO,{' '}
              <span className="cyber-gradient-orange">NO SIMPLES PLANTILLAS</span>
            </h2>
            <p className="text-gray-400 mt-4 text-base font-medium">
              Cada solución está diseñada para resolver una necesidad comercial concreta y 
              operar de forma autosuficiente sin depender de parches frágiles.
            </p>
          </div>

          <Link
            href="#contacto"
            className="inline-flex items-center gap-2 text-xs uppercase font-extrabold tracking-wider px-6 py-3 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/40 text-white transition-all self-start md:self-auto"
          >
            <span>Consultar Disponibilidad</span>
            <ArrowRight className="w-4 h-4 text-orange-400" />
          </Link>
        </div>

        {/* Services Grid (3x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => {
            const Icon = svc.icon
            return (
              <div
                key={i}
                className="cyber-glass-card rounded-2xl p-8 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-black transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400/90 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20">
                      {svc.badge}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6 font-medium">
                    {svc.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2 mb-6 pt-4 border-t border-white/5">
                    {svc.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 text-xs text-gray-300 font-medium">
                        <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="#contacto"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-orange-400 transition-colors pt-2"
                >
                  <span>Solicitar este servicio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
