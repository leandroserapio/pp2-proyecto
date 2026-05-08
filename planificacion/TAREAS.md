# Lista de Tareas — mototracker

> División de trabajo por persona. Cada tarea tiene criterio de DONE.

---

## Rama: `feature/auth-backend` — Backend 1

| # | Tarea | Criteria de DONE |
|---|-------|------------------|
| B1.1 | Setup proyecto Spring Boot con Gradle | Proyecto compila con `./gradlew build` |
| B1.2 | User entity (id, email, password BCrypt, name) | Entity con @Table(name = "users") |
| B1.3 | UserRepository (findByEmail, existsByEmail) | Repository funcional |
| B1.4 | JwtService (generateToken, extractUsername, isTokenValid) | JWT de 24h funcionando |
| B1.5 | AuthController + AuthService (register, login, me) | Endpoints POST /api/auth/register, POST /api/auth/login y GET /api/auth/me |
| B1.6 | DTOs (RegisterRequest, LoginRequest, AuthResponse) | Validaciones @NotBlank, @Email, @Size(8) |
| B1.7 | SecurityConfig + JwtAuthFilter | JWT protegiendo endpoints (excepto /api/auth/**) |
| B1.8 | GlobalExceptionHandler | Manejo de errores 400, 401, 404, 409 |

---

## Rama: `feature/moto-expense-backend` — Backend 2

| # | Tarea | Criteria de DONE |
|---|-------|------------------|
| B2.1 | Motorcycle entity (id UUID, user_id FK, brand, model, year, plate, currentKm) | Entity con @ManyToOne User |
| B2.2 | MotorcycleRepository (findAllByUserId, findByIdAndUserId) | Queries filtradas por userId |
| B2.3 | MotorcycleService + MotorcycleController | CRUD completo |
| B2.4 | MotorcycleDTO, CreateMotorcycleRequest, UpdateMotorcycleRequest | Validaciones y transformación |
| B2.5 | Validación: plate único por usuario | Error 409 si placa duplicada |
| B2.6 | Expense entity (id, motorcycle_id FK, type enum: NAFTA, SERVICE, CHAIN, OIL, INSURANCE, PARTS, REGISTRATION, OTHER, amount, kilometers, expenseDate, description) | Entity con relaciones |
| B2.7 | ExpenseRepository | Query filtrada por userId |
| B2.8 | ExpenseService + ExpenseController | CRUD completo: GET, POST, PUT, DELETE + actualizar currentKm si kilometers > actual |
| B2.9 | DTOs (ExpenseDTO, CreateExpenseRequest, UpdateExpenseRequest) | Validaciones @NotNull, @Positive |

---

## Rama: `feature/maintenance-backend` — Backend 3

| # | Tarea | Criteria de DONE |
|---|-------|------------------|
| B3.1 | Maintenance entity (id, motorcycle_id FK, title, description, dueDate, dueKm, cost, status) | Entity con enum MaintenanceStatus |
| B3.2 | MaintenanceRepository | Query filtrada por userId |
| B3.3 | MaintenanceService + MaintenanceController | CRUD completo: GET, POST, PUT, DELETE + mark complete |
| B3.4 | Setup Firebase Admin SDK | Dependency en build.gradle |
| B3.5 | FCMService (sendNotification) | Envía push a device token |
| B3.6 | Endpoint POST /api/notifications/subscribe | Guardar device token |
| B3.7 | Endpoint POST /api/notifications/send | Enviar notificación de prueba para demo/testing |

---

## Rama: `feature/auth-frontend` — Frontend 1

| # | Tarea | Criteria de DONE |
|---|-------|------------------|
| F1.1 | Setup proyecto Expo con Expo Router | `npx expo start` funciona |
| F1.2 | Crear estructura de carpetas | app/, components/, context/, services/ |
| F1.3 | AuthContext con AsyncStorage | Login, register, logout, persistencia de JWT |
| F1.4 | Pantalla Login (email, password) | UI según wireframes |
| F1.5 | Pantalla Register (name, email, password) | Validaciones de frontend |
| F1.6 | Proteger rutas: redirect a login si no hay JWT | Redirect automático |
| F1.7 | api.js con interceptor de JWT | Bearer token en cada request |

---

## Rama: `feature/dashboard-frontend` — Frontend 1

| # | Tarea | Criteria de DONE |
|---|-------|------------------|
| F2.1 | Setup navegación con Expo Router | Stack navigator |
| F2.2 | Pantalla Dashboard (FlatList de motorcycles) | Muestra lista desde API |
| F2.3 | Navegación: Dashboard → Detalle Moto | Tap en moto abre detalle |
| F2.4 | Empty state cuando no hay motos | Mensaje + CTA para agregar |
| F2.5 | Loading spinner y manejo de errores | Estados de carga/error |
| F2.6 | Pantalla Agregar Moto | Formulario completo |
| F2.7 | POST /api/motorcycles | Crear moto en backend |
| F2.8 | Redirect a Dashboard después de crear | Navegación funcional |

---

## Rama: `feature/detail-frontend` — Frontend 2

| # | Tarea | Criteria de DONE |
|---|-------|------------------|
| F3.1 | Pantalla Detalle Moto | Muestra todos los datos de la moto |
| F3.2 | GET /api/motorcycles/{id}/maintenances | Lista de mantenimientos |
| F3.3 | Botón completar mantenimiento | PUT /api/maintenances/{id}/complete |
| F3.4 | Pantalla Agregar Expense (type dropdown, amount, kilometers, expenseDate) | Formulario completo |
| F3.5 | POST /api/motorcycles/{id}/expenses | Crear expense |
| F3.6 | Lista de expenses recientes | GET /api/motorcycles/{id}/expenses |
| F3.7 | Pantalla Agregar Mantenimiento (title, description, dueDate, dueKm, cost) | Formulario completo |
| F3.8 | POST /api/motorcycles/{id}/maintenances | Crear maintenance |
| F3.9 | Pantalla Settings | Mi cuenta, Cerrar sesión |
| F3.10 | Logout: limpiar AsyncStorage y redirect a Login | AuthContext.logout() |

---

## Rama: `feature/notif-frontend` — Frontend 1

| # | Tarea | Criteria de DONE |
|---|-------|------------------|
| F4.1 | Request permission notificaciones | Dialog nativo de push |
| F4.2 | Guardar FCM token en servidor | POST /api/notifications/subscribe |
| F4.3 | Deep link: tap en notificación abre detalle | Navegación desde notificación |

---

## Definition of DONE

Una tarea está completa cuando:

1. ✅ Código hecho y commiteado
2. ✅ Compila sin errores (backend) o Metro bundler happy (mobile)
3. ✅ Probado manualmente por el desarrollador
4. ✅ PR hecho y aprobado por reviewer
5. ✅ Mergeado a develop

---

## Prioridad (si hay tiempo limitado)

1. **Auth (login/register)** — Sin auth no hay nada
2. **Motorcycle CRUD** — Core functionality
3. **Expense CRUD** — Funcionalidad core
4. **Dashboard mobile** — Muestra las motos
5. **Maintenances** — Mantenimientos manuales
6. **Notifications** — Diferenciador (depende de maintenances)

---

## Referencias de Documentación

| Tema | Documento |
|------|-----------|
| Backend estructura + Auth | docs/MODELO.md |
| Modelo de datos | docs/MODELO.md |
| Frontend React Native | docs/PROPUESTA.md |
