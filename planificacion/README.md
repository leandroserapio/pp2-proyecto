# mototracker

> Sistema de seguimiento vehicular para dueños de moto. Registrá tus motos, gestioná gastos, recibí recordatorios y notificaciones push.

---

## Proyecto

- **Materia:** Práctica Profesionalizante 2
- **Equipo:** 7 personas
- **Tiempo:** 5 semanas
- **Repositorio:** [https://github.com/leandroserapio/pp2-proyecto](https://github.com/leandroserapio/pp2-proyecto)

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Backend** | Java 17 + Spring Boot 3 + Gradle |
| **Auth** | JWT (JSON Web Tokens) + BCrypt |
| **Base de datos** | MySQL 8 (PlanetScale - cloud) |
| **ORM** | Spring Data JPA / Hibernate |
| **API** | REST + SpringDoc OpenAPI (Swagger) |
| **Mobile** | React Native (Expo) + Expo Router |
| **Notificaciones** | Firebase Cloud Messaging (FCM) |

---

## Funcionalidades

- **Auth** — Registro, login, logout con JWT
- **Gestión de Motos** — Registrar múltiples motos
- **Gastos** — Nafta, service, cadena, aceite, seguro, repuestos, registración
- **Mantenimientos** — Por km o fecha
- **Notificaciones Push** — Alertas de mantenimiento

---

## Estructura del Proyecto

```
mototracker/
├── backend/
│   └── src/main/java/com/mototracker/
│       ├── auth/           # User, AuthService, JwtService
│       ├── motorcycle/     # Motorcycle CRUD
│       ├── expense/        # Expense CRUD
│       ├── maintenance/     # Maintenance CRUD
│       ├── notification/  # FCM
│       └── config/         # Security, Swagger
├── mobile/                 # React Native (Expo)
└── docs/                   # Documentación
```

---

## Ramas por Persona

Cada persona trabaja únicamente en sus ramas asignadas. NUNCA hacer código en `develop` directamente.

```
develop
├── feature/auth-backend           ← Backend 1: User, JWT, Security
├── feature/moto-expense-backend  ← Backend 2: Motorcycle + Expense
├── feature/maintenance-backend      ← Backend 3: Maintenance + Notifications
├── feature/auth-frontend         ← Frontend 1: Login, Register, AuthContext
├── feature/dashboard-frontend    ← Frontend 1: Dashboard, Agregar Moto
├── feature/detail-frontend       ← Frontend 2: Detalle Moto, Expenses, Recordatorios, Settings
└── feature/notif-frontend       ← Frontend 1: Notificaciones Push
```

### Qué hace cada persona

| Persona | Rama(s) | Responsabilidad |
|---------|---------|-----------------|
| Backend 1 | `feature/auth-backend` | User entity, AuthService, JWT, Security, GlobalExceptionHandler |
| Backend 2 | `feature/moto-expense-backend` | Motorcycle + Expense (CRUD completo) |
| Backend 3 | `feature/maintenance-backend` | Maintenance + NotificationController + FCMService |
| Frontend 1 | `feature/auth-frontend`, `feature/dashboard-frontend`, `feature/notif-frontend` | Login, Register, Dashboard, Agregar Moto, Notificaciones |
| Frontend 2 | `feature/detail-frontend` | Detalle Moto, Expenses, Recordatorios, Settings |

---

## Equipo (7 personas)

| Rol | Persona |
|-----|---------|
| PM + Analista | - |
| Backend 1 | - |
| Backend 2 | - |
| Backend 3 | - |
| Frontend 1 | - |
| Frontend 2 | - |
| UX/UI | - |

---

## Cronograma

| Semana | Foco | Entregable |
|--------|------|------------|
| 1 | Setup + Auth + Motorcycle CRUD | Backend con login funcionando |
| 2 | Expense + Reminder + Notifications | Backend 100% |
| 3 | Frontend Core | Login + Dashboard + Detalle |
| 4 | Frontend Features + Push | Recordatorios + Notificaciones |
| 5 | Testing + Demo | Entrega final |

---

## Cómo Empezar

### Backend

```bash
cd backend
./gradlew build
./gradlew bootRun
# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

### Configurar PlanetScale

La configuración principal vive en `backend/src/main/resources/application.yml` y lee variables de entorno:

```bash
PLANETSCALE_HOST=aws.connect.psdb.cloud
PLANETSCALE_USER=tu-usuario
PLANETSCALE_PASSWORD=tu-password
PLANETSCALE_DATABASE=mototracker
```

Opcionalmente se puede mantener un `.env.example` con esos nombres para documentar las variables, pero Spring Boot no carga `.env` automáticamente sin configuración adicional.

### Mobile

```bash
cd mobile
npm install
npx expo start
```

---

## Flujo de Git

```
main ─────────────────────────── producción (solo merges probados)
 └── develop ─────────────────── integración (todos mergean acá)
      ├── feature/auth-backend           ← Backend 1
      ├── feature/moto-expense-backend  ← Backend 2
      ├── feature/reminder-backend       ← Backend 3
      ├── feature/auth-frontend          ← Frontend 1
      ├── feature/dashboard-frontend    ← Frontend 1
      ├── feature/detail-frontend        ← Frontend 2
      └── feature/notif-frontend         ← Frontend 1
```

**Reglas:**
- NUNCA commitear directo a `main` o `develop`
- Cada integrante trabaja únicamente en sus ramas asignadas `feature/NOMBRE`
- PR requiere 1 reviewer aprobado

---

## Seguridad

Toda la información de motorcycles, expenses y reminders está aislada por usuario. Cada query filtra por `userId`.

```
Authorization: Bearer <jwt-token>
```

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| **[TAREAS.md](./TAREAS.md)** | Lista completa de tareas por persona |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Guía de contribución y flujo Git |
| **[docs/PROPUESTA.md](./docs/PROPUESTA.md)** | Propuesta técnica simplificada |
| **[docs/MODELO.md](./docs/MODELO.md)** | Modelo de datos y API endpoints |

---

## Licencia

Este proyecto es para fines educativos — Práctica Profesionalizante 2.