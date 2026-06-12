# MotoTracker

MotoTracker es una aplicacion movil pensada para usuarios de motos. Permite registrar una o varias motos y llevar un control organizado del kilometraje, los gastos, los mantenimientos y los viajes asociados a cada vehiculo.

El sistema busca centralizar la informacion principal de la moto en una sola aplicacion, ayudando al usuario a conocer el estado general de su vehiculo, evitar olvidos de mantenimiento y registrar cuanto dinero invierte en su uso diario.

## Funcionalidades principales

- Registro e inicio de sesion de usuarios.
- Registro de una o varias motos por usuario.
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

### Requisitos previos

Para correr el proyecto localmente es necesario tener instalado:

- Node.js
- npm
- Java 21
- Maven
- MySQL
- Expo Go, en caso de probar la app desde un celular

## Configuracion de la base de datos

Crear una base de datos en MySQL con el nombre:

```sql
CREATE DATABASE mototracker;
```

Luego configurar las credenciales de conexion en el archivo:

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

## Ejecucion del backend

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

## Ejecucion del frontend

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

## Relacion entre entidades principales

```text
Usuario 1 ---- N Moto

Moto 1 ---- N Gasto
Moto 1 ---- N Mantenimiento
Moto 1 ---- N Viaje
```

Un usuario puede registrar una o varias motos.
Cada moto puede tener muchos gastos, mantenimientos y viajes asociados.

## Endpoints principales

El backend expone una API REST para gestionar las entidades principales del sistema:

- Usuarios
- Motos
- Gastos
- Mantenimientos
- Viajes
- Rutas

## Justificacion del proyecto

Muchas personas que usan moto no llevan un control ordenado del kilometraje, los gastos o los mantenimientos realizados. Esto puede generar olvidos importantes, como no hacer un service a tiempo, no controlar el cambio de aceite o no saber cuanto dinero se gasta realmente en la moto.

MotoTracker busca resolver este problema ofreciendo una herramienta simple y accesible para registrar y consultar la informacion principal de la moto desde el celular.

## Integrantes del grupo

- Luciano Larrosa
- Leandro Serapio
- Matias Palacio
- Aylen Abalos
- Alex Trigo

## Estado del proyecto

Proyecto desarrollado como parte de la materia Proyecto Profesional II.
