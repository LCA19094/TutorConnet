# Frontend - UI React + Vite

## 📱 Descripción

Interfaz de usuario desarrollada con React 18, Vite y Tailwind CSS para la plataforma TutorConnect.

## 🏗️ Estructura

```
src/
├── pages/            # Páginas principales
├── components/       # Componentes reutilizables
├── hooks/            # Custom hooks
├── services/         # API client
├── store/            # State management (Zustand)
├── styles/           # Estilos CSS
├── App.jsx
└── main.jsx
```

## 🚀 Inicio Rápido

```bash
cd frontend
npm install
npm run dev
```

Frontend activo en `http://localhost:5173`

## 📄 Páginas Principales

**Públicas**
- HomePage - Página de inicio
- LoginPage - Login
- RegisterPage - Registro
- TutorSearchPage - Búsqueda de tutores

**Estudiantes**
- StudentDashboard - Dashboard principal
- MySessionsPage - Mis sesiones
- StudentProfileEdit - Editar perfil
- NotificationsPage - Notificaciones

**Tutores**
- TutorDashboard - Dashboard principal
- TutorProfileEdit - Editar perfil
- TutorAvailability - Gestionar disponibilidad
- TutorEarnings - Ver ingresos
- SessionRequestsPage - Solicitudes de sesión

## 🧩 Componentes Principales

### Common
- Navbar - Navegación
- Footer - Pie de página
- LoadingSpinner - Indicador de carga

### UI
- NotificationBell - Campana de notificaciones
- NotificationsPanel - Panel de notificaciones
- TutorProfileModal - Modal de perfil de tutor

### Tutor
- TutorSearchComponent - Búsqueda avanzada
- TutorCard - Tarjeta de tutor
- RatingsComponent - Reseñas

### Session
- SessionBookingComponent - Reserva de sesión
- SessionRequestsComponent - Solicitudes

## 🎯 Features Implementadas

- ✅ Búsqueda y filtrado de tutores
- ✅ Reserva de sesiones
- ✅ Sistema de notificaciones (campana)
- ✅ Calificaciones y reseñas
- ✅ Gestión de disponibilidad (tutores)
- ✅ Panel de ingresos (tutores)
- ✅ Perfil de usuario (edición)
- ✅ Autenticación JWT
- ✅ Responsive design (mobile-first)

## 🔐 Autenticación

El token JWT se almacena en Zustand store y se envía automáticamente en todos los requests.

```javascript
// authStore.js
- user: Usuario autenticado
- token: JWT token
- login: Función de login
- logout: Función de logout
```

## 🎨 Estilos

- **Tailwind CSS** - Utilidades CSS
- **Responsive** - Mobile-first design
- **Dark mode** - Soporte para modo oscuro (futuro)

## 📦 Dependencias Principales

```json
{
  "react": "^18.2.0",
  "zustand": "^4.x.x",
  "axios": "^1.4.0",
  "lucide-react": "^0.x.x",
  "react-toastify": "^9.x.x",
  "react-router-dom": "^6.x.x",
  "tailwindcss": "^3.x.x"
}
```

## 🔧 Scripts

```bash
npm run dev       # Desarrollo
npm run build     # Build producción
npm run preview   # Preview del build
npm run lint      # Linting (futuro)
```

## 📝 Variables de Entorno

```
VITE_API_URL=http://localhost:5000
```

## 🚀 Despliegue

```bash
# Build producción
npm run build

# Preview del build
npm run preview

# Archivos de salida en dist/
```

## 🎓 Cambios Recientes

- ✅ Página de disponibilidad para tutores
- ✅ Página de ingresos con exportación CSV
- ✅ Notificaciones públicas para todas las sesiones
- ✅ Funcionalidades en modal de tutor (contactar, reservar)
- ✅ Mejoras de UI/UX

## 📞 Soporte

Para problemas:
1. Verifica que backend esté corriendo
2. Revisa VITE_API_URL en .env
3. Abre console (F12) para ver errores
4. Limpia cache del navegador
