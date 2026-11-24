import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const CyberFooter: React.FC = () => {
  return (
    <footer className="relative bg-[#020203] border-t border-white/5 pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <Image
                  src="/logo-wam.png"
                  alt="Wilfredo Abad Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(234,88,12,0.5)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-lg tracking-tight">
                  WILFREDO ABAD
                </span>
                <span className="text-[10px] text-orange-400 font-mono tracking-wider uppercase">
                  Systems Engineer & Digital Growth
                </span>
              </div>
            </Link>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Ingeniería de software de alta gama, arquitectura web en la nube y estrategias de marketing digital de conversión masiva. Conectando tecnología sólida con resultados comerciales medibles.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { name: 'Instagram', url: 'https://instagram.com/soywilfredoabad', icon: 'IG' },
                { name: 'TikTok', url: 'https://tiktok.com/@soywilfredoabad', icon: 'TT' },
                { name: 'Facebook', url: 'https://facebook.com/soywilfredoabad', icon: 'FB' },
                { name: 'LinkedIn', url: 'https://linkedin.com/in/wilfredoabad', icon: 'IN' },
                { name: 'GitHub', url: 'https://github.com/wilfredoabadmt', icon: 'GH' }
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0e0e12] border border-white/5 hover:border-orange-500/50 hover:bg-orange-500/10 text-gray-400 hover:text-orange-400 flex items-center justify-center text-xs font-mono font-bold transition-all"
                  aria-label={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links: Servicios */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider font-mono">
              Servicios
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="#servicios" className="hover:text-orange-400 transition-colors">Desarrollo Web & E-commerce</a></li>
              <li><a href="#servicios" className="hover:text-orange-400 transition-colors">Marketing Político & Campañas</a></li>
              <li><a href="#servicios" className="hover:text-orange-400 transition-colors">Plataformas LMS & Membresías</a></li>
              <li><a href="#servicios" className="hover:text-orange-400 transition-colors">Cloud Hosting & Servidores NVMe</a></li>
              <li><a href="#servicios" className="hover:text-orange-400 transition-colors">Auditoría SEO & Ciberseguridad</a></li>
              <li><a href="#servicios" className="hover:text-orange-400 transition-colors">Automatizaciones IA & n8n</a></li>
            </ul>
          </div>

          {/* Links: Navegación */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider font-mono">
              Explorar
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="#perfil" className="hover:text-orange-400 transition-colors">Acerca de Wilfredo</a></li>
              <li><a href="#proyectos" className="hover:text-orange-400 transition-colors">Casos de Éxito</a></li>
              <li><a href="#arsenal" className="hover:text-orange-400 transition-colors">Plugins & Arsenal Tech</a></li>
              <li><a href="#trayectoria" className="hover:text-orange-400 transition-colors">Trayectoria Profesional</a></li>
              <li><a href="#hosting" className="hover:text-orange-400 transition-colors">Planes de Hosting NVMe</a></li>
              <li><a href="/admin" className="hover:text-orange-400 transition-colors">Panel Administrativo</a></li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider font-mono">
              Contacto
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <p>
                <span className="text-gray-400 block font-mono">WhatsApp Directo:</span>
                <a href="https://wa.me/59171523780" className="text-white font-bold hover:text-orange-400 transition-colors">
                  +591 71523780
                </a>
              </p>
              <p>
                <span className="text-gray-400 block font-mono">Base Operativa:</span>
                <span className="text-gray-300">La Paz & El Alto, Bolivia</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            © {new Date().getFullYear()} Wilfredo Abad. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              UltimaPress Next-Gen v1.0
            </span>
            <a href="#inicio" className="hover:text-white transition-colors">
              Volver al inicio ↑
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
