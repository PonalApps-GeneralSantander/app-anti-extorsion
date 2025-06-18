# INDICACIONES PARA BACKEND NESTJS - SISTEMA DE REPORTES DE EXTORSIÓN

## CONTEXTO
Necesito integrar un endpoint en una aplicación NestJS existente para recibir reportes de extorsión desde una app móvil React Native de la Policía Nacional de Colombia.

## ANÁLISIS DEL FRONTEND

### Campos del formulario identificados:
1. **phoneNumber** (string, obligatorio) - Número telefónico sospechoso
2. **date** (string, obligatorio) - Fecha del incidente (formato DD/MM/AAAA)
3. **time** (string, obligatorio) - Hora del incidente (formato HH:MM)
4. **description** (string, obligatorio) - Descripción detallada del incidente
5. **hasEvidence** (boolean) - Si cuenta con evidencia (grabaciones, mensajes)
6. **anonymous** (boolean) - Si el reporte es anónimo
7. **reporterName** (string, condicional) - Nombre del denunciante (obligatorio si no es anónimo)
8. **reporterContact** (string, condicional) - Contacto del denunciante (obligatorio si no es anónimo)
9. **termsAccepted** (boolean, obligatorio) - Aceptación de términos y condiciones

### Validaciones identificadas en el frontend:
- Campos obligatorios: phoneNumber, date, time, description
- Si anonymous = false: reporterName y reporterContact son obligatorios
- termsAccepted debe ser true siempre
- phoneNumber debe tener formato de teléfono
- date debe tener formato DD/MM/AAAA
- time debe tener formato HH:MM

## REQUERIMIENTOS PARA EL BACKEND

### 1. ESTRUCTURA DE LA BASE DE DATOS
Crear una entidad `Report` con los siguientes campos:
- **id** (UUID, primary key, auto-generated)
- **phoneNumber** (string, not null)
- **incidentDate** (Date, not null) - Convertir date + time a DateTime
- **description** (text, not null)
- **hasEvidence** (boolean, default false)
- **isAnonymous** (boolean, default false)
- **reporterName** (string, nullable)
- **reporterContact** (string, nullable)
- **termsAccepted** (boolean, not null, default true)
- **status** (enum: 'PENDING', 'IN_REVIEW', 'RESOLVED', 'CLOSED', default 'PENDING')
- **createdAt** (timestamp, auto-generated)
- **updatedAt** (timestamp, auto-generated)
- **ipAddress** (string, nullable) - Para auditoría
- **userAgent** (string, nullable) - Para auditoría

### 2. DTO DE ENTRADA (CreateReportDto)
```typescript
// Estructura esperada del DTO
{
  phoneNumber: string; // Validar formato teléfono colombiano
  date: string; // DD/MM/AAAA
  time: string; // HH:MM
  description: string; // Min 10 caracteres, max 1000
  hasEvidence: boolean;
  anonymous: boolean;
  reporterName?: string; // Requerido si anonymous = false
  reporterContact?: string; // Requerido si anonymous = false
  termsAccepted: boolean; // Debe ser true
}
```

### 3. VALIDACIONES NECESARIAS
- Usar class-validator para validaciones
- Validar formato de teléfono colombiano (regex)
- Validar formato de fecha y hora
- Validación condicional: si anonymous = false, validar reporterName y reporterContact
- Sanitizar inputs para prevenir XSS
- Validar que termsAccepted sea true

### 4. ENDPOINT REQUERIDO
- **POST /reports**
- **Método:** createReport()
- **Response exitoso:** `{ success: true, message: "Reporte enviado exitosamente", reportId: "uuid" }`
- **Response error:** `{ success: false, message: "Error específico", errors?: [] }`

### 5. FUNCIONALIDADES ADICIONALES
- Logging de todos los reportes para auditoría
- Envío de email de confirmación (si no es anónimo)
- Rate limiting para prevenir spam
- Middleware de seguridad (helmet, cors)
- Encriptación de datos sensibles
- Generación de número de caso único

### 6. ESTRUCTURA DE RESPUESTA
```typescript
// Respuesta exitosa
{
  success: true,
  message: "Su reporte ha sido enviado exitosamente. Un oficial se pondrá en contacto con usted a la brevedad.",
  data: {
    reportId: "uuid",
    caseNumber: "EXT-2024-001234",
    status: "PENDING"
  }
}

// Respuesta de error
{
  success: false,
  message: "Error en el envío del reporte",
  errors: [
    {
      field: "phoneNumber",
      message: "Formato de teléfono inválido"
    }
  ]
}
```

### 7. CONSIDERACIONES DE SEGURIDAD
- Validar y sanitizar todos los inputs
- Logs de auditoría con IP y timestamp
- Encriptar datos del denunciante si no es anónimo

### 8. SERVICIOS ADICIONALES
- **LoggerService** para auditoría
- **ValidationService** para validaciones complejas

## INSTRUCCIONES DE IMPLEMENTACIÓN

Por favor genera el código completo para NestJS incluyendo:

1. **Entity (TypeORM)** - Modelo de base de datos
2. **DTO con validaciones** - Validación de entrada
3. **Controller con endpoint POST** - Controlador REST
4. **Service con lógica de negocio** - Servicios de aplicación
5. **Module con todas las dependencias** - Módulo NestJS
6. **Middleware de seguridad** - Seguridad y rate limiting
7. **Configuración de rate limiting** - Prevención de spam
8. **Tests unitarios básicos** - Pruebas automatizadas

## NOTAS IMPORTANTES

- El código debe estar listo para integrar en una aplicación NestJS existente
- Debe manejar todos los casos de validación identificados en el frontend
- Priorizar la seguridad y confidencialidad de los datos
- Implementar logging completo para auditoría policial
- Considerar el contexto de uso por la Policía Nacional de Colombia

## CONTEXTO DE LA APLICACIÓN

Esta es una aplicación móvil para combatir la extorsión, desarrollada para la Policía Nacional de Colombia en la localidad de Kennedy, Bogotá. Los reportes son confidenciales y serán utilizados exclusivamente para fines de investigación policial.

---

**Archivo generado desde:** `app/reportar.tsx`  
**Fecha:** $(date)  
**Propósito:** Integración backend para sistema anti-extorsión 