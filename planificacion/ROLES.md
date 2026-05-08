# Roles y División de Trabajo — mototracker

## Estructura del Equipo (7 personas)

| Rol | Cantidad |
|-----|----------|
| **PM + Analista Funcional** | 1 |
| **UX/UI + Diseño** | 1 |
| **Dev Backend (Java/Spring Boot)** | 3 |
| **Dev Frontend (React Native)** | 2 |

---

## Ramas por Persona

**CADA PERSONA TRABAJA ÚNICAMENTE EN SUS RAMAS ASIGNADAS. NUNCA tocar código de otros.**

```text
develop
├── feature/auth-backend          ← Backend 1
├── feature/moto-expense-backend  ← Backend 2
├── feature/maintenance-backend      ← Backend 3
├── feature/auth-frontend         ← Frontend 1
├── feature/dashboard-frontend    ← Frontend 1
├── feature/detail-frontend       ← Frontend 2
└── feature/notif-frontend        ← Frontend 1
```

---

## Backend 1 — `feature/auth-backend`

**Responsable:** User entity, AuthService, JWT, Security

### Tareas

- User entity + UserRepository
- AuthController + AuthService
- Endpoint `GET /api/auth/me`
- JwtService
- SecurityConfig + JwtAuthFilter
- GlobalExceptionHandler
- `application.yml`

---

## Backend 2 — `feature/moto-expense-backend`

**Responsable:** Motorcycle + Expense

### Tareas

- Motorcycle entity, repository, service, controller
- Expense entity, repository, service, controller
- Create/Update DTOs
- Validación de patente única por usuario
- CRUD completo de motorcycles y expenses

---

## Backend 3 — `feature/maintenance-backend`

**Responsable:** Maintenance + Notifications

### Tareas

- Maintenance entity, repository, service, controller
- CRUD completo de maintenances
- Marcar maintenance como completado
- FCMService
- NotificationController
- Device token storage
- Endpoint de prueba `POST /api/notifications/send` para demo/testing

---

## Frontend 1 — `feature/auth-frontend` + `feature/dashboard-frontend` + `feature/notif-frontend`

**Responsable:** Auth screens, Dashboard, Notificaciones

### Tareas

- Login + Register + AuthContext
- Dashboard con lista de motorcycles
- Pantalla Agregar Moto
- Notificaciones Push (FCM)

---

## Frontend 2 — `feature/detail-frontend`

**Responsable:** Detalle Moto, Expenses, Mantenimientos, Settings

### Tareas

- Pantalla Detalle de Moto
- Pantalla Agregar Expense
- Lista de Expenses
- Pantalla Agregar Mantenimiento
- Pantalla Settings + Logout

---

## PM + Analista

**Responsable:**

- Coordinar reuniones semanales
- Gestionar tablero Kanban
- Redactar specs y casos de uso
- Preparar presentación final

---

## UX/UI

**Responsable:**

- Wireframes interactivos en Figma
- Paleta de colores y tipografía
- Assets e iconos
- Consistencia visual

---

## Definition of Done

Una tarea está **DONE** cuando:

1. ✅ Código hecho y commiteado
2. ✅ Compila sin errores
3. ✅ Probado manualmente
4. ✅ PR aprobado por reviewer
5. ✅ Mergeado a develop

---

## Comunicación

- **Daily Standup:** Qué hice, qué voy a hacer, blockers
- **Trello/Kanban:** Todos actualizan sus tareas
- **Grupo de proyecto:** Para comunicación rápida
