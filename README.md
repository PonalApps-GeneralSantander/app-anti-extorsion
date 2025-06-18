# SafeLife - Aplicación Móvil de Seguridad

## 📱 Descripción General

SafeLife es una aplicación móvil desarrollada en colaboración con la Policía Nacional de Colombia, diseñada específicamente para proteger al sector comercial de la localidad de Kennedy, Bogotá, contra actividades de extorsión. La aplicación combina tecnología avanzada con la experiencia de la Policía Nacional para crear una herramienta efectiva de prevención y denuncia.

## 🎯 Objetivo Principal

Proporcionar a los comerciantes de la localidad de Kennedy una herramienta tecnológica que les permita:
- Identificar y prevenir intentos de extorsión
- Reportar incidentes de manera segura y eficiente
- Acceder rápidamente a recursos de ayuda
- Mantener un registro de llamadas sospechosas
- Coordinar con la comunidad comercial local

## 👥 Guía para Usuarios No Técnicos

### Instalación y Configuración Inicial

1. **Descarga de la Aplicación**
   - Busque "SafeLife" en la Google Play Store
   - Descargue e instale la aplicación
   - Abra la aplicación y acepte los términos y condiciones

2. **Primer Uso**
   - Complete el registro inicial con sus datos básicos
   - Configure sus contactos de emergencia
   - Active las notificaciones para recibir alertas

### Funcionalidades Principales

#### 🚨 Botón de Emergencia
- Ubicado en la pantalla principal
- Conecta directamente con la línea 123
- Acceso rápido en situaciones de emergencia

#### 📞 Sistema de Alertas
- Notifica sobre números telefónicos sospechosos
- Muestra el nivel de riesgo de cada llamada
- Permite bloquear automáticamente números reportados

#### 📝 Reporte de Incidentes
- Formulario simple para reportar intentos de extorsión
- Opción de denuncia anónima
- Capacidad para adjuntar evidencias (grabaciones, mensajes)

#### 🎙️ Grabación de Llamadas
- Interfaz intuitiva para grabar llamadas
- Almacenamiento seguro de las grabaciones
- Compartir evidencias con las autoridades

#### 📚 Recursos y Prevención
- Guías de prevención de extorsión
- Información sobre modalidades de extorsión
- Enlaces a recursos oficiales

### Consejos de Seguridad

1. **Prevención**
   - Verifique siempre la identidad de quien llama
   - No comparta información personal por teléfono
   - Mantenga un registro de llamadas sospechosas

2. **Durante una Llamada Sospechosa**
   - Mantenga la calma
   - No proporcione información sensible
   - Grabe la llamada si es posible
   - Reporte el incidente inmediatamente

3. **Después de un Incidente**
   - Guarde todas las evidencias
   - Reporte el caso a través de la aplicación
   - Contacte a las autoridades

## 👨‍💻 Documentación Técnica

### Arquitectura del Proyecto

```
app/
├── _layout.tsx          # Configuración de navegación
├── index.tsx           # Pantalla principal
├── alertas.tsx         # Sistema de alertas
├── grabacion.tsx       # Grabación de llamadas
├── reportar.tsx        # Formulario de reportes
└── recursos.tsx        # Recursos y prevención

components/
├── AppButton.tsx       # Componente de botón reutilizable
├── EmergencyContactCard.tsx
├── PoliceHeader.tsx
└── SuspiciousCallCard.tsx

constants/
└── Colors.ts          # Paleta de colores y estilos
```

### Tecnologías Utilizadas

- **Framework Principal**: React Native con Expo
- **Lenguaje**: TypeScript
- **Navegación**: Expo Router
- **UI Components**: React Native Core
- **Iconos**: FontAwesome5
- **Gestión de Estado**: React Hooks

### Configuración del Entorno de Desarrollo

1. **Requisitos Previos**
   ```bash
   Node.js >= 14
   npm >= 6
   Expo CLI
   ```

2. **Instalación**
   ```bash
   # Clonar el repositorio
   git clone [URL_DEL_REPOSITORIO]

   # Instalar dependencias
   npm install

   # Iniciar el servidor de desarrollo
   npx expo start
   ```

3. **Estructura de Datos**

   ```typescript
   interface SuspiciousCall {
     id: string;
     phoneNumber: string;
     date: string;
     time: string;
     riskLevel: 'high' | 'medium' | 'low';
     description: string;
   }

   interface RecordedCall {
     id: string;
     phoneNumber: string;
     date: string;
     time: string;
     duration: string;
     fileSize: string;
   }
   ```

### Guías de Desarrollo

#### Estándares de Código

1. **Nomenclatura**
   - Componentes: PascalCase
   - Funciones: camelCase
   - Constantes: UPPER_SNAKE_CASE
   - Tipos/Interfaces: PascalCase

2. **Estructura de Componentes**
   ```typescript
   // Imports
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';

   // Tipos
   interface Props {
     // Definir props
   }

   // Componente
   export default function ComponentName(props: Props) {
     // Lógica del componente
   }

   // Estilos
   const styles = StyleSheet.create({
     // Definir estilos
   });
   ```

3. **Gestión de Estado**
   - Usar hooks de React para estado local
   - Implementar Context API para estado global
   - Mantener la lógica de negocio separada de la UI

### Proceso de Build

1. **Configuración de EAS**
   ```json
   {
     "build": {
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```

2. **Generación de APK**
   ```bash
   eas build --platform android --profile preview
   ```

### Pruebas

1. **Pruebas Unitarias**
   ```bash
   npm test
   ```

2. **Pruebas de Integración**
   - Usar Jest y React Native Testing Library
   - Implementar pruebas de navegación
   - Verificar interacciones de usuario

## 🔒 Seguridad

### Manejo de Datos Sensibles

1. **Almacenamiento**
   - Usar SecureStore para datos sensibles
   - Implementar encriptación para grabaciones
   - Limpiar caché regularmente

2. **Comunicación**
   - HTTPS para todas las API calls
   - Validación de certificados SSL
   - Timeout en conexiones

### Permisos

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-splash-screen"
    ]
  }
}
```

## 📦 Despliegue

### Proceso de Publicación

1. **Preparación**
   - Actualizar versiones
   - Generar changelog
   - Revisar assets

2. **Build**
   ```bash
   eas build --platform android
   ```

3. **Publicación**
   - Subir APK a Google Play Store
   - Actualizar documentación
   - Notificar a usuarios

## 🤝 Contribución

### Guías para Contribuir

1. Fork el repositorio
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Estándares de Código

- Seguir ESLint y Prettier
- Documentar funciones y componentes
- Incluir pruebas unitarias
- Mantener la cobertura de código

## 📞 Soporte

### Canales de Ayuda

- Email: soporte@antiextorsion.com
- Teléfono: [Número de soporte]
- Documentación en línea: [URL]

### FAQ

1. **¿Cómo actualizo la aplicación?**
   - La actualización es automática desde la Play Store

2. **¿Qué hacer si la app no funciona?**
   - Verificar conexión a internet
   - Reiniciar la aplicación
   - Contactar soporte técnico

## 📄 Licencia

Este proyecto está bajo la Licencia [Especificar tipo de licencia] - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 🙏 Agradecimientos

- Policía Nacional de Colombia
- Comunidad de comerciantes de Kennedy
- Equipo de desarrollo
- Contribuidores del proyecto
