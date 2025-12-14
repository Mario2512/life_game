# 🎯 Life Game - Tu Rutina Diaria

Una aplicación móvil moderna y gamificada para gestionar tu rutina diaria, ganar puntos y canjear recompensas.

## ✨ Características

### 🎮 Gamificación
- **Sistema de Puntos**: Gana puntos completando tareas diarias
- **Niveles de Esfuerzo**: Más esfuerzo = más puntos
- **Calidad de Comida**: Bonus por comidas saludables
- **Tienda de Recompensas**: Canjea puntos por premios

### 📱 Diseño Móvil
- **Interfaz Moderna**: Diseño glassmorphism con gradientes vibrantes
- **Optimizado para Táctil**: Botones grandes y gestos intuitivos
- **Modo Oscuro**: Diseño elegante que cuida tus ojos
- **Animaciones Suaves**: Micro-interacciones para mejor UX

### 💾 Gestión de Datos
- **Almacenamiento Local**: Tus datos se guardan en tu dispositivo
- **Exportar/Importar**: Respaldo y restauración de datos
- **Reinicio Mensual**: Puntos se reinician automáticamente cada mes
- **Historial Completo**: Revisa tu progreso en el calendario

### 📴 PWA (Progressive Web App)
- **Instalable**: Agrégala a tu pantalla de inicio
- **Funciona Offline**: Usa la app sin conexión
- **Actualizaciones Automáticas**: Siempre tendrás la última versión
- **Multiplataforma**: Funciona en Android, iOS y escritorio

## 🚀 Cómo Usar

### Instalación en Móvil

#### Android (Chrome)
1. Abre `index.html` en Chrome
2. Toca el menú (⋮) → "Agregar a pantalla de inicio"
3. Confirma la instalación
4. ¡Listo! La app aparecerá en tu pantalla de inicio

#### iOS (Safari)
1. Abre `index.html` en Safari
2. Toca el botón de compartir (□↑)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma la instalación
5. ¡Listo! La app aparecerá en tu pantalla de inicio

### Uso Local (Desarrollo)

Para probar la aplicación localmente:

```bash
# Opción 1: Usar Python
python -m http.server 8000

# Opción 2: Usar Node.js (npx)
npx http-server

# Opción 3: Usar PHP
php -S localhost:8000
```

Luego abre tu navegador en `http://localhost:8000`

## 📖 Guía de Uso

### 🏠 Inicio
- **Reloj en Tiempo Real**: Muestra la hora actual
- **Barra de Progreso**: Visualiza tu progreso diario
- **Lista de Tareas**: Toca una tarea para marcarla como completada
- **Indicadores de Esfuerzo**: Los puntos muestran la dificultad

### 🛍️ Tienda
- Navega por las recompensas disponibles
- Toca un item para canjearlo
- Confirma el canje si tienes suficientes puntos

### 📆 Calendario
- Revisa tu historial mensual
- Ve cuántas tareas completaste cada día
- Las etiquetas muestran las tareas específicas

### 👤 Perfil
- Estadísticas del mes actual
- Exportar/Importar datos
- Reiniciar mes manualmente

## 🎨 Personalización

### Modificar Rutina
Edita el archivo `app.js`, busca la sección `this.routine`:

```javascript
this.routine = [
    { hora: "06:50", tarea: "Despertar", esfuerzo: 2 },
    { hora: "07:00", tarea: "Desayuno", esfuerzo: 1 },
    // Agrega más tareas aquí
];
```

### Modificar Tienda
Edita el archivo `app.js`, busca la sección `this.store`:

```javascript
this.store = {
    "Ver un capítulo de serie": 10,
    "Comer un postre": 20,
    // Agrega más recompensas aquí
};
```

### Cambiar Colores
Edita el archivo `styles.css`, modifica las variables CSS:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  /* Personaliza más colores aquí */
}
```

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño moderno con variables CSS y animaciones
- **JavaScript (ES6+)**: Lógica de aplicación orientada a objetos
- **LocalStorage API**: Persistencia de datos
- **Service Worker**: Funcionalidad offline
- **Web App Manifest**: Instalación como PWA
- **Google Fonts**: Tipografía Inter

## 📊 Sistema de Puntos

### Puntos Base
- Cada tarea otorga: `esfuerzo × 3` puntos
- Esfuerzo 1 = 3 puntos
- Esfuerzo 2 = 6 puntos
- Esfuerzo 3 = 9 puntos

### Bonus de Comida
- Comida Sana: +5 puntos
- Comida Neutra: +2 puntos
- Comida No Sana: +0 puntos

### Ejemplo
"Ejercicio" (esfuerzo 3) = 9 puntos
"Desayuno" (esfuerzo 1) + Sana = 3 + 5 = 8 puntos

## 🐛 Solución de Problemas

### La app no se instala
- Asegúrate de estar usando HTTPS o localhost
- Verifica que todos los archivos estén en la misma carpeta
- Comprueba que los iconos existan en la carpeta `icons/`

### Los datos no se guardan
- Verifica que el navegador permita LocalStorage
- No uses modo incógnito/privado
- Limpia la caché y recarga la página

### El Service Worker no funciona
- Usa HTTPS o localhost (requerido para Service Workers)
- Abre DevTools → Application → Service Workers para depurar
- Desregistra el Service Worker antiguo si hay problemas

## 📝 Estructura de Archivos

```
life_game/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos y diseño
├── app.js             # Lógica de la aplicación
├── manifest.json      # Configuración PWA
├── service-worker.js  # Service Worker para offline
├── icons/             # Iconos de la aplicación
│   ├── icon-192.png
│   └── icon-512.png
├── game_life.py       # Versión original en Python
└── README.md          # Este archivo
```

## 🎯 Próximas Características (Roadmap)

- [ ] Notificaciones push para recordatorios
- [ ] Gráficos de progreso semanal/mensual
- [ ] Racha de días consecutivos
- [ ] Logros y medallas
- [ ] Temas personalizables
- [ ] Sincronización en la nube
- [ ] Modo multijugador/competencia

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la app:

1. Haz un fork del proyecto
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Haz push a la rama
5. Abre un Pull Request

## 💡 Consejos

- **Sé Consistente**: Completa tareas todos los días para maximizar puntos
- **Come Sano**: Las comidas saludables dan más puntos
- **Planifica Recompensas**: Ahorra puntos para las recompensas grandes
- **Revisa el Calendario**: Motívate viendo tu progreso
- **Exporta Datos**: Haz respaldos periódicos de tu progreso

---

¡Disfruta gamificando tu vida! 🎮✨
