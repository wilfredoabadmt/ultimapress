# Footer Disruptivo - Especificación de Diseño

## Visión
Un footer moderno y disruptivo que utiliza efectos de neón, animaciones y un diseño de cuadrícula para destacar en cualquier sitio UltimaPress.

## Características Del Design

### Efectos Visuales
1. **Neón y Glow**
   - Gradientes dinámicos con `var(--up-primary)` y `var(--up-accent)`
   - Efectos de brillo con `blur-3xl` y `shadow-lg`
   - Animaciones `pulse` para elementos activos

2. **Animaciones**
   - `pulse-glow`: Pulso contínuo del fondo
   - `neon-flicker`: Efecto de parpadeo de neón
   - `glitch`: Efecto de distorsión en hover
   - Transiciones con `cubic-bezier(0.23, 1, 0.32, 1)` para movimientos suaves

3. **Efectos de Interacción**
   - Hover en enlaces: `text-shadow` con neón
   - Hover en items: traslación suave y ampliación
   - Líneas underline con gradiente Dinámico
   - Efecto de aparición secuencial para elementos

### Estructura
```
┌─────────────────────────────────────────────────────────────────┐
│  [Gradiente de fondo con órbitas]                               │
│  ┌───────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │ Logo  │  │ Contacto    │  │ Horarios  │  │ Enlaces rápidos│ │
│  │+Redes │  │ Tel,Fax,Dir │  │ Clock icon│  │ Nav items    │ │
│  └───────┘  └─────────────┘  └─────────────┘  └──────────────┘ │
│                                                                 │
│  ──────────────────────── [Separador con neón] ───────────────── │
│                    © 2024 | Tema Switcher                        │
└─────────────────────────────────────────────────────────────────┘
```

### Paleta de Colores
- **Fondo**: `#0a0a0a` a `#1a1a1a` (gradiente oscuro)
- **Texto principal**: `#e5e5e5`
- **Texto secundario**: `#a3a3a3`
- **Neón primario**: `var(--up-primary)`
- **Neón secundario**: `var(--up-accent)`
- **Border**: `rgba(255,255,255,0.15)`

### Tipografía
- **Fuente principal**: `Gilroy` (peso 500-700)
- **Letter spacing**: `0.1em` en títulos
- **Tracking**: `uppercase` para headers

### Responsividad
- **Desktop (lg)**: 4 columnas
- **Tablet (md)**: 2 columnas  
- **Mobile**: 1 columna con espaciado amplo
- **2xl**: Ajuste automático de anchos

## Implementación

### Componentes Usados
- `Link` de Next.js con efectos de hover
- `Logo` reutilizado
- `CMSLink` para navegación
- `CookieSettingsLink` para GDPR
- `ThemeSelector` con indicador de estado

### Iconos de Red Social
Mapea las plataformas del footer a iconos de lucide-react:
- Facebook → `Facebook`
- Instagram → `Instagram`
- X (Twitter) → `MessageCircle`
- LinkedIn → `MessageCircle`
- YouTube → `Youtube`
- TikTok → `Music`
- WhatsApp → `Phone`

### Campos del Footer (config.ts)
```typescript
{
  navItems: Array<{ link: { url, label } }>
  about: string          // Texto bajo el logo
  phone, email, address, hours
  social: Array<{ 
    platform: 'Facebook' | 'Instagram' | 'X' | 'LinkedIn' | 'YouTube' | 'TikTok' | 'WhatsApp'
    url: string 
  }>
}
```

## Uso
1. Ve a **Admin > Design > Footer Menu**
2. Completa los campos: logo, contacto, redes sociales, enlaces
3. El footer se actualizará automáticamente con el nuevo diseño

## Optimización de Performance
- CSS en línea para evitar múltiples requests
- Animaciones GPU-accelerated (`transform`, `opacity`)
- `backdrop-filter` solo en bottom bar
- Transiciones optimizadas con `cubic-bezier`

## Futuras Mejoras
- Añadir contador de visitas al pie
- Implementar efecto de partículas con canvas
- Añadir enlaces a podcasts/bolsillos
- Animación de typing en el tagline