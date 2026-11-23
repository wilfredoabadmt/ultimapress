# Optimización de Deploy en Coolify

## Problema actual
Los deploys en Coolify tardan más de 15 minutos porque:
1. Coolify hace build desde cero en cada deploy
2. El proceso de backup + install + build + check es lento
3. `pnpm install` tarda 2-3 minutos
4. `next build` tarda 3-5 minutos

## Solución 1: Usar la imagen pre-built (RECOMENDADO)

**No uses "Build from Dockerfile" en Coolify. En su lugar:**

1. En el servicio de Coolify, ve a **Environment**
2. Agrega estas variables:
   - `DATABASE_URL`: `postgres://ultimapress:TU_PASSWORD@db:5432/ultimapress`
   - `POSTGRES_PASSWORD`: (tu password)
   - `DOMAIN`: tu-dominio.com (opcional, para HTTPS automático)
   - `SITE_URL`: https://tu-dominio.com (opcional)
3. En **Image**, usa directamente:
   ```
   ghcr.io/mrwebtv/ultimapress:latest
   ```

**Tiempo de deploy: 1-2 minutos**

## Solución 2: Configuración de BuildKit (si necesitas build)

Si necesitas construir desde el código (modificaciones propias):

1. Habilita BuildKit en Coolify:
   ```dockerfile
   # syntax=docker/dockerfile:1.4
   ```
   (ya está en el Dockerfile)

2. Agrega al .env en Coolify:
   ```
   DOCKER_BUILDKIT=1
   ```

## Solución 3: Optimización del supervisor

El supervisor ya tiene cache de node_modules cuando package.json no cambia. Para acelerar:

1. **Mantén las mismas dependencias** entre deploys
2. Usa `pnpm ship` para cambios menores (no rebuild completo)

## Flujos recomendados

| Escenario | Comando | Tiempo |
|-----------|---------|--------|
| Cambio en Claude | `pnpm ship` | 1-2 min |
| Actualización UltimaPress | Update en Site Code | 3-5 min |
| Nueva instalación Coolify | Usar imagen ghcr.io | 1-2 min |
| Deploy con build | BuildKit con cache | 10-15 min |

## Variables de entorno para Coolify

```env
# Base
DATABASE_URL=postgres://ultimapress:tu-password@db:5432/ultimapress
POSTGRES_PASSWORD=tu-password

# HTTPS (opcional)
DOMAIN=tu-dominio.com
SITE_URL=https://tu-dominio.com

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM_ADDRESS=tu-email@gmail.com
SMTP_FROM_NAME="Tu Sitio"

# Redis (opcional, para caché)
UP_REDIS_URL=redis://redis:6379
```

## Notas importantes

1. El `healthcheck` ahora tiene `start_period: 300s` para dar tiempo al build interno
2. Los volúmenes `media` y `appdata` deben persistir entre deploys
3. Si usas `pnpm ship`, Coolify no necesita hacer nada - el código va directo al contenedor