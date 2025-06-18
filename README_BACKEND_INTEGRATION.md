# 🔗 Integración Backend - Frontend

## 📱 App Anti-Extorsión - Policía Nacional de Colombia

Esta documentación explica cómo está integrado el backend NestJS con la aplicación móvil React Native.

---

## 🏗️ Arquitectura de la Integración

### Componentes Principales

1. **ReportsService** (`services/reportsService.js`)
   - Servicio principal para comunicación con la API
   - Maneja todas las llamadas HTTP
   - Incluye validaciones locales
   - Formateo de datos

2. **ApiConfig** (`constants/ApiConfig.js`)
   - Configuración centralizada de URLs
   - Headers por defecto
   - Configuración por entornos
   - Rate limiting info

3. **ReportStatusModal** (`components/ReportStatusModal.tsx`)
   - Modal para consultar estado de reportes
   - Búsqueda por número de caso o ID
   - Visualización de estados

4. **Pantalla de Reportes** (`app/reportar.tsx`)
   - Formulario principal de reportes
   - Integración completa con la API
   - Manejo de errores robusto

---

## 🔌 Endpoints Integrados

### 1. Crear Reporte
- **Endpoint:** `POST /api/v1/reports`
- **Componente:** `app/reportar.tsx`
- **Función:** `ReportsService.createReport()`

**Datos enviados:**
```json
{
  "phoneNumber": "3001234567",
  "date": "15/12/2024",
  "time": "14:30",
  "description": "Descripción del incidente...",
  "hasEvidence": true,
  "anonymous": false,
  "reporterName": "Juan Pérez",
  "reporterContact": "3009876543",
  "termsAccepted": true
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Su reporte ha sido enviado exitosamente...",
  "data": {
    "reportId": "uuid",
    "caseNumber": "EXT-2024-000001",
    "status": "PENDING"
  }
}
```

### 2. Consultar por Número de Caso
- **Endpoint:** `GET /api/v1/reports/case/:caseNumber`
- **Componente:** `components/ReportStatusModal.tsx`
- **Función:** `ReportsService.getReportByCaseNumber()`

### 3. Consultar por ID de Reporte
- **Endpoint:** `GET /api/v1/reports/status/:reportId`
- **Componente:** `components/ReportStatusModal.tsx`
- **Función:** `ReportsService.getReportStatus()`

---

## 🔧 Configuración

### Variables de Entorno

El archivo `constants/ApiConfig.js` maneja automáticamente las URLs según el entorno:

```javascript
// Desarrollo (cuando __DEV__ es true)
const API_URL = 'http://localhost:3000/api/v1';

// Producción
const API_URL = 'https://api.policia.gov.co/api/v1';
```

### Headers por Defecto

Todas las peticiones incluyen:
```javascript
{
  'Content-Type': 'application/json',
  'User-Agent': 'PoliciaApp/1.0 (React Native)'
}
```

---

## 🛡️ Manejo de Errores

### Errores de Validación (400)
```javascript
// Error del backend
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "errors": [
    {
      "field": "phoneNumber",
      "message": "Formato de teléfono inválido"
    }
  ]
}

// Mostrado al usuario
Alert.alert('Error de Validación', 'Por favor revise los datos...');
```

### Errores de Conexión
```javascript
// Error de red
if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
  Alert.alert(
    'Error de Conexión',
    'No se pudo conectar con el servidor. Verifique su conexión...'
  );
}
```

### Rate Limiting (429)
```javascript
// Demasiadas solicitudes
if (errorMessage.includes('Too Many Requests')) {
  Alert.alert(
    'Demasiadas Solicitudes',
    'Ha excedido el límite de reportes. Por favor espere...'
  );
}
```

---

## 📱 Flujo de Usuario

### 1. Crear Reporte

1. Usuario llena el formulario en `app/reportar.tsx`
2. Se ejecuta validación local con `ReportsService.validateReportData()`
3. Datos se formatean con `ReportsService.formatReportData()`
4. Se envía petición POST a `/api/v1/reports`
5. Se muestra resultado al usuario (éxito o error)
6. Si es exitoso, se muestra el número de caso

### 2. Consultar Reporte

