# Medical Appointment Service

Este proyecto es un servicio de gestión de citas médicas para asegurados, desarrollado con AWS Lambda, API Gateway, DynamoDB, SQS, SNS y Serverless Framework.  

## 🚀 Características  

- **Registro de citas** en DynamoDB y publicación en SNS.  
- **Procesamiento de citas** desde colas SQS y almacenamiento en MySQL.  
- **Actualización del estado de citas** en DynamoDB.  
- **Infraestructura como código** con Terraform y Serverless Framework.  

## 📂 Estructura del Proyecto  
```console
# Clean Architecture 
# Lambdas → Infrastructure → Application → Domain
.
├── README.md
├── docs
│   └── openapi.yaml
├── infraestructure
│   └── terraform       # Infra en Terraform, ejemplo
├── src
│   ├── application       #Lógica de aplicación
│   │   └── use-cases
│   ├── domain        # Lógica de negocio
│   │   ├── enums
│   │   ├── models
│   │   └── repositories
│   ├── infraestructure       # Conexiones a servicios externos
│   │   ├── controllers
│   │   ├── db
│   │   ├── events
│   │   └── validators
│   └── lambdas
├── tests
│   ├── invokes       # Eventos de prueba
│   └── lambdas       # Pruebas unitarias para Lambdas
├── tsconfig.json
├── jest.config.js
├── package-lock.json
├── package.json
├── serverless.yml      # Infra en Serverless Framework
```

## 🛠 Tecnologías  

- **Lenguaje:** TypeScript  
- **Cloud:** AWS Lambda, API Gateway, DynamoDB, SQS, SNS  
- **Infraestructura:** Serverless Framework, Terraform (Inactivo)
- **Base de datos:** DynamoDB, MySQL (RDS)  
- **Testing:** Jest  

## 🚀 Instalación y Despliegue  

### 1️⃣ Instalación 
```console
npm install
```

### 2️⃣ Despliegue con Serverless Framework
```console
npx serverless deploy
```

### 3️⃣ Ejecutar Pruebas
```console
npm test
```

## 📌 Endpoints

### ➤ Registrar una cita

```markdown
POST /appointments

{
  "insuredId": "12345",
  "scheduleId": 1,
  "countryISO": "PE"
}
```
### ➤ Obtener citas por asegurado

```markdown
GET /appointments/{insuredId}
```

## 📄 Documentación

La documentación OpenAPI está disponible en docs/openapi.yaml. Para visualizarla en Swagger UI, puedes usar:

```console
npx swagger-ui-watcher docs/openapi.yaml
```

O puedes acceder a este enlace (recomendado):
https://app.swaggerhub.com/apis/ind-e62/medical-appointment_api/1.0.0