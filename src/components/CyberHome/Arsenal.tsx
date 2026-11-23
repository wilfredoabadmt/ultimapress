import React from 'react'
import Image from 'next/image'

interface ToolItem {
  name: string
  category: string
  logo: string
  valCommercial: string
  benefit: string
}

const arsenalTools: ToolItem[] = [
  {
    name: 'Bricks Builder',
    category: 'Visual Builder',
    logo: '/assets/plugins/bricks.png',
    valCommercial: '$599 USD',
    benefit: 'Código limpio, DOM ultra-ligero y puntuaciones 100/100 en Google PageSpeed.'
  },
  {
    name: 'Crocoblock JetEngine',
    category: 'Dynamic Data & CPT',
    logo: '/assets/plugins/crocoblock.png',
    valCommercial: '$750 USD',
    benefit: 'Relaciones complejas, campos personalizados, listados dinámicos y paneles de usuario.'
  },
  {
    name: 'Elementor Pro',
    category: 'Visual Builder',
    logo: '/assets/plugins/elementor.png',
    valCommercial: '$399 USD',
    benefit: 'El estándar de la industria para landing pages de marketing y funnels de venta.'
  },
  {
    name: 'RankMath PRO',
    category: 'SEO & Schema',
    logo: '/assets/plugins/rankmath.png',
    valCommercial: '$199 USD',
    benefit: 'Indexación instantánea, Rich Snippets, análisis de palabras clave y Schema IA.'
  },
  {
    name: 'WP Rocket',
    category: 'Performance & Cache',
    logo: '/assets/plugins/wprocket.png',
    valCommercial: '$299 USD',
    benefit: 'Caché estática avanzada, compresión GZIP, optimización de fuentes y LazyLoad.'
  },
  {
    name: 'Breakdance Builder',
    category: 'Next-Gen Builder',
    logo: '/assets/plugins/breakdance.png',
    valCommercial: '$199 USD',
    benefit: 'Rendimiento nativo moderno con componentes avanzados para WooCommerce.'
  },
  {
    name: 'Fluent Forms Pro',
    category: 'Funnels & Conversión',
    logo: '/assets/plugins/fluentforms.png',
    valCommercial: '$129 USD',
    benefit: 'Formularios condicionales, pagos en línea y sincronización con CRMs.'
  },
  {
    name: 'ACF PRO (Advanced Custom Fields)',
    category: 'Data Architecture',
    logo: '/assets/plugins/acf.png',
    valCommercial: '$149 USD',
    benefit: 'Estructuración modular de datos con campos repetidores y bloques flexibles.'
  },
  {
    name: 'CartFlows Pro',
    category: 'Checkout & Upsells',
    logo: '/assets/plugins/cartflows.png',
    valCommercial: '$299 USD',
    benefit: 'Checkouts optimizados de un solo paso, order bumps y upsells posventa.'
  },
  {
    name: 'Astra Pro & Kadence',
    category: 'Enterprise Themes',
    logo: '/assets/plugins/astra.png',
    valCommercial: '$229 USD',
    benefit: 'Temas base con velocidad extrema y compatibilidad absoluta en accesibilidad.'
  },
  {
    name: 'ShortPixel Pro',
    category: 'Image Optimization',
    logo: '/assets/plugins/shortpixel.png',
    valCommercial: '$99 USD',
    benefit: 'Conversión automática a WebP/AVIF y compresión con pérdida casi nula.'
  },
  {
    name: 'Wordfence Security Pro',
    category: 'Cybersecurity',
    logo: '/assets/plugins/wordfence.png',
    valCommercial: '$119 USD',
    benefit: 'Firewall a nivel de aplicación (WAF), bloqueo de fuerza bruta y escaneo de malware.'
  }
]

export const CyberArsenal: React.FC = () => {
  return (
    <section id="arsenal" className="relative py-28 bg-[#020204] overflow-hidden border-t border-b border-white/5">
      {/* Background Matrix/Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Banner de Alto Valor */}
        <div className="relative rounded-3xl p-8 sm:p-12 mb-16 overflow-hidden border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-black to-[#0c0905]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4 border border-orange-500/30">
                ⭐ Valor exclusivo para mis clientes
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Más de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">$2,500 USD</span> en software oficial incluido a <span className="underline decoration-orange-500 underline-offset-8">$0 costo</span>
              </h2>
              <p className="text-gray-300 text-base leading-relaxed">
                Tus proyectos no usan plugins piratas ni licencias nulled inseguras. Como partner y desarrollador senior con licencias de agencia ilimitadas de por vida, instalo las herramientas más potentes del planeta con soporte de actualizaciones de seguridad oficiales.
              </p>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/60 border border-orange-500/40 backdrop-blur-xl shadow-2xl text-center">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Ahorro para tu empresa</span>
              <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
                100% GRATIS
              </span>
              <span className="text-xs text-orange-400/90 font-medium mt-1">En el desarrollo de tu sitio web</span>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            El Arsenal Tecnológico de Producción
          </h3>
          <p className="text-gray-400 text-sm sm:text-base">
            Cada plugin ha sido seleccionado por su rendimiento en producción, escalabilidad y compatibilidad limpia de base de datos.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {arsenalTools.map((tool, idx) => (
            <div
              key={idx}
              className="group relative p-6 rounded-2xl bg-[#09090c] border border-white/5 hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Header: Logo + Val */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center p-2 group-hover:border-orange-500/40 transition-colors">
                    <Image
                      src={tool.logo}
                      alt={tool.name}
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    Val: {tool.valCommercial}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    {tool.category}
                  </span>
                  <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                    {tool.name}
                  </h4>
                </div>

                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  {tool.benefit}
                </p>
              </div>

              {/* Status */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Licencia Activa
                </span>
                <span className="font-mono text-gray-400">Incluida</span>
              </div>
            </div>
          ))}
        </div>

        {/* Note at bottom */}
        <div className="mt-12 text-center text-xs text-gray-400 max-w-2xl mx-auto">
          * Todas las licencias son genuinas de nivel Developer / Agency Edition. Cero riesgo de código malicioso o vulnerabilidades de repositorios no oficiales.
        </div>

      </div>
    </section>
  )
}
