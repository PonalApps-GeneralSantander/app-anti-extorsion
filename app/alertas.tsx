import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";

import { Colors } from "../constants/Colors";
import SuspiciousCallCard from "../components/SuspiciousCallCard";
import AppButton from "../components/AppButton";
import PoliceHeader from "../components/PoliceHeader";
import { API_CONFIG, buildApiUrl, getApiHeaders } from "../constants/ApiConfig";

type RiskLevel = "high" | "medium" | "low";

interface SuspiciousCall {
  id: string;
  phoneNumber: string;
  date: string;
  time: string;
  riskLevel: RiskLevel;
  description: string;
  reportCount?: number;
  lastReported?: string;
  caseNumber?: string;
  status?: string;
}

export default function AlertasScreen() {
  const [blockingEnabled, setBlockingEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [suspiciousCalls, setSuspiciousCalls] = useState<SuspiciousCall[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.REPORTS}?page=1&limit=20`);
      const headers = getApiHeaders();
      
      console.log('🔍 Fetching reports from:', url);
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      console.log('📊 API Response:', data);
      
      if (data.success && data.data.reports) {
        const transformedReports = data.data.reports.map((report: any) => transformReportToSuspiciousCall(report));
        setSuspiciousCalls(transformedReports);
        console.log('✅ Transformed reports:', transformedReports.length);
      } else {
        console.warn('⚠️ No reports found or API error:', data.message);
        setSuspiciousCalls([]);
      }
    } catch (error) {
      console.error('💥 Error fetching reports:', error);
      Alert.alert(
        'Error de Conexión',
        'No se pudieron cargar los reportes. Verifique su conexión a internet.',
        [
          { text: 'Reintentar', onPress: () => fetchReports() },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const transformReportToSuspiciousCall = (report: any): SuspiciousCall => {
    // Determinar nivel de riesgo basado en palabras clave en la descripción
    const description = report.description?.toLowerCase() || '';
    let riskLevel: RiskLevel = 'low';
    
    const highRiskKeywords = ['amenaza', 'extorsión', 'secuestro', 'matar', 'daño', 'violencia', 'bomba'];
    const mediumRiskKeywords = ['dinero', 'pago', 'urgente', 'familiar', 'emergencia', 'banco', 'policía'];
    
    if (highRiskKeywords.some(keyword => description.includes(keyword))) {
      riskLevel = 'high';
    } else if (mediumRiskKeywords.some(keyword => description.includes(keyword))) {
      riskLevel = 'medium';
    }

    // Formatear fecha desde ISO a formato DD/MM/AAAA
    const formatDate = (isoDate: string) => {
      try {
        const date = new Date(isoDate);
        return date.toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return isoDate;
      }
    };

    // Formatear hora desde ISO
    const formatTime = (isoDate: string) => {
      try {
        const date = new Date(isoDate);
        return date.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch {
        return report.time || '00:00';
      }
    };

    // Calcular tiempo transcurrido
    const getTimeAgo = (isoDate: string) => {
      try {
        const date = new Date(isoDate);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
          return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
          return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else {
          return 'Hace menos de 1 hora';
        }
      } catch {
        return 'Recientemente';
      }
    };

    return {
      id: report.id,
      phoneNumber: report.phoneNumber,
      date: formatDate(report.createdAt || report.incidentDate),
      time: formatTime(report.createdAt || report.incidentDate),
      riskLevel,
      description: report.description,
      reportCount: 1, // Por ahora cada reporte cuenta como 1, se podría agrupar por número
      lastReported: getTimeAgo(report.createdAt),
      caseNumber: report.caseNumber,
      status: report.status
    };
  };

  const handleCallDetail = (item: SuspiciousCall) => {
    const statusText = item.status === 'PENDING' ? 'Pendiente' : 
                     item.status === 'IN_REVIEW' ? 'En Revisión' : 
                     item.status === 'RESOLVED' ? 'Resuelto' : 
                     item.status === 'CLOSED' ? 'Cerrado' : item.status;

    Alert.alert(
      `🚨 Reporte: ${item.phoneNumber}`,
      `📋 Caso: ${item.caseNumber}\n📅 Fecha: ${item.date} a las ${item.time}\n🔴 Nivel de riesgo: ${
        item.riskLevel === "high"
          ? "🔴 ALTO"
          : item.riskLevel === "medium"
          ? "🟡 MEDIO"
          : "🟢 BAJO"
      }\n📊 Estado: ${statusText}\n⏰ ${item.lastReported}\n\n📝 Descripción:\n${item.description}\n\n⚠️ Si recibe una llamada de este número, NO proporcione información personal y reporte inmediatamente.`,
      [
        { text: "Reportar Ahora", onPress: () => handleReportCall(item) },
        { text: "Cerrar", style: "cancel" }
      ]
    );
  };

  const handleReportCall = (item: SuspiciousCall) => {
    Alert.alert(
      "Reporte Adicional",
      `¿Desea reportar información adicional sobre el número ${item.phoneNumber}?\n\nEsto ayudará a fortalecer el caso ${item.caseNumber}.`,
      [
        { text: "Sí, Reportar", onPress: () => {
          // Aquí se podría navegar al formulario de reporte con el número pre-llenado
          Alert.alert("Funcionalidad Pendiente", "Se redirigirá al formulario de reporte con este número pre-cargado.");
        }},
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const getRiskLevelStats = () => {
    const high = suspiciousCalls.filter(call => call.riskLevel === 'high').length;
    const medium = suspiciousCalls.filter(call => call.riskLevel === 'medium').length;
    const low = suspiciousCalls.filter(call => call.riskLevel === 'low').length;
    return { high, medium, low };
  };

  const stats = getRiskLevelStats();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <PoliceHeader
        title="Sistema de Alertas"
        subtitle="Reportes de llamadas sospechosas"
      />

      <View style={styles.contentContainer}>
        {/* Stats Header */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{suspiciousCalls.length}</Text>
            <Text style={styles.statLabel}>Total Reportes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.danger }]}>{stats.high}</Text>
            <Text style={styles.statLabel}>Alto Riesgo</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.warning }]}>{stats.medium}</Text>
            <Text style={styles.statLabel}>Medio Riesgo</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>{stats.low}</Text>
            <Text style={styles.statLabel}>Bajo Riesgo</Text>
          </View>
        </View>

        {/* Quick Settings Toggle */}
        <TouchableOpacity 
          style={styles.settingsToggle}
          onPress={() => setShowSettings(!showSettings)}
        >
          <FontAwesome5 name="cog" size={16} color={Colors.primary} />
          <Text style={styles.settingsToggleText}>
            {showSettings ? 'Ocultar Configuración' : 'Mostrar Configuración'}
          </Text>
          <FontAwesome5 
            name={showSettings ? "chevron-up" : "chevron-down"} 
            size={12} 
            color={Colors.primary} 
          />
        </TouchableOpacity>

        {/* Collapsible Settings */}
        {showSettings && (
          <View style={styles.settingsContainer}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Bloqueo Automático</Text>
                <Text style={styles.settingDescription}>
                  Bloquear números reportados como extorsión
                </Text>
              </View>
              <Switch
                value={blockingEnabled}
                onValueChange={setBlockingEnabled}
                trackColor={{ false: "#D0D0D0", true: Colors.primary }}
                thumbColor={blockingEnabled ? Colors.secondary : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Notificaciones</Text>
                <Text style={styles.settingDescription}>
                  Recibir alertas de nuevos números reportados
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D0D0D0", true: Colors.primary }}
                thumbColor={notificationsEnabled ? Colors.secondary : "#f4f3f4"}
              />
            </View>
          </View>
        )}

        {/* Alert Status */}
        <View style={styles.alertBox}>
          <View style={styles.alertIconContainer}>
            <FontAwesome5
              name="shield-alt"
              size={24}
              color={Colors.primary}
            />
          </View>
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>
              🛡️ Protección Activa
            </Text>
            <Text style={styles.alertDescription}>
              Mostrando reportes reales de números sospechosos.
              {blockingEnabled ? " Los números de alto riesgo serán bloqueados." : ""}
            </Text>
          </View>
        </View>

        {/* Main Content: Suspicious Calls List */}
        <View style={styles.callsContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              🚨 Números Reportados ({suspiciousCalls.length})
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
              disabled={refreshing || loading}
            >
              <FontAwesome5 
                name="sync-alt" 
                size={14} 
                color={Colors.primary}
                style={{ opacity: (refreshing || loading) ? 0.5 : 1 }}
              />
              <Text style={[styles.refreshText, { opacity: (refreshing || loading) ? 0.5 : 1 }]}>
                {refreshing || loading ? 'Cargando...' : 'Actualizar'}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={suspiciousCalls}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SuspiciousCallCard
                phoneNumber={item.phoneNumber}
                date={item.date}
                time={item.time}
                riskLevel={item.riskLevel}
                description={item.description}
                reportCount={item.reportCount}
                lastReported={item.lastReported}
                onPress={() => handleCallDetail(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.callsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FontAwesome5 
                  name={loading ? "spinner" : "shield-alt"} 
                  size={48} 
                  color={Colors.textSecondary} 
                />
                <Text style={styles.emptyText}>
                  {loading ? 'Cargando reportes...' : 'No hay números reportados'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {loading 
                    ? 'Obteniendo datos del servidor...' 
                    : 'El sistema está monitoreando activamente nuevas amenazas'
                  }
                </Text>
                {!loading && (
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchReports}
                  >
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  settingsToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: Colors.light,
    borderRadius: 8,
    marginBottom: 16,
  },
  settingsToggleText: {
    color: Colors.primary,
    fontSize: 14,
    marginHorizontal: 8,
  },
  settingsContainer: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  alertBox: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: 16,
  },
  alertIconContainer: {
    marginRight: 12,
    justifyContent: "center",
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  callsContainer: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshText: {
    color: Colors.primary,
    fontSize: 14,
    marginLeft: 4,
  },
  callsList: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  retryButton: {
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: Colors.backgroundLight,
    fontSize: 16,
    fontWeight: "bold",
  },
});
