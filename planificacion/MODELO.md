# Modelo de Datos — mototracker

## 1. Diagrama ER

```text
USER 1:N MOTORCYCLE
USER 1:N DEVICE_TOKEN
MOTORCYCLE 1:N EXPENSE
MOTORCYCLE 1:N MAINTENANCE

CASCADE DELETE: eliminar moto elimina sus expenses y maintenances.
```

### Entidades principales

#### USER

| Campo | Tipo | Notas |
|------|------|-------|
| id | Long | PK, autoincremental |
| email | String | Único |
| password | String | BCrypt encoded |
| name | String | Nombre del usuario |
| createdAt | LocalDateTime | Fecha de creación |

#### MOTORCYCLE

| Campo | Tipo | Notas |
|------|------|-------|
| id | String UUID | PK |
| user_id | Long | FK a User |
| brand | String | Marca |
| model | String | Modelo |
| year | Integer | Año |
| plate | String | Única por usuario |
| currentKm | Integer | Kilometraje actual |

#### EXPENSE

| Campo | Tipo | Notas |
|------|------|-------|
| id | String UUID | PK |
| motorcycle_id | String UUID | FK a Motorcycle |
| type | ExpenseType | NAFTA, SERVICE, CHAIN, OIL, INSURANCE, PARTS, REGISTRATION, OTHER |
| amount | BigDecimal | Monto |
| kilometers | Integer | Kilometraje al momento del gasto |
| expenseDate | LocalDate | Fecha del gasto |
| description | String | Opcional |

#### MAINTENANCE

| Campo | Tipo | Notas |
|------|------|-------|
| id | String UUID | PK |
| motorcycle_id | String UUID | FK a Motorcycle |
| title | String | Título del mantenimiento |
| description | String | Descripción detallada |
| dueDate | LocalDate | Fecha de recordatorio, opcional |
| dueKm | Integer | Kilometraje de recordatorio, opcional |
| cost | BigDecimal | Costo estimado |
| status | MaintenanceStatus | PENDING, COMPLETED |
| completedAt | LocalDateTime | Fecha de completado |

**Regla:** Se puede establecer dueDate, dueKm, o ambos. El sistema notifica cuando se cumple cualquiera de los dos.

#### DEVICE_TOKEN

| Campo | Tipo | Notas |
|------|------|-------|
| id | Long | PK, autoincremental |
| user_id | Long | FK a User |
| token | String | Token FCM |
| platform | String | android por defecto |

---

## 2. JPA Entities

### User.java

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;  // BCrypt encoded

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

### Motorcycle.java

```java
@Entity
@Table(name = "motorcycles", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "plate"})
})
public class Motorcycle {
    @Id
    @Column(length = 36)
    private String id;  // UUID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false, length = 10)
    private String plate;

    @Column(name = "current_km", nullable = false)
    private Integer currentKm = 0;

@OneToMany(mappedBy = "motorcycle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Expense> expenses = new ArrayList<>();

    @OneToMany(mappedBy = "motorcycle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Maintenance> maintenances = new ArrayList<>();
}
```

### Expense.java

```java
@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorcycle_id", nullable = false)
    private Motorcycle motorcycle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExpenseType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private Integer kilometers;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(length = 500)
    private String description;
}

public enum ExpenseType {
    NAFTA, SERVICE, CHAIN, OIL, INSURANCE, PARTS, REGISTRATION, OTHER
}
```

### Maintenance.java

```java
@Entity
@Table(name = "maintenances")
public class Maintenance {
    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorcycle_id", nullable = false)
    private Motorcycle motorcycle;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "due_km")
    private Integer dueKm;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MaintenanceStatus status = MaintenanceStatus.PENDING;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}

public enum MaintenanceStatus {
    PENDING, COMPLETED
}
```

### DeviceToken.java

```java
@Entity
@Table(name = "device_tokens", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "token"})
})
public class DeviceToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 500)
    private String token;

    @Column(nullable = false, length = 20)
    private String platform = "android";
}
```

---

## 3. Repositories con filtro por userId

### MotorcycleRepository.java

```java
@Repository
public interface MotorcycleRepository extends JpaRepository<Motorcycle, String> {
    List<Motorcycle> findAllByUserId(Long userId);
    Optional<Motorcycle> findByIdAndUserId(String id, Long userId);
    boolean existsByUserIdAndPlate(Long userId, String plate);
}
```

### ExpenseRepository.java

