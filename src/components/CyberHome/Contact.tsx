'use client'

import React, { useState } from 'react'

export const CyberContact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Sitio Web Corporativo',
    budget: '$500 - $1,500 USD',
    message: ''
  })

  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Construir enlace directo a WhatsApp con los datos recopilados
    const text = `Hola Wilfredo, quiero cotizar un proyecto:%0A%0A*Nombre:* ${formData.name}%0A*Email:* ${formData.email}%0A*Teléfono:* ${formData.phone}%0A*Servicio:* ${formData.service}%0A*Presupuesto:* ${formData.budget}%0A*Detalles:* ${formData.message}`
    window.open(`https://wa.me/59171523780?text=${text}`, '_blank')
    setSubmitted(true)
  }

  return (
    <section id="contacto" className="relative py-28 bg-[#030303] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Info Side */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Contacto Directo
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-6">
              Iniciemos la construcción de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">plataforma digital</span>
            </h2>
            
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              Cuéntame sobre tu proyecto o negocio. Analizaré los requerimientos técnicos y comerciales para diseñar una solución a la medida de tus objetivos.
            </p>

            {/* Direct Contact Cards */}
            <div className="space-y-4">
              
              <a
                href="https://wa.me/59171523780"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-[#09090c] border border-white/5 hover:border-orange-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.35.49 1.199.533 1.286.044.087.073.189.015.305-.058.115-.088.187-.174.289-.087.102-.182.228-.26.306-.089.088-.182.183-.078.361.104.178.461.761.99 1.232.68.608 1.254.796 1.431.884.177.088.281.074.385-.045.104-.119.444-.518.563-.696.119-.178.238-.148.4-.089.162.059 1.026.484 1.202.572.176.088.293.132.336.206.043.074.043.43-.101.835z"/>
                  </svg>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-gray-500 uppercase">WhatsApp Directo</span>
                  <div className="text-white font-bold text-sm group-hover:text-orange-400 transition-colors">+591 71523780</div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#09090c] border border-white/5">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-gray-500 uppercase">Ubicación</span>
                  <div className="text-white font-bold text-sm">La Paz - El Alto, Bolivia (Atención Global)</div>
                </div>
              </div>

            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#09090c] border border-white/5 shadow-2xl relative">
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Solicitud de Cotización & Arquitectura
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Completa este formulario y te responderé en menos de 2 horas con una propuesta inicial.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="carlos@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+591 70000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Servicio Requerido</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none transition-colors"
                    >
                      <option value="Sitio Web Corporativo">Sitio Web Corporativo</option>
                      <option value="E-commerce WooCommerce">E-commerce / Tienda Online</option>
                      <option value="Marketing Político Digital">Marketing Político Digital</option>
                      <option value="Plataforma LMS EdTech">Plataforma Educativa LMS</option>
                      <option value="Cloud Hosting & Mantenimiento">Cloud Hosting & Mantenimiento</option>
                      <option value="Auditoría de Ciberseguridad & SEO">Auditoría SEO & Ciberseguridad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Presupuesto Estimado</label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="$350 - $600 USD">$350 - $600 USD (Landing / Web Básica)</option>
                    <option value="$600 - $1,500 USD">$600 - $1,500 USD (Corporativo / Tienda Estándar)</option>
                    <option value="$1,500 - $3,500 USD">$1,500 - $3,500 USD (E-commerce Avanzado / Campaña)</option>
                    <option value="+$3,500 USD">+$3,500 USD (Infraestructura Enterprise / Custom)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Detalles del Proyecto *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Cuéntame sobre tu empresa, objetivos o plazos estimados..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-black font-extrabold text-sm tracking-wide hover:brightness-110 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Enviar y Continuar por WhatsApp</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                {submitted && (
                  <p className="text-center text-xs text-emerald-400 mt-2 font-medium">
                    ✓ Abriendo WhatsApp con los datos de tu cotización...
                  </p>
                )}

              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
