# Base de datos - MotoTracker

La base de datos utilizada por MotoTracker es MySQL.

## Nombre de la base de datos

```sql
CREATE DATABASE mototracker;
```

## Tablas principales

- usuarios
- motos
- gastos
- mantenimientos
- viajes
- recordatorios

## Relaciones principales

```text
Usuario 1 ---- N Moto

Moto 1 ---- N Gasto
Moto 1 ---- N Mantenimiento
Moto 1 ---- N Viaje
Moto 1 ---- N Recordatorio
```

Un usuario puede registrar una o varias motos.
Cada moto puede tener muchos gastos, mantenimientos, viajes y recordatorios asociados.

## Uso de la base de datos

La base de datos guarda la informacion principal de la aplicacion:

- Datos de usuarios.
- Motos registradas.
- Gastos asociados a cada moto.
- Mantenimientos realizados.
- Viajes planificados.
- Recordatorios de controles o tareas pendientes.

## Configuracion local

La conexion se configura en:

```text
backend/src/main/resources/application.properties
```

Ejemplo:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mototracker
spring.datasource.username=root
spring.datasource.password=tu_password

spring.jpa.hibernate.ddl-auto=update
```