```java
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {
    @Query("SELECT e FROM Expense e WHERE e.motorcycle.id = :motorcycleId AND e.motorcycle.user.id = :userId ORDER BY e.expenseDate DESC")
    List<Expense> findAllByMotorcycleIdAndUserId(@Param("motorcycleId") String motorcycleId, @Param("userId") Long userId);

    @Query("SELECT e FROM Expense e WHERE e.id = :expenseId AND e.motorcycle.user.id = :userId")
    Optional<Expense> findByIdAndUserId(@Param("expenseId") String expenseId, @Param("userId") Long userId);
}
```

### MaintenanceRepository.java

```java
@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, String> {
    @Query("SELECT m FROM Maintenance m WHERE m.motorcycle.id = :motorcycleId AND m.motorcycle.user.id = :userId ORDER BY m.dueDate ASC")
    List<Maintenance> findByMotorcycleIdAndUserIdOrderByDueDateAsc(@Param("motorcycleId") String motorcycleId, @Param("userId") Long userId);

    @Query("SELECT m FROM Maintenance m WHERE m.id = :maintenanceId AND m.motorcycle.user.id = :userId")
    Optional<Maintenance> findByIdAndUserId(@Param("maintenanceId") String maintenanceId, @Param("userId") Long userId);
}
```

---

## 4. DTOs

### Auth DTOs

```java
public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String password,
    @NotBlank String name
) {}

public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}

public record AuthResponse(
    String token,
    String email,
    String name,
    Long expiresIn
) {}

public record UserDTO(
    Long id,
    String email,
    String name
) {}
```

### Motorcycle DTOs

```java
public record MotorcycleDTO(
    String id,
    String brand,
    String model,
    Integer year,
    String plate,
    Integer currentKm
) {}

public record CreateMotorcycleRequest(
    @NotBlank String brand,
    @NotBlank String model,
    @NotNull @Min(1900) @Max(2030) Integer year,
    @NotBlank @Size(max = 10) String plate,
    @NotNull @Min(0) Integer currentKm
) {}

public record UpdateMotorcycleRequest(
    @NotBlank String brand,
    @NotBlank String model,
    @NotNull @Min(1900) @Max(2030) Integer year,
    @NotBlank @Size(max = 10) String plate,
    @NotNull @Min(0) Integer currentKm
) {}
```

### Expense DTOs

```java
public record ExpenseDTO(
    String id,
    String motorcycleId,
    ExpenseType type,
    BigDecimal amount,
    Integer kilometers,
    LocalDate expenseDate,
    String description
) {}

public record CreateExpenseRequest(
    @NotNull ExpenseType type,
    @NotNull @Positive BigDecimal amount,
    @NotNull @Min(0) Integer kilometers,
    @NotNull LocalDate expenseDate,
    String description
) {}

public record UpdateExpenseRequest(
    @NotNull ExpenseType type,
    @NotNull @Positive BigDecimal amount,
    @NotNull @Min(0) Integer kilometers,
    @NotNull LocalDate expenseDate,
    String description
) {}
```

### Maintenance DTOs

```java
public record MaintenanceDTO(
    String id,
    String motorcycleId,
    String title,
    String description,
    LocalDate dueDate,
    Integer dueKm,
    BigDecimal cost,
    MaintenanceStatus status,
    LocalDateTime completedAt
) {}

public record CreateMaintenanceRequest(
    @NotBlank String title,
    String description,
    LocalDate dueDate,
    Integer dueKm,
    @NotNull @PositiveOrZero BigDecimal cost
) {}

public record UpdateMaintenanceRequest(
    @NotBlank String title,
    String description,
    LocalDate dueDate,
    Integer dueKm,
    @NotNull @PositiveOrZero BigDecimal cost,
    MaintenanceStatus status
) {}
```

---

## 5. Exception Handling

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MotorcycleNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleMotorcycleNotFound(MotorcycleNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(PlateAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handlePlateAlreadyExists(PlateAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse("DUPLICATE_PLATE", ex.getMessage()));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse("DUPLICATE_EMAIL", ex.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("INVALID_CREDENTIALS", "Email o contraseña incorrectos"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> new FieldError(fe.getField(), fe.getDefaultMessage()))
            .collect(Collectors.toList());
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", "Campos inválidos", errors));
    }
}

public record ErrorResponse(String code, String message, List<FieldError> errors) {}
public record FieldError(String field, String message) {}
```

---

## 6. Reglas de Seguridad

### REGLA DE ORO: siempre filtrar por userId

```java
// ✅ CORRECTO
motorcycleRepository.findByIdAndUserId(id, userId)
expenseRepository.findByIdAndUserId(id, userId)
maintenanceRepository.findByIdAndUserId(id, userId)

// ❌ INCORRECTO
motorcycleRepository.findById(id)
expenseRepository.findById(id)
maintenanceRepository.findById(id)
```

Cada query a motorcycles, expenses o maintenances DEBE incluir userId para aislamiento de datos entre usuarios.
