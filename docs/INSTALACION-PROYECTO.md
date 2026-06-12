# Instalacion del proyecto - MotoTracker

Esta guia explica como descargar y ejecutar MotoTracker desde otra computadora.

## Requisitos previos

Antes de comenzar, instalar:

- Git
- Node.js
- npm
- Java 21
- MySQL
- Expo Go, si se quiere probar la app desde un celular

El proyecto usa Maven Wrapper, por eso no es obligatorio instalar Maven de forma global.

## 1. Clonar el repositorio

Abrir una terminal y ejecutar:

```bash
git clone https://github.com/leandroserapio/pp2-proyecto.git
cd pp2-proyecto
```

## 2. Crear la base de datos

Abrir MySQL Workbench o la consola de MySQL y crear la base:

```sql
CREATE DATABASE mototracker;
```

## 3. Configurar el backend

Crear o revisar el archivo:

```text
backend/src/main/resources/application.properties
```

Configurar las credenciales locales de MySQL:

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

Reemplazar `TU_PASSWORD` por la contrasena real de MySQL en esa computadora.

## 4. Ejecutar el backend

Desde la carpeta raiz del proyecto:

```bash
cd backend
mvnw.cmd spring-boot:run
```

En Linux o Mac:

```bash
cd backend
./mvnw spring-boot:run
```

El backend queda disponible en:

```text
http://localhost:8080
```

## 5. Instalar dependencias del frontend

Abrir otra terminal desde la carpeta raiz del proyecto:

```bash
cd frontend
npm install
```

## 6. Ejecutar el frontend con Expo

Desde la carpeta `frontend`:

```bash
npm start
```

Expo va a mostrar un codigo QR. Se puede escanear con Expo Go desde el celular.

Tambien se puede ejecutar en web:

```bash
npm run web
```

O en Android:

```bash
npm run android
```

## Uso desde un celular fisico

Si se usa Expo Go desde un celular real, el celular y la PC deben estar conectados a la misma red Wi-Fi.

En ese caso puede ser necesario indicar la IP local de la PC donde corre el backend:

```bash
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:8080 npm start
```

Ejemplo:

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080 npm start
```

En Windows PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.0.10:8080"
npm start
```

## Problemas frecuentes

### El puerto 8080 esta ocupado

En Windows:

```bash
netstat -ano | findstr :8080
```

Luego finalizar el proceso reemplazando `NUMERO` por el PID:

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

Debe tener la contrasena local correcta.