1. Usuario toca "Consultar Reportes" en la pantalla principal
2. Se abre `ReportStatusModal`
3. Usuario selecciona buscar por caso o ID
4. Se ejecuta `getReportByCaseNumber()` o `getReportStatus()`
5. Se muestra información del reporte o error

---

## 🔍 Estados de Reportes

| Estado | Descripción | Color |
|--------|-------------|-------|
| `PENDING` | Pendiente de Revisión | Amarillo (warning) |
| `IN_REVIEW` | En Investigación | Azul (primary) |
| `RESOLVED` | Resuelto | Verde (success) |
| `CLOSED` | Cerrado | Gris (textSecondary) |

---

## 🧪 Testing

### Datos de Prueba

**Reporte No Anónimo:**
```json
{
  "phoneNumber": "3001234567",
  "date": "15/12/2024",
  "time": "14:30",
  "description": "Reporte de prueba para testing de la integración",
  "hasEvidence": true,
  "anonymous": false,
  "reporterName": "Usuario Prueba",
  "reporterContact": "3009876543",
  "termsAccepted": true
}
```

**Reporte Anónimo:**
```json
{
  "phoneNumber": "3201234567",
  "date": "16/12/2024",
  "time": "09:15",
  "description": "Reporte anónimo de prueba",
  "hasEvidence": false,
  "anonymous": true,
  "termsAccepted": true
}
```

### Casos de Prueba

1. ✅ Crear reporte exitoso (no anónimo)
2. ✅ Crear reporte exitoso (anónimo)
3. ✅ Error de validación (campos faltantes)
4. ✅ Error de formato (teléfono inválido)
5. ✅ Error de conexión (servidor apagado)
6. ✅ Rate limiting (muchas peticiones)
7. ✅ Consulta exitosa por número de caso
8. ✅ Consulta exitosa por ID
9. ✅ Consulta fallida (reporte no encontrado)

---

## 🚀 Despliegue

### Desarrollo Local

1. Asegúrate de que el backend esté corriendo en `http://localhost:3000`
2. La app automáticamente usará la URL de desarrollo
3. Los logs aparecerán en la consola de Metro

### Producción

1. Cambia la URL en `ApiConfig.js` a la URL de producción
2. Asegúrate de que CORS esté configurado correctamente
3. Verifica que los certificados SSL estén válidos

---

## 🔒 Consideraciones de Seguridad

### Datos Sensibles

- ✅ Datos del denunciante se envían solo si no es anónimo
- ✅ Términos y condiciones deben ser aceptados
- ✅ Validación local antes de enviar
- ✅ Headers de User-Agent para identificación

### Rate Limiting

- ✅ Máximo 3 reportes por minuto por IP
- ✅ Máximo 10 consultas por minuto por IP
- ✅ Mensajes informativos al usuario

### Validaciones

- ✅ Formato de teléfono colombiano
- ✅ Formato de fecha (DD/MM/AAAA)
- ✅ Formato de hora (HH:MM)
- ✅ Longitud mínima de descripción (10 caracteres)
- ✅ Campos condicionales según tipo de reporte

---

## 📞 Soporte

### Logs Importantes

```javascript
// Éxito al crear reporte
console.log('Reporte creado:', response.data.caseNumber);

// Error de validación
console.error('Error de validación:', validationErrors);

// Error de red
console.error('Error de conexión:', error.message);
```

### Debugging

1. Verifica que el backend esté corriendo
2. Revisa la URL en `ApiConfig.js`
3. Verifica la conexión de red del dispositivo
4. Revisa los logs de Metro para errores JavaScript
5. Verifica los logs del backend para errores del servidor

---

## 📋 Checklist de Integración

- [x] ✅ Servicio de API creado (`ReportsService`)
- [x] ✅ Configuración centralizada (`ApiConfig`)
- [x] ✅ Formulario de reportes integrado
- [x] ✅ Modal de consulta de reportes
- [x] ✅ Manejo de errores robusto
- [x] ✅ Validaciones locales
- [x] ✅ Estados de reportes visualizados
- [x] ✅ Botón de consulta en pantalla principal
- [x] ✅ Formateo de datos correcto
- [x] ✅ Headers apropiados
- [x] ✅ Timeouts configurados

---

**Desarrollado para la Policía Nacional de Colombia**  
**Localidad Kennedy, Bogotá**  
**Diciembre 2024** 