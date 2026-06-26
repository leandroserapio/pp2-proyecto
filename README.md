# MotoTracker

MotoTracker es una aplicacion movil pensada para usuarios de motos. Su objetivo principal es **recordarle al usuario cuando debe hacer el mantenimiento de su moto**: cambio de aceite, lubricacion y tension de cadena, service, control de neumaticos, filtro de aire y otras tareas habituales.

Para eso, la app permite registrar una o varias motos, configurar recordatorios por **tiempo** o **kilometraje**, recibir alertas y llevar un historial de cada control realizado. Ademas, complementa ese control con el registro de gastos, mantenimientos y viajes asociados a cada vehiculo.

El sistema busca centralizar la informacion principal de la moto en una sola aplicacion, ayudando al usuario a no olvidar tareas importantes y a conocer el estado general y el costo de uso de su moto.

## Funcionalidades principales

- Registro e inicio de sesion de usuarios.
- Registro de una o varias motos por usuario.
- **Recordatorios de mantenimiento** por tiempo o kilometraje (aceite, cadena, service, neumaticos, filtro de aire, etc.).
- **Alertas y notificaciones** cuando un recordatorio esta proximo o vencido.
- **Registro del historial** de recordatorios completados por moto.
- Visualizacion de datos principales de la moto, como marca, modelo, patente y kilometraje.
- Actualizacion del kilometraje actual.
- Registro, edicion y consulta de gastos.
- Registro de mantenimientos realizados.
- Organizacion de viajes, con destino, fecha, kilometros estimados, presupuesto y notas.
- Gestion de datos del perfil y configuracion de la aplicacion.

## Tecnologias utilizadas

### Frontend

- React Native
- Expo
- Expo Go
- TypeScript
- React Navigation
- Async Storage
- Expo Notifications

### Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Maven

### Base de datos

- MySQL

## Estructura del proyecto

```text
pp2-proyecto/
+-- backend/     API REST desarrollada con Spring Boot
+-- frontend/    Aplicacion movil desarrollada con React Native y Expo
+-- docs/        Documentacion del proyecto
```

## Instalacion y ejecucion local

Para clonar, configurar y ejecutar el proyecto en otra computadora, seguir la guia detallada en [docs/INSTALACION-PROYECTO.md](docs/INSTALACION-PROYECTO.md).

### Requisitos previos

Para correr el proyecto localmente es necesario tener instalado:

- Git
- Node.js
- npm
- Java 21
- MySQL
- Expo Go, en caso de probar la app desde un celular

El proyecto incluye Maven Wrapper, por lo que **no es obligatorio instalar Maven** de forma global.

### Configuracion de la base de datos

Crear una base de datos en MySQL con el nombre:

```sql
CREATE DATABASE mototracker;
```

Luego crear o configurar las credenciales de conexion en el archivo (no se versiona en el repositorio):

```text
backend/src/main/resources/application.properties
```

Ejemplo de configuracion:

```properties
spring.application.name=mototracker

server.address=0.0.0.0
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/mototracker
spring.datasource.username=root
spring.datasource.password=tu_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### Ejecucion del backend

Desde la carpeta del backend:

```bash
cd backend
./mvnw spring-boot:run
```

En Windows tambien puede ejecutarse con:

```bash
cd backend
mvnw.cmd spring-boot:run
```

El backend se ejecuta por defecto en:

```text
http://localhost:8080
```

### Ejecucion del frontend

Desde la carpeta del frontend:

```bash
cd frontend
npm install
npm start
```

El proyecto frontend se ejecuta con Expo. Al iniciar el servidor de desarrollo, Expo muestra un codigo QR que puede escanearse desde la aplicacion Expo Go en un celular.

Para correr la version web:

```bash
npm run web
```

Para correr en Android:

```bash
npm run android
```

Tambien se puede escanear el codigo QR generado por Expo usando la aplicacion Expo Go desde el celular.

Si se prueba desde un celular fisico, puede ser necesario configurar la URL del backend con la IP local de la PC. Ver la seccion correspondiente en [docs/INSTALACION-PROYECTO.md](docs/INSTALACION-PROYECTO.md).

## Relacion entre entidades principales

```text
Usuario 1 ---- N Moto

Moto 1 ---- N Recordatorio
Moto 1 ---- N Gasto
Moto 1 ---- N Mantenimiento
Moto 1 ---- N Viaje
```

Un usuario puede registrar una o varias motos.
Cada moto puede tener muchos recordatorios, gastos, mantenimientos y viajes asociados.
Los recordatorios se configuran por moto y alertan segun tiempo transcurrido o kilometraje recorrido.

## Endpoints principales

El backend expone una API REST para gestionar las entidades principales del sistema:

- Usuarios
- Motos
- Recordatorios
- Gastos
- Mantenimientos
- Viajes
- Rutas

## Justificacion del proyecto

Muchas personas que usan moto no llevan un control ordenado del mantenimiento preventivo. Eso puede generar olvidos importantes: no cambiar el aceite a tiempo, no lubricar o revisar la cadena, postergar un service o no saber cuando fue la ultima revision de neumaticos.

MotoTracker busca resolver ese problema con recordatorios configurables y alertas desde el celular, junto con un registro simple del historial, los gastos y el kilometraje de cada moto.

## Integrantes del grupo

- Luciano Larrosa
- Leandro Serapio
- Matias Palacio
- Aylen Abalos
- Alex Trigo

## Estado del proyecto

Proyecto desarrollado como parte de la materia Proyecto Profesional II.
