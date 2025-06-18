// services/reportsService.js
import axios from 'axios';
import { API_CONFIG, buildApiUrl, getApiHeaders } from '../constants/ApiConfig';

// Configurar interceptor para logs de request/response si está en desarrollo
if (__DEV__) {
  // Interceptor para requests
  axios.interceptors.request.use(
    (config) => {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
        data: config.data,
      });
      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para responses
  axios.interceptors.response.use(
    (response) => {
      console.log('📥 API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error('❌ Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );
}

export class ReportsService {
  static async createReport(reportData) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.REPORTS);
      const headers = getApiHeaders();
      
      // Limpiar datos antes de enviar
      const cleanedData = this._cleanReportData(reportData);
      
      console.log('🚀 Creating report with data:', cleanedData);
      
      const response = await axios.post(url, cleanedData, { headers });
      
      console.log('✅ Report created successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('💥 Error creating report:', error);
      
      // Log detallado del error
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('📊 Error Response Details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        console.error('🔌 Network Error - No response received:', {
          request: error.request,
          message: error.message,
          code: error.code,
        });
      } else {
        // Error en la configuración de la petición
        console.error('⚙️ Request Configuration Error:', {
          message: error.message,
          config: error.config,
        });
      }
      
      // Crear error más descriptivo para el usuario
      const userError = this._createUserFriendlyError(error);
      throw userError;
    }
  }

  static async getReportStatus(reportId) {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.REPORT_STATUS}/${reportId}`);
      const headers = getApiHeaders();
      
      console.log('🔍 Fetching report status for ID:', reportId);
      
      const response = await axios.get(url, { headers });
      
      console.log('✅ Report status fetched successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('💥 Error fetching report status:', error);
      
      // Log detallado del error
      if (error.response) {
        console.error('📊 Error Response Details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error('🔌 Network Error - No response received:', {
          message: error.message,
          code: error.code,
        });
      } else {
        console.error('⚙️ Request Configuration Error:', {
          message: error.message,
        });
      }
      
      const userError = this._createUserFriendlyError(error);
      throw userError;
    }
  }

  static async getReportByCaseNumber(caseNumber) {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.REPORT_BY_CASE}/${caseNumber}`);
      const headers = getApiHeaders();
      
      console.log('🔍 Fetching report by case number:', caseNumber);
      
      const response = await axios.get(url, { headers });
      
      console.log('✅ Report fetched by case number successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('💥 Error fetching report by case number:', error);
      
      // Log detallado del error
      if (error.response) {
        console.error('📊 Error Response Details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error('🔌 Network Error - No response received:', {
          message: error.message,
          code: error.code,
        });
      } else {
        console.error('⚙️ Request Configuration Error:', {
          message: error.message,
        });
      }
      
      const userError = this._createUserFriendlyError(error);
      throw userError;
    }
  }

  static _createUserFriendlyError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Si hay errores de validación específicos, mostrarlos
          if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            const errorMessages = data.errors.map(err => {
              if (typeof err === 'object' && err.message) {
                return err.message;
              } else if (typeof err === 'string') {
                return err;
              }
              return 'Error de validación';
            }).join('\n');
            return new Error(`Error de validación:\n${errorMessages}`);
          }
          return new Error(data?.message || 'Los datos enviados no son válidos');
        case 401:
          return new Error('No autorizado para realizar esta acción');
        case 403:
          return new Error('No tiene permisos para realizar esta acción');
        case 404:
          return new Error(data?.message || 'Reporte no encontrado');
        case 429:
          return new Error('Demasiadas peticiones. Intente de nuevo en unos minutos');
        case 500:
          return new Error('Error interno del servidor. Intente de nuevo más tarde');
        case 502:
        case 503:
        case 504:
          return new Error('Servicio temporalmente no disponible. Intente de nuevo más tarde');
        default:
          return new Error(data?.message || `Error del servidor (${status})`);
      }
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifique su conexión a internet');
    } else {
      // Error de configuración
      return new Error('Error interno de la aplicación');
    }
  }

  static formatReportData(formData) {
    // Formatear número de teléfono para Colombia
    let phoneNumber = formData.phoneNumber.replace(/\D/g, ''); // Remover caracteres no numéricos
    if (phoneNumber.length === 10 && phoneNumber.startsWith('3')) {
      // Número móvil colombiano de 10 dígitos
      phoneNumber = phoneNumber;
    } else if (phoneNumber.length === 12 && phoneNumber.startsWith('57')) {
      // Número con código de país 57
      phoneNumber = phoneNumber.substring(2);
    } else if (phoneNumber.length === 13 && phoneNumber.startsWith('575')) {
      // Número con +57
      phoneNumber = phoneNumber.substring(2);
    }

    // Formatear tiempo para HH:MM
    let time = formData.time;
    if (time) {
      // Limpiar el tiempo de caracteres no numéricos excepto ':'
      time = time.replace(/[^\d:]/g, '');
      
      if (time.includes(':')) {
        const timeParts = time.split(':');
        if (timeParts.length >= 2) {
          let hours = parseInt(timeParts[0]) || 0;
          let minutes = parseInt(timeParts[1]) || 0;
          
          // Validar y corregir horas y minutos
          hours = Math.max(0, Math.min(23, hours));
          minutes = Math.max(0, Math.min(59, minutes));
          
          time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      } else if (time.length >= 3 && time.length <= 4) {
        // Si es formato HHMM o HMM, convertir a HH:MM
        if (time.length === 3) {
          time = `0${time[0]}:${time.slice(1)}`;
        } else if (time.length === 4) {
          time = `${time.slice(0, 2)}:${time.slice(2)}`;
        }
      }
    }

    const formatted = {
      phoneNumber: phoneNumber,
      date: formData.date,
      time: time,
      description: formData.description?.trim(),
      hasEvidence: Boolean(formData.hasEvidence),
      anonymous: Boolean(formData.anonymous),
      termsAccepted: Boolean(formData.termsAccepted),
    };

    // Solo incluir campos de reporter si no es anónimo
    if (!formData.anonymous) {
      formatted.reporterName = formData.reporterName?.trim();
      formatted.reporterContact = formData.reporterContact?.trim();
    }
    
    console.log('📝 Formatted report data:', formatted);
    return formatted;
  }

  static validateReportData(formData) {
    console.log('🔍 Validating report data:', formData);
    
    const errors = [];

    // Validación de número telefónico colombiano
    if (!formData.phoneNumber) {
      errors.push({ field: 'phoneNumber', message: 'El número telefónico es obligatorio' });
    } else {
      const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
      // Validar formato colombiano: 10 dígitos empezando con 3, o con código de país
      if (!/^(\+?57)?[1-9]\d{9}$/.test(formData.phoneNumber.replace(/\s/g, '')) && 
          !(cleanPhone.length === 10 && cleanPhone.startsWith('3'))) {
        errors.push({ field: 'phoneNumber', message: 'Formato de teléfono colombiano inválido. Debe tener 10 dígitos o incluir +57' });
      }
    }

    // Validación de fecha DD/MM/AAAA
    if (!formData.date) {
      errors.push({ field: 'date', message: 'La fecha es obligatoria' });
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.date)) {
      errors.push({ field: 'date', message: 'La fecha debe tener el formato DD/MM/AAAA' });
    }

    // Validación de hora HH:MM (24 horas)
    if (!formData.time) {
      errors.push({ field: 'time', message: 'La hora es obligatoria' });
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)) {
      errors.push({ field: 'time', message: 'La hora debe tener el formato HH:MM (24 horas)' });
    }

    // Validación de descripción
    if (!formData.description || formData.description.trim().length < 10) {
      errors.push({ field: 'description', message: 'La descripción debe tener al menos 10 caracteres' });
    } else if (formData.description.trim().length > 1000) {
      errors.push({ field: 'description', message: 'La descripción no puede exceder 1000 caracteres' });
    }

    // Validación de términos y condiciones
    if (!formData.termsAccepted || formData.termsAccepted !== true) {
      errors.push({ field: 'termsAccepted', message: 'Debe aceptar los términos y condiciones' });
    }

    // Validaciones condicionales para reportes no anónimos
    if (!formData.anonymous) {
      if (!formData.reporterName || formData.reporterName.trim().length < 2) {
        errors.push({ field: 'reporterName', message: 'El nombre debe tener al menos 2 caracteres si no es anónimo' });
      } else if (formData.reporterName.trim().length > 100) {
        errors.push({ field: 'reporterName', message: 'El nombre no puede exceder 100 caracteres' });
      }
      
      if (!formData.reporterContact || formData.reporterContact.trim().length < 7) {
        errors.push({ field: 'reporterContact', message: 'El contacto debe tener al menos 7 caracteres si no es anónimo' });
      } else if (formData.reporterContact.trim().length > 50) {
        errors.push({ field: 'reporterContact', message: 'El contacto no puede exceder 50 caracteres' });
      }
    }

    if (errors.length > 0) {
      console.warn('⚠️ Validation errors found:', errors);
    } else {
      console.log('✅ Validation passed');
    }

    return errors;
  }

  static _cleanReportData(data) {
    const cleaned = { ...data };
    
    // Remover campos undefined/null y limpiar strings
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined || cleaned[key] === null) {
        delete cleaned[key];
      } else if (typeof cleaned[key] === 'string') {
        cleaned[key] = cleaned[key].trim();
        // Si el string está vacío después del trim, eliminarlo
        if (cleaned[key] === '') {
          delete cleaned[key];
        }
      }
    });
    
    console.log('🧹 Cleaned report data:', cleaned);
    return cleaned;
  }
} 