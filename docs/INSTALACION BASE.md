# Instalacion y ejecucion local - MotoTracker

## Requisitos previos

Para correr el proyecto localmente es necesario tener instalado:

- Node.js
- npm
- Java 21
- Maven
- MySQL
- Expo Go, si se desea probar la app desde un celular

## 1. Clonar o abrir el proyecto

Abrir una terminal en la carpeta raiz del proyecto:

```bash
pp2-proyecto
```

## 2. Crear la base de datos

Desde MySQL Workbench o desde la consola de MySQL, ejecutar:

```sql
CREATE DATABASE mototracker;
```

## 3. Configurar el backend

Entrar a la carpeta del backend:

```bash
cd backend
```

Configurar el archivo:

```text
src/main/resources/application.properties
```

Ejemplo:

```properties
spring.application.name=mototracker

server.address=0.0.0.0
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/mototracker
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

Reemplazar `TU_PASSWORD` por la contrasena local de MySQL.

## 4. Ejecutar el backend

Desde la carpeta `backend`, ejecutar:

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

El backend queda disponible en:

```text
http://localhost:8080
```

## 5. Instalar dependencias del frontend

Abrir otra terminal y entrar a la carpeta del frontend:

```bash
cd frontend
npm install
```

## 6. Ejecutar el frontend con Expo

Desde la carpeta `frontend`, ejecutar:

```bash
npm start
```

Expo iniciara el servidor de desarrollo y mostrara un codigo QR. Ese codigo puede escanearse desde la aplicacion Expo Go instalada en el celular.

Tambien se puede ejecutar la app en web:

```bash
npm run web
```

O en Android:

```bash
npm run android
```

## Problemas frecuentes

### El puerto 8080 esta ocupado

En Windows, buscar el proceso:

```bash
netstat -ano | findstr :8080
```

Luego finalizarlo reemplazando `NUMERO` por el PID:

```bash
taskkill /PID NUMERO /F
```

### Error Unknown database mototracker

Crear la base de datos:

```sql
CREATE DATABASE mototracker;
```

### Error de contrasena de MySQL

Revisar esta linea en `application.properties`:

```properties
spring.datasource.password=TU_PASSWORD
```

Debe contener la contrasena real de MySQL local.
