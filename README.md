# Guía GTA VI por zonas

Webapp para móvil (PWA): eliges dónde estás en Leonida y ves qué hay, con trucos que dejan los jugadores.
Proyecto de fans, sin relación con Rockstar Games ni Take-Two.

## Estado
- Modo local: trucos, votos, puntos e insignias se guardan en el navegador.
- Datos base marcados como CONFIRMADO o RUMOR (vienen de información previa al lanzamiento, no de haber jugado).
- Hamlet no es región oficial; aparece solo en mapas de fans.

## Ejecutar
```bash
python3 -m http.server 8000
```
Abre http://localhost:8000 (mejor en el móvil o con el modo móvil del navegador).

## Siguiente
1. Cuentas y base de datos (Supabase, ver `supabase/schema.sql`).
2. Moderación: reportes, límite de envíos, ocultar trucos con muchos "falso".
3. Publicidad (`CFG.ADS_ENABLED` en `config.js`) y enlaces de afiliado (`CFG.AFFILIATE_LINKS`).
4. Recompensas: puntos por votos recibidos, ranking mensual y, cuando haya ingresos, bote repartido.
