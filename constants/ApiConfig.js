// constants/ApiConfig.js

// Configuración de la API
export const API_CONFIG = {
  // URL base del servidor (cambiar según el entorno)
  BASE_URL: __DEV__ 
    ? 'https://backendextorapp-production.up.railway.app/api/v1'  // Desarrollo
    : 'https://backendextorapp-production.up.railway.app/api/v1',  // Producción
  
  // Endpoints específicos
  ENDPOINTS: {
    REPORTS: '/reports',
    REPORT_STATUS: '/reports/status',
    REPORT_BY_CASE: '/reports/case',
  },
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'User-Agent': 'PoliciaApp/1.0 (React Native)',
  },
  
  // Configuración de timeouts
  TIMEOUT: {
    REQUEST: 10000, // 10 segundos
    UPLOAD: 30000,  // 30 segundos para uploads
  },
  
  // Rate limiting info (para mostrar al usuario)
  RATE_LIMITS: {
    REPORTS: {
      MAX_REQUESTS: 3,
      WINDOW_MINUTES: 1,
      MESSAGE: 'Máximo 3 reportes por minuto'
    },
    QUERIES: {
      MAX_REQUESTS: 10,
      WINDOW_MINUTES: 1,
      MESSAGE: 'Máximo 10 consultas por minuto'
    }
  }
};

// Función para construir URLs completas
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Agregar parámetros de query si existen
  const queryParams = new URLSearchParams(params).toString();
  if (queryParams) {
    url += `?${queryParams}`;
  }
  
  return url;
};

// Función para obtener headers con autenticación si es necesario
export const getApiHeaders = (additionalHeaders = {}) => {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...additionalHeaders,
  };
};

// Configuración específica para diferentes entornos
export const ENV_CONFIG = {
  development: {
    API_URL: 'https://backendextorapp-production.up.railway.app/api/v1',
    DEBUG: true,
    LOG_REQUESTS: true,
  },
  staging: {
    API_URL: 'https://backendextorapp-production.up.railway.app/api/v1',
    DEBUG: true,
    LOG_REQUESTS: false,
  },
  production: {
    API_URL: 'https://backendextorapp-production.up.railway.app/api/v1',
    DEBUG: false,
    LOG_REQUESTS: false,
  }
};

// Obtener configuración actual basada en el entorno
export const getCurrentConfig = () => {
  if (__DEV__) {
    return ENV_CONFIG.development;
  }
  
  // En producción, podrías usar una variable de entorno
  // para determinar si es staging o production
  return ENV_CONFIG.production;
}; 