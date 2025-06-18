# Documentación Técnica - SafeLife

## Índice

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Componentes Principales](#componentes-principales)
6. [Gestión de Estado](#gestión-de-estado)
7. [Navegación](#navegación)
8. [Seguridad](#seguridad)
9. [Testing](#testing)
10. [Despliegue](#despliegue)

## Arquitectura del Sistema

### Visión General

La aplicación SafeLife está construida siguiendo una arquitectura modular basada en componentes React Native. El sistema se divide en las siguientes capas:

1. **Capa de Presentación**
   - Componentes UI reutilizables
   - Pantallas principales
   - Navegación

2. **Capa de Lógica de Negocio**
   - Hooks personalizados
   - Servicios
   - Utilidades

3. **Capa de Datos**
   - Almacenamiento local
   - API calls
   - Gestión de estado

### Diagrama de Arquitectura

```
┌─────────────────┐
│   UI Layer      │
│  (Components)   │
└────────┬────────┘
         │
┌────────▼────────┐
│  Business Logic │
│    (Hooks)      │
└────────┬────────┘
         │
┌────────▼────────┐
│   Data Layer    │
│  (Services)     │
└─────────────────┘
```

## Stack Tecnológico

### Core Technologies

- **Framework**: React Native 0.76.7
- **Runtime**: Expo SDK 52
- **Lenguaje**: TypeScript 5.3.3
- **Navegación**: Expo Router 4.0.19

### Dependencias Principales

```json
{
  "dependencies": {
    "@expo/vector-icons": "^14.0.2",
    "expo": "~52.0.41",
    "expo-router": "~4.0.19",
    "react": "18.3.1",
    "react-native": "0.76.7"
  }
}
```

### Herramientas de Desarrollo

- ESLint para linting
- Prettier para formateo
- Jest para testing
- React Native Testing Library

## Configuración del Entorno

### Requisitos del Sistema

- Node.js >= 14
- npm >= 6
- Expo CLI
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS)

### Instalación

1. **Clonar el Repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd SafeLife
   ```

2. **Instalar Dependencias**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**
   ```bash
   cp .env.example .env
   # Editar .env con las variables necesarias
   ```

4. **Iniciar el Servidor de Desarrollo**
   ```bash
   npx expo start
   ```

## Estructura del Proyecto

### Organización de Directorios

```
SafeLife/
├── app/                    # Pantallas principales
│   ├── _layout.tsx        # Configuración de navegación
│   ├── index.tsx          # Pantalla principal
│   ├── alertas.tsx        # Sistema de alertas
│   ├── grabacion.tsx      # Grabación de llamadas
│   ├── reportar.tsx       # Formulario de reportes
│   └── recursos.tsx       # Recursos y prevención
├── components/            # Componentes reutilizables
├── constants/            # Constantes y configuraciones
├── hooks/               # Hooks personalizados
├── services/           # Servicios y APIs
├── types/              # Definiciones de tipos
└── utils/              # Utilidades
```

### Convenciones de Nombrado

- **Archivos**: kebab-case
- **Componentes**: PascalCase
- **Hooks**: useCamelCase
- **Utilidades**: camelCase
- **Tipos**: PascalCase

## Componentes Principales

### AppButton

Componente de botón reutilizable con múltiples variantes.

```typescript
interface AppButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

### EmergencyContactCard

Tarjeta para mostrar contactos de emergencia.

```typescript
interface EmergencyContactCardProps {
  title: string;
  phoneNumber: string;
  description?: string;
  icon?: string;
  isPrimary?: boolean;
}
```

### SuspiciousCallCard

Tarjeta para mostrar llamadas sospechosas.

```typescript
interface SuspiciousCallCardProps {
  phoneNumber: string;
  date: string;
  time: string;
  riskLevel: 'high' | 'medium' | 'low';
  description?: string;
  onPress?: () => void;
}
```

## Gestión de Estado

### Estado Local

- Usar `useState` para estado simple
- Usar `useReducer` para estado complejo
- Implementar `useCallback` para funciones

### Estado Global

- Context API para estado compartido
- Redux para estado complejo (si es necesario)

### Persistencia

- AsyncStorage para datos locales
- SecureStore para datos sensibles

## Navegación

### Configuración de Rutas

```typescript
// app/_layout.tsx
import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="alertas" />
      <Tabs.Screen name="reportar" />
      <Tabs.Screen name="grabacion" />
      <Tabs.Screen name="recursos" />
    </Tabs>
  );
}
```

### Navegación Programática

```typescript
import { router } from 'expo-router';

// Navegación simple
router.push('/alertas');

// Navegación con parámetros
router.push({
  pathname: '/reportar',
  params: { id: '123' }
});
```

## Seguridad

### Almacenamiento Seguro

```typescript
import * as SecureStore from 'expo-secure-store';

// Guardar datos sensibles
await SecureStore.setItemAsync('key', 'value');

// Recuperar datos
const value = await SecureStore.getItemAsync('key');
```

### Encriptación

- Usar AES-256 para datos sensibles
- Implementar hash para contraseñas
- Validar certificados SSL

### Permisos

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-splash-screen",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
        }
      ]
    ]
  }
}
```

## Testing

### Pruebas Unitarias

```typescript
// __tests__/components/AppButton.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import AppButton from '../../components/AppButton';

describe('AppButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <AppButton title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });
});
```

### Pruebas de Integración

```typescript
// __tests__/screens/AlertasScreen.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import AlertasScreen from '../../app/alertas';

describe('AlertasScreen', () => {
  it('shows suspicious calls list', () => {
    const { getByText } = render(<AlertasScreen />);
    expect(getByText('Llamadas Sospechosas')).toBeTruthy();
  });
});
```

## Despliegue

### Configuración de EAS

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Proceso de Build

1. **Build de Desarrollo**
   ```bash
   eas build --profile development --platform android
   ```

2. **Build de Producción**
   ```bash
   eas build --profile production --platform android
   ```

3. **Subir a Play Store**
   ```bash
   eas submit -p android
   ```

### Monitoreo

- Implementar analytics
- Monitorear crash reports
- Seguimiento de métricas de rendimiento

## Recursos Adicionales

- [Documentación de Expo](https://docs.expo.dev)
- [Documentación de React Native](https://reactnative.dev/docs/getting-started)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Guía de Contribución](CONTRIBUTING.md) 