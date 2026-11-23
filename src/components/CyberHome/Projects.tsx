'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Project {
  title: string
  category: 'E-commerce' | 'Marketing Político' | 'EdTech' | 'Corporativo' | 'CRM & Automatización'
  desc: string
  url: string
  image: string
  tags: string[]
  metrics: string
}

const projects: Project[] = [
  {
    title: 'EcoJavez Importadora',
    category: 'E-commerce',
    desc: 'Plataforma de comercio electrónico de importaciones de tecnología y gadgets con sincronización de inventario en tiempo real.',
    url: 'https://ecojavez.com',
    image: '/assets/clientes/ecojavez.png',
    tags: ['WooCommerce', 'High-Speed CDN', 'SEO Optimizado'],
    metrics: '+240% ventas online'
  },
  {
    title: 'Campaña Presidencial Rodrigo Paz',
    category: 'Marketing Político',
    desc: 'Ecosistema digital de campaña política de alcance nacional con captación masiva de votantes, segmentación y blindaje DDOS.',
    url: 'https://rodrigopaz.com',
    image: '/assets/clientes/rodrigopaz.png',
    tags: ['Estrategia Digital', 'Alta Concurrencia', 'Lead Gen'],
    metrics: '+500k visitas/semana'
  },
  {
    title: 'Bienes Raíces Bien Estar VIP',
    category: 'Corporativo',
    desc: 'Portal inmobiliario de propiedades de lujo y terrenos campestres con recorridos interactivos y CRM automatizado.',
    url: 'https://bien-estar.vip',
    image: '/assets/clientes/bien-estar.vip.png',
    tags: ['Crocoblock Engine', 'Filtros Dinámicos', 'CRM Sync'],
    metrics: 'Leads calificados 24/7'
  },
  {
    title: 'Pinturas Monopol Bolivia',
    category: 'Corporativo',
    desc: 'Catálogo digital interactivo e infraestructura web corporativa para el fabricante líder de pinturas en Bolivia.',
    url: 'https://monopol.bo',
    image: '/assets/clientes/monopol.png',
    tags: ['Arquitectura Web', 'Catálogo Digital', 'UX Industrial'],
    metrics: 'Líder en posicionamiento'
  },
  {
    title: 'Axioma Academy',
    category: 'EdTech',
    desc: 'Plataforma educativa de aprendizaje virtual LMS con cursos protegidos, pagos automatizados y emisión de certificados.',
    url: 'https://axiomacompany.com',
    image: '/assets/clientes/axiomacompany.png',
    tags: ['LearnDash LMS', 'Membresías', 'Checkout Local'],
    metrics: '+1,200 estudiantes activos'
  },
  {
    title: 'Tienda Online TOI Bolivia',
    category: 'E-commerce',
    desc: 'Tienda virtual de alta conversión de productos retail y hogar con pasarelas de pago bolivianas QR integradas.',
    url: 'https://toi.bo',
    image: '/assets/clientes/toi.bo.png',
    tags: ['Next-Gen Ecom', 'Pago QR Simple', 'Ultra Fast'],
    metrics: 'Conversion Rate 4.2%'
  },
  {
    title: 'Kiosco Creativo',
    category: 'Marketing Político',
    desc: 'Agencia de producción publicitaria y consultoría de diseño con portfolio dinámico y cotizador de proyectos.',
    url: 'https://kioscocreativo.com',
    image: '/assets/clientes/kioscocreativo.com.png',
    tags: ['Branding', 'WebGL Effects', 'Cotizador Online'],
    metrics: 'Tasa de rebote < 28%'
  },
  {
    title: 'Bio-Verde Cosmética Natural',
    category: 'E-commerce',
    desc: 'Boutique digital de cosmética orgánica con trazabilidad botánica, fidelización de clientes y suscripciones periódicas.',
    url: 'https://bioverde.shop',
    image: '/assets/clientes/bioverde.shop.png',
    tags: ['Suscripciones', 'Green UX', 'Email Flow'],
    metrics: '3.5x Retención mensual'
  }
]

const categories = ['Todos', 'E-commerce', 'Corporativo', 'Marketing Político', 'EdTech']

export const CyberProjects: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Todos')

  const filteredProjects = activeCategory === 'Todos'
    ? projects
    : projects.filter(p => p.category === activeCategory)

  return (
    <section id="proyectos" className="relative py-28 bg-[#030303] overflow-hidden">
      {/* Background neon flares */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            Casos de Éxito & Clientes
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-6">
            Proyectos que generan <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">ventas y autoridad</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg font-normal">
            Soluciones digitales en producción diseñadas bajo criterios de alta disponibilidad, velocidad extrema y arquitectura persuasiva de conversión.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/25 scale-105'
                  : 'bg-[#0f0f12] text-gray-400 hover:text-white border border-white/5 hover:border-orange-500/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <div
              key={idx}
              className="group relative bg-[#09090b] rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2 flex flex-col"
            >
              {/* Image Preview Container */}
              <div className="relative h-56 w-full overflow-hidden bg-[#121217]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/30" />
                
                {/* Metric pill */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-orange-500/40 text-[11px] font-bold text-orange-400 flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {project.metrics}
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
                  {project.category}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors mb-2.5">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                    {project.desc}
                  </p>
                  
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/5 text-gray-400 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Live Link Button */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">EN VIVO</span>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 group-hover:translate-x-0.5 transition-all"
                  >
                    Visitar sitio web
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Bottom Glow Accent */}
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-orange-500/0 to-transparent group-hover:via-orange-500 transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* Global CTA Bottom */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm mb-4">
            ¿Necesitas una arquitectura web del mismo calibre para tu empresa o proyecto?
          </p>
          <a
            href="https://wa.me/59171523780?text=Hola%20Wilfredo,%20vi%20tu%20portafolio%20de%20clientes%20y%20quiero%20cotizar%20un%20proyecto"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111116] hover:bg-orange-500/10 border border-orange-500/30 hover:border-orange-500 text-orange-400 text-sm font-bold transition-all duration-300"
          >
            <span>Cotizar mi proyecto por WhatsApp</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.35.49 1.199.533 1.286.044.087.073.189.015.305-.058.115-.088.187-.174.289-.087.102-.182.228-.26.306-.089.088-.182.183-.078.361.104.178.461.761.99 1.232.68.608 1.254.796 1.431.884.177.088.281.074.385-.045.104-.119.444-.518.563-.696.119-.178.238-.148.4-.089.162.059 1.026.484 1.202.572.176.088.293.132.336.206.043.074.043.43-.101.835z"/>
            </svg>
          </a>
        </div>

      </div>
    </section>
  )
}
