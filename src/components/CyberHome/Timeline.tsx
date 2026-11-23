import React from 'react'

interface Milestone {
  year: string
  role: string
  entity: string
  desc: string
  achievement: string
  badge: string
}

const milestones: Milestone[] = [
  {
    year: '2024 - Presente',
    role: 'Consultor Principal de Arquitectura Digital & IA',
    entity: 'Sector Corporativo & E-commerce',
    desc: 'Liderando la migración de plataformas tradicionales hacia arquitecturas Next-Gen con Next.js, Headless CMS, automatización con n8n e integración con agentes de Inteligencia Artificial.',
    achievement: '+40 plataformas empresariales activas y automatizadas',
    badge: 'Vanguardia Tech'
  },
  {
    year: '2021 - 2023',
    role: 'Líder de Sistemas & Transformación Digital',
    entity: 'Gobierno Autónomo Municipal de El Alto (GAMEA)',
    desc: 'Dirección de infraestructura tecnológica, modernización de servicios ciudadanos, seguridad perimetral y optimización de bases de datos para trámites masivos.',
    achievement: 'Digitalización de servicios clave y reducción del 60% en tiempos de trámite',
    badge: 'Gestión Pública'
  },
  {
    year: '2019 - 2021',
    role: 'Especialista en Infraestructura & Data Center',
    entity: 'Agencia Nacional de Hidrocarburos (ANH)',
    desc: 'Supervisión de telecomunicaciones, integridad de bases de datos de control de hidrocarburos, balanceo de carga y continuidad operativa de misión crítica.',
    achievement: '99.98% de disponibilidad operativa continua',
    badge: 'Misión Crítica'
  },
  {
    year: '2016 - 2019',
    role: 'Coordinador de Tecnologías de la Información',
    entity: 'Instituto Nacional de Estadística (INE)',
    desc: 'Procesamiento masivo de censos y encuestas socioeconómicas nacionales, seguridad de datos estadísticos y desarrollo de plataformas de difusión analítica.',
    achievement: 'Despliegue de sistemas de captura y procesamiento a escala país',
    badge: 'Big Data & Estadística'
  },
  {
    year: '2012 - 2016',
    role: 'Jefe de Unidad de Sistemas',
    entity: 'Ministerio de Desarrollo Rural y Tierras (MDRyT)',
    desc: 'Diseño e implementación de sistemas de información geográfica (SIG) agrícola, portales institucionales de alto tráfico y auditoría de ciberseguridad.',
    achievement: 'Conectividad e informatización de programas agropecuarios nacionales',
    badge: 'Infraestructura Estatal'
  },
  {
    year: '2008 - 2012',
    role: 'Licenciado en Ingeniería de Sistemas',
    entity: 'Universidad Salesiana de Bolivia (USB)',
    desc: 'Graduación con honores y posterior especialización continua en Marketing Digital, Growth Hacking, DevOps en la nube y Ciberseguridad Aplicada.',
    achievement: 'Excelencia académica en Ingeniería de Software y Redes',
    badge: 'Formación Académica'
  }
]

export const CyberTimeline: React.FC = () => {
  return (
    <section id="trayectoria" className="relative py-28 bg-[#030303] overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            15+ Años de Experiencia
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-6">
            Trayectoria que respalda <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">cada línea de código</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            De la gestión de sistemas para ministerios de gobierno y entidades del Estado, al diseño de plataformas digitales de alta facturación para empresas privadas.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative border-l border-white/10 ml-4 sm:ml-32 space-y-12">
          {milestones.map((item, idx) => (
            <div key={idx} className="relative pl-8 sm:pl-10 group">
              
              {/* Year marker on left (for desktop) */}
              <div className="hidden sm:block absolute -left-36 top-1 text-right w-28">
                <span className="text-xs font-mono font-bold text-orange-400">
                  {item.year}
                </span>
              </div>

              {/* Glowing node on line */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-black border-2 border-orange-500 group-hover:scale-125 group-hover:border-amber-300 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.8)] transition-all duration-300" />

              {/* Card content */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#09090c] border border-white/5 hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1">
                
                {/* Year marker for mobile */}
                <div className="sm:hidden mb-2 text-xs font-mono font-bold text-orange-400">
                  {item.year}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                    {item.role}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {item.badge}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {item.entity}
                </h4>

                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {item.desc}
                </p>

                <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item.achievement}</span>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
