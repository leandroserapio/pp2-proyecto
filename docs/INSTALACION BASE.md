PASOS PARA EJECUTAR EL BACKEND DE MOTOTRACKER

1 - Entrar a la carpeta del backend

Abrir una terminal dentro del proyecto y ejecutar:

cd backend


2 - Verificar que Java esté instalado

java -version

Tiene que aparecer Java 17 o superior.


3 - Verificar que Maven esté instalado

mvn -version

Si no aparece la versión de Maven, hay que instalar Maven o configurar las variables de entorno.


4 - Abrir MySQL y crear la base de datos

Desde MySQL Workbench o consola de MySQL, ejecutar:

CREATE DATABASE mototracker;
USE mototracker;


5 - Crear el archivo application.properties

Dentro de la carpeta:

src/main/resources/

crear el archivo:

application.properties

y colocar este código:

spring.application.name=backend

spring.datasource.url=jdbc:mysql://localhost:3306/mototracker
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

IMPORTANTE:
Reemplazar TU_PASSWORD por la contraseña local de MySQL de cada computadora.

Ejemplo:

spring.datasource.password=1234


6 - Instalar dependencias / compilar el proyecto

Desde la carpeta backend ejecutar:

mvn clean install


7 - Ejecutar el backend

Desde la carpeta backend ejecutar:

mvn spring-boot:run


8 - Verificar que levantó bien

En la consola debería aparecer algo parecido a:

Tomcat started on port 8080
Started BackendApplication

El backend queda corriendo en:

http://localhost:8080


12 - Si el puerto 8080 está ocupado

Ejecutar en terminal:

netstat -ano | findstr :8080

Si aparece un proceso en LISTENING, copiar el PID y ejecutar:

taskkill /PID NUMERO /F

Ejemplo:

taskkill /PID 2396 /F

Después volver a ejecutar:

mvn spring-boot:run


13 - Si aparece error Unknown database mototracker

Abrir MySQL y ejecutar:

CREATE DATABASE mototracker;


14 - Si aparece error de contraseña

Revisar esta línea en application.properties:

spring.datasource.password=TU_PASSWORD

Debe tener la contraseña real de MySQL local.
