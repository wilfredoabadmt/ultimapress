'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowUpRight, Zap, ShieldCheck } from 'lucide-react'

export const CyberNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Sobre Mí', href: '#sobre-mi' },
    { label: 'Soluciones', href: '#servicios' },
    { label: 'Proyectos', href: '#proyectos' },
    { label: 'Arsenal Pro', href: '#arsenal' },
    { label: 'Hosting & Cloud', href: '#hosting' },
    { label: 'Contacto', href: '#contacto' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="#inicio" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-black text-xl shadow-[0_0_20px_rgba(234,88,12,0.5)] group-hover:scale-105 transition-transform">
            WA
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg md:text-xl tracking-tight text-white group-hover:text-orange-400 transition-colors">
              WILFREDO ABAD
            </span>
            <span className="text-[10px] uppercase tracking-widest text-orange-500/90 font-semibold -mt-1">
              Ingeniería & Growth
            </span>
          </div>
        </Link>

        {/* Live Status Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-gray-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Disponible para proyectos</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs uppercase font-bold tracking-wider text-gray-400 hover:text-orange-400 transition-colors relative py-1 hover:drop-shadow-[0_0_8px_rgba(234,88,12,0.6)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="#contacto"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider hover:from-orange-500 hover:to-amber-400 shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.65)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Iniciar Proyecto</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-orange-500" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-2xl border-b border-orange-500/20 px-6 py-8 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400 self-start mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Aceptando Proyectos 2026</span>
          </div>

          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase font-bold tracking-wider text-gray-300 hover:text-orange-400 py-1.5 border-b border-white/5"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="#contacto"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(234,88,12,0.5)]"
          >
            <span>Solicitar Cotización</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  )
}
