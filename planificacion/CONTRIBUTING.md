# Guía de Contribución — mototracker

> Este documento establece las reglas de trabajo para todo el equipo.

---

## 1. Ramas por Persona

**CADA PERSONA TRABAJA ÚNICAMENTE EN SUS RAMAS ASIGNADAS.**

```
develop
├── feature/auth-backend           ← Backend 1: User, JWT, Security
├── feature/moto-expense-backend  ← Backend 2: Motorcycle + Expense
├── feature/maintenance-backend      ← Backend 3: Maintenance + Notifications
├── feature/auth-frontend         ← Frontend 1: Login, Register
├── feature/dashboard-frontend    ← Frontend 1: Dashboard, Agregar Moto
├── feature/detail-frontend      ← Frontend 2: Detalle, Expenses, Mantenimientos
└── feature/notif-frontend       ← Frontend 1: Push Notifications
```

### Reglas Obligatorias

1. **NUNCA** commitear directo a `main` o `develop`
2. **Solo tus ramas asignadas** — no tocar el código de otros
3. Los PR requieren **1 reviewer aprobado** antes de merge
4. Merge a `develop` solo después de probar localmente

---

## 2. Setup Inicial

```bash
# Clonar el repo
git clone https://github.com/tu-usuario/mototracker.git
cd mototracker

# Crear tu branch asignada una sola vez
git checkout develop
git checkout -b feature/auth-backend

# Si la branch ya existe, solo cambiarse a ella
git checkout feature/auth-backend
```

---

## 3. Commits — Conventional Commits

```
<tipo>(<scope>): <descripcion>
```

### Tipos

| Tipo | Cuándo usar |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Cambios sin cambiar funcionalidad |
| `test` | Tests |
| `docs` | Documentación |
| `chore` | Build, config, dependencias |

### Ejemplos

```bash
git commit -m "feat(auth): agregar User entity con BCrypt"
git commit -m "feat(motorcycle): agregar endpoints CRUD"
git commit -m "fix(expense): corregir null pointer"
```

### Reglas

- **Título en español** — equipo hispanohablante
- **Una funcionalidad por commit** — no mezclar cambios
- **Comitear siempre** — no dejar código sin commitear

---

## 4. Workflow Diario

```
CADA DÍA:
1. git checkout feature/tu-rama
2. git pull origin develop
3. CODING
4. git add . && git commit -m "..."
5. git push origin feature/tu-rama

VIERNES:
1. Crear PR en GitHub hacia develop
2. Asignar reviewer
3. Esperar revisión
4. Hacer merge
```

### Sincronizar con develop

```bash
# Rebase (historial limpio)
git checkout feature/tu-rama
git fetch origin
git rebase origin/develop

# O merge (más seguro)
git checkout feature/tu-rama
git pull origin develop
git merge develop
```

---

## 5. Pull Requests

### Template de PR

```markdown
## Descripción
[Qué hace este PR]

## Tipo de cambio
- [ ] Nueva funcionalidad
- [ ] Corrección de bug
- [ ] Refactor
- [ ] Documentación

## Checklist pre-PR
- [ ] El código compila/funciona
- [ ] No hay console.log de debug
- [ ] Nombres claros y descriptivos
- [ ] Documentación actualizada (si aplica)

## Cómo testar
1. [Paso 1]
2. [Paso 2]
```

---

## 6. Code Review

### Como AUTHOR

- PR completo antes de solicitar review
- Responder a todos los comentarios
- No hacer force push mientras alguien revisa

### Como REVIEWER

- Revisar dentro de las 24 horas
- Verificar: lógica, naming, tests
- Comentar con sugerencias concretas
- Aprobar o pedir cambios con razón clara

---

## 7. Conflictos de Merge

```bash
# Ver qué archivos tienen conflictos
git status

# Editar los archivos con conflictos
# Buscar <<<<<<< HEAD, =======, >>>>>>> develop
# Decidir cuál queda o combinar
git add archivo-resuelto.md
git commit -m "merge: resolve conflicts from develop"
git push
```

---

## 8. Reglas de Convivencia

| Regla | Por qué |
|-------|---------|
| **No guardar código en la PC** | Siempre push al final del día |
| **No subir binarios** | No subir imágenes/videos |
| **No cambiar estructura general** | Si necesitás restructurar, discutirlo |
| **Preguntar si no sabés** | Mejor preguntar que romper algo |
| **Documentar decisiones** | Si hacen algo no obvio, dejar comment |

---

## 9. Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Backend** | Java 17 + Spring Boot 3 + Gradle |
| **Auth** | JWT + BCrypt |
| **Database** | MySQL 8 (PlanetScale) |
| **ORM** | Spring Data JPA / Hibernate |
| **API** | REST + SpringDoc OpenAPI |
| **Mobile** | React Native (Expo) + Expo Router |
| **Notificaciones** | Firebase Cloud Messaging (FCM) |

---

## 10. Estructura Backend POR FEATURE

```
backend/src/main/java/com/mototracker/
├── auth/               # User, AuthService, JwtService, DTOs
├── motorcycle/         # Motorcycle entity, service, controller, DTOs
├── expense/            # Expense entity, service, controller, DTOs
├── maintenance/           # Maintenance entity, service, controller, DTOs
├── notification/       # FCMService, NotificationController
└── config/             # SecurityConfig, JwtAuthFilter, OpenApiConfig
```

**NO usar:**

```
controller/
service/
repository/
model/
dto/
```

---

## 11. Seguridad — Reglas Importantes

### Backend

1. **TODAS las queries DEBEN filtrar por userId**
   ```java
   // ✅ CORRECTO
   Optional<Motorcycle> findByIdAndUserId(String id, Long userId);

   // ❌ INCORRECTO
   Optional<Motorcycle> findById(String id);
   ```
2. **BCrypt** — NUNCA passwords en texto plano
3. **JWT** — 24 horas máximo
4. **No loguear passwords o tokens**

### Frontend

1. **JWT en AsyncStorage** — no en variables globales
2. **Interceptor** — agregar Bearer token a cada request
3. **Manejar 401** — logout automático si token expira

---

## 12. Contactos del Equipo

| Persona | Rol | Rama |
|---------|-----|------|
| - | PM + Analista | - |
| - | Backend 1 | feature/auth-backend |
| - | Backend 2 | feature/moto-expense-backend |
| - | Backend 3 | feature/maintenance-backend |
| - | Frontend 1 | feature/auth-frontend, feature/dashboard-frontend, feature/notif-frontend |
| - | Frontend 2 | feature/detail-frontend |
| - | UX/UI | - |

---

## Links Útiles

- [Modelo de datos](./docs/MODELO.md)
- [Propuesta técnica](./docs/PROPUESTA.md)
- [Lista de tareas](./TAREAS.md)