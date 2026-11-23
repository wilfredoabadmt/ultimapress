import React from 'react'

interface Plan {
  id: string
  name: string
  tagline: string
  popular?: boolean
  features: string[]
  specs: {
    storage: string
    bandwidth: string
    cpanel: string
    backup: string
    ssl: string
  }
}

const plans: Plan[] = [
  {
    id: 'nucleo',
    name: 'Núcleo Digital',
    tagline: 'Ideal para profesionales, marcas personales y sitios informativos de inicio.',
    specs: {
      storage: '10 GB NVMe Ultra-Fast',
      bandwidth: 'Tráfico Ilimitado',
      cpanel: 'cPanel / FastPanel moderno',
      backup: 'Backups automáticos semanales',
      ssl: 'Certificado SSL Let\'s Encrypt Gratis'
    },
    features: [
      'Hasta 3 cuentas de correo corporativo',
      'Protección Anti-DDoS perimetral',
      'Soporte técnico directo por WhatsApp',
      'Aceleración de caché LiteSpeed/Nginx'
    ]
  },
  {
    id: 'impulso',
    name: 'Impulso Web',
    popular: true,
    tagline: 'La elección preferida para negocios en crecimiento y catálogos con visitas constantes.',
    specs: {
      storage: '25 GB NVMe High Speed',
      bandwidth: 'Tráfico Ilimitado',
      cpanel: 'Panel de Control Cloud dedicado',
      backup: 'Backups diarios automatizados',
      ssl: 'SSL Wildcard de alta seguridad'
    },
    features: [
      'Correos corporativos ilimitados',
      'PHP 8.2+ con acelerador OPcache',
      'Staging para pruebas antes de publicar',
      'Optimización de base de datos mensual',
      'WAF (Web Application Firewall) activo'
    ]
  },
  {
    id: 'cumbre',
    name: 'Cumbre Empresarial',
    tagline: 'Para tiendas virtuales WooCommerce, academias LMS y empresas consolidadas.',
    specs: {
      storage: '60 GB NVMe Raid-10',
      bandwidth: 'Ancho de banda garantizado',
      cpanel: 'Panel multi-dominio dedicado',
      backup: 'Backups diarios en nube externa',
      ssl: 'SSL Empresarial + HTTP/3 QUIC'
    },
    features: [
      'Recursos de CPU y RAM dedicados (2 vCPU / 4GB)',
      'Optimización especial para WooCommerce',
      'Integración con CDN Cloudflare Pro',
      'Monitoreo Uptime 24/7 con alertas SMS/WA',
      'Soporte prioritario 1 a 1'
    ]
  },
  {
    id: 'galaxia',
    name: 'Galaxia Premier',
    tagline: 'Infraestructura Cloud / VPS a medida para portales de alto tráfico y misiones críticas.',
    specs: {
      storage: '150+ GB NVMe Enterprise',
      bandwidth: 'Puerto 1 Gbps no compartido',
      cpanel: 'Gestión completa Coolify / Docker',
      backup: 'Snapshots en tiempo real a S3',
      ssl: 'Seguridad perimetral Zero-Trust'
    },
    features: [
      'Servidor VPS Cloud dedicado',
      'Docker / Node.js / PostgreSQL / Redis',
      'Mantenimiento preventivo mensual integral',
      'Blindaje contra ataques de fuerza bruta y SQLi',
      'Acuerdo de Nivel de Servicio (SLA 99.9%)'
    ]
  }
]

export const CyberHosting: React.FC = () => {
  return (
    <section id="hosting" className="relative py-28 bg-[#020204] overflow-hidden border-t border-white/5">
      {/* Background neon lights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Infraestructura Cloud NVMe
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-6">
            Hosting de alta velocidad <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">sin caídas ni lentitud</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Planes diseñados desde la arquitectura del servidor para que tu web vuele, tus correos nunca vayan a spam y tus bases de datos estén 100% blindadas.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#140e08] via-[#09090c] to-[#070709] border-2 border-orange-500 shadow-2xl shadow-orange-500/10'
                  : 'bg-[#09090c] border border-white/5 hover:border-orange-500/40'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black text-[11px] font-black uppercase tracking-wider shadow-lg">
                  Más Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed min-h-[36px]">
                  {plan.tagline}
                </p>

                {/* Specs Box */}
                <div className="space-y-2.5 p-4 rounded-xl bg-black/40 border border-white/5 mb-6 text-xs">
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-500">Almacenamiento:</span>
                    <span className="font-bold text-white">{plan.specs.storage}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-500">Transferencia:</span>
                    <span className="font-semibold text-orange-400">{plan.specs.bandwidth}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-500">Copias Backup:</span>
                    <span className="font-medium text-gray-300">{plan.specs.backup}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-500">Seguridad:</span>
                    <span className="font-medium text-emerald-400">{plan.specs.ssl}</span>
                  </div>
                </div>

                {/* Feature List */}
                <ul className="space-y-2.5 mb-8 text-xs text-gray-300">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <a
                href={`https://wa.me/59171523780?text=Hola%20Wilfredo,%20me%20interesa%20contratar%20el%20plan%20de%20hosting%20${encodeURIComponent(plan.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-center transition-all duration-300 block ${
                  plan.popular
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:brightness-110 shadow-lg shadow-orange-500/25'
                    : 'bg-[#121216] hover:bg-orange-500/10 text-white hover:text-orange-400 border border-white/10 hover:border-orange-500/50'
                }`}
              >
                Solicitar Plan {plan.name}
              </a>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-16 p-6 rounded-2xl bg-[#09090c] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Garantía de Migración Gratuita</h4>
              <p className="text-gray-400 text-xs">Si ya tienes tu sitio en otro proveedor lento, migramos todo tu contenido y correos sin tiempo de inactividad.</p>
            </div>
          </div>
          <a
            href="https://wa.me/59171523780?text=Hola%20Wilfredo,%20quiero%20migrar%20mi%20sitio%20web%20a%20tu%20infraestructura%20de%20hosting"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-orange-400 hover:text-orange-300 underline underline-offset-4 whitespace-nowrap"
          >
            Consultar migración gratuita →
          </a>
        </div>

      </div>
    </section>
  )
}
