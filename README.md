# GolazoLive - La Liga & UEFA Champions League

Aplicación web progresiva (PWA) para marcadores de fútbol en vivo, alertas instantáneas de gol con sonido, tabla de posiciones actualizada y calendario oficial.

---

## 🚀 Despliegue en GitHub Pages (Solución al error 404)

### ¿Por qué ocurría el error 404 (`main.tsx: 404`, `icon.svg: 404`)?
1. **Archivos sin compilar:** El navegador en GitHub Pages no puede ejecutar directamente archivos de desarrollo como `.tsx` ni rutas absolutas de raíz (`/main.tsx`). GitHub Pages necesita servir la carpeta compilada `dist/`.
2. **Subcarpeta del repositorio:** En GitHub Pages la web suele publicarse en `https://tu-usuario.github.io/tu-repo/`. Las rutas de assets deben ser relativas (`./`), lo cual ya hemos corregido en `vite.config.ts`.

---

### Opción 1 (Recomendada y 100% Automática): GitHub Actions

Hemos incluido el archivo `.github/workflows/deploy.yml`. Solo debes:

1. Subir los archivos del proyecto a tu repositorio de GitHub (`git push origin main`).
2. En GitHub, entra en tu repositorio y ve a:
   👉 **Settings** (Configuración) ➔ **Pages** (en el menú lateral izquierdo).
3. En **Build and deployment** ➔ **Source**, cambia de *Deploy from a branch* a:
   👉 **GitHub Actions**.
4. ¡Listo! Cada vez que hagas `push`, GitHub compilará el proyecto automáticamente y lo publicará con HTTPS y PWA funcional.

---

### Opción 2: Subir directamente la carpeta `dist/`

Si prefieres usar la opción tradicional de ramas:
1. Ejecuta en tu terminal:
   ```bash
   npm run build
   ```
2. Sube el contenido de la carpeta `dist/` a la rama `gh-pages` o a la raíz de tu repositorio.

---

## 📱 Instalación en Android (PWA)
Cuando cualquier usuario abra la web desde su móvil Android:
- Se mostrará automáticamente la notificación para **"Instalar en Android"**.
- Se puede pulsar el botón **"Instalar en Android"** en la cabecera o pie de página.
- En Chrome: Menú ⋮ ➔ **"Instalar aplicación"** / **"Añadir a la pantalla de inicio"**.
