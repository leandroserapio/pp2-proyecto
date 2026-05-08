# Propuesta Técnica — mototracker

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Backend** | Java 17 + Spring Boot 3 + Gradle |
| **Auth** | JWT + BCrypt |
| **Database** | MySQL 8 (PlanetScale - cloud) |
| **ORM** | Spring Data JPA / Hibernate |
| **API** | REST + SpringDoc OpenAPI |
| **Mobile** | React Native (Expo) + Expo Router |
| **Notificaciones** | Firebase Cloud Messaging (FCM) |

---

## Sistema de Autenticación

```
[Mobile] ──POST /api/auth/register──► [AuthController] ──► [AuthService]
                                                              │
                                                         encodePassword()
                                                              │
                                                         [UserRepository]
                                                              │
                                            [Mobile] ◄──201 AuthResponse (JWT)

[Mobile] ──POST /api/auth/login──► [AuthController] ──► [AuthService]
                                                          │
                                                    verifyCredentials()
                                                    generateJWT()
                                                          │
                                            [Mobile] ◄──200 AuthResponse (JWT)
```

### JWT Token

- **Expiry:** 24 horas
- **Payload:** userId, email
- **Storage:** AsyncStorage en mobile

### Endpoints de Auth

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Registrar usuario | No |
| POST | /api/auth/login | Iniciar sesión | No |
| GET | /api/auth/me | Obtener usuario actual | Sí |

---

## Estructura del Proyecto (por Features)

```
backend/
├── src/main/java/com/mototracker/
│   ├── MototrackerApplication.java
│   ├── auth/              # User, AuthService, JwtService, DTOs
│   ├── motorcycle/       # Motorcycle entity, service, controller, DTOs
│   ├── expense/           # Expense entity, service, controller, DTOs
│   ├── maintenance/         # Maintenance entity, service, controller, DTOs
│   ├── notification/      # FCMService, NotificationController
│   └── config/            # SecurityConfig, JwtAuthFilter, OpenApiConfig
└── src/main/resources/
    └── application.yml    # Config PlanetScale
```

---

## API Endpoints

### Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/register | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/me | Usuario actual |

### Motorcycles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/motorcycles | Todas las motos del usuario |
| POST | /api/motorcycles | Crear moto |
| GET | /api/motorcycles/{id} | Detalle de moto |
| PUT | /api/motorcycles/{id} | Actualizar moto |
| DELETE | /api/motorcycles/{id} | Eliminar moto |

### Expenses

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/motorcycles/{id}/expenses | Gastos de una moto |
| POST | /api/motorcycles/{id}/expenses | Crear gasto |
| PUT | /api/expenses/{id} | Actualizar gasto |
| DELETE | /api/expenses/{id} | Eliminar gasto |

### Maintenances

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/motorcycles/{id}/maintenances | Mantenimientos de una moto |
| POST | /api/motorcycles/{id}/maintenances | Crear mantenimiento |
| PUT | /api/maintenances/{id} | Actualizar mantenimiento |
| PUT | /api/maintenances/{id}/complete | Marcar como completado |
| DELETE | /api/maintenances/{id} | Eliminar mantenimiento |

### Notifications

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/notifications/subscribe | Guardar FCM token |
| POST | /api/notifications/send | Enviar notificación de prueba para demo/testing |

---

## Configuración PlanetScale

```yaml
# application.yml
spring:
  application:
    name: mototracker

  datasource:
    url: jdbc:mysql://${PLANETSCALE_HOST}:3306/${PLANETSCALE_DATABASE}?sslaccept=strict
    username: ${PLANETSCALE_USER}
    password: ${PLANETSCALE_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
```

Variables necesarias:
- `PLANETSCALE_HOST`
- `PLANETSCALE_USER`
- `PLANETSCALE_PASSWORD`
- `PLANETSCALE_DATABASE`

> Nota: `application.yml` lee variables de entorno. Un archivo `.env.example` puede servir como documentación, pero Spring Boot no carga `.env` automáticamente sin configuración adicional.

---

## Frontend React Native (Expo)

### Estructura de Carpetas

```
mobile/
├── src/
│   ├── app/              # Expo Router (file-based routing)
│   ├── components/       # Button, Input, Card, etc.
│   ├── context/          # AuthContext (JWT state)
│   ├── services/         # api.js, authService, motorcycleService
│   └── theme/            # colors, spacing
```

### Cliente API con Axios

```javascript
const api = axios.create({
  baseURL: BASE_URL, // http://localhost:8080/api
  timeout: 10000,
});

// Request interceptor: agrega JWT
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Navegación

```
Root Stack:
├── Splash
├── Auth Stack:
│   ├── Login
│   └── Register
└── Main Stack:
    ├── Dashboard
    ├── MotorcycleDetail
    ├── AddMotorcycle
    ├── AddExpense
    ├── AddMaintenance
    └── Settings
```

---

## Por Qué PlanetScale

- MySQL serverless (no necesitás gestionar servidores)
- Conexión SSL directa
- Branchning como Git (ideal para desarrollo)
- Plan gratuito disponible