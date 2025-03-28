import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";

import { Colors } from "../constants/Colors";
import SuspiciousCallCard from "../components/SuspiciousCallCard";
import AppButton from "../components/AppButton";
import PoliceHeader from "../components/PoliceHeader";

type RiskLevel = "high" | "medium" | "low";

interface SuspiciousCall {
  id: string;
  phoneNumber: string;
  date: string;
  time: string;
  riskLevel: RiskLevel;
  description: string;
}

// Mock data for suspicious calls
const SUSPICIOUS_CALLS: SuspiciousCall[] = [
  {
    id: "1",
    phoneNumber: "+57 321 456 7890",
    date: "25/03/2023",
    time: "10:30 AM",
    riskLevel: "high",
    description:
      "Llamada que se identifica como banco solicitando datos personales y claves bancarias.",
  },
  {
    id: "2",
    phoneNumber: "+57 300 123 4567",
    date: "23/03/2023",
    time: "3:45 PM",
    riskLevel: "medium",
    description:
      "Supuesto familiar en problemas solicitando dinero para emergencia.",
  },
  {
    id: "3",
    phoneNumber: "+57 310 789 1234",
    date: "22/03/2023",
    time: "5:20 PM",
    riskLevel: "high",
    description:
      "Llamada amenazante haciendo referencia a negocios de la zona.",
  },
  {
    id: "4",
    phoneNumber: "+57 350 987 6543",
    date: "20/03/2023",
    time: "11:05 AM",
    riskLevel: "low",
    description:
      "Supuesta empresa de servicios públicos solicitando pago inmediato.",
  },
  {
    id: "5",
    phoneNumber: "+57 314 159 2653",
    date: "18/03/2023",
    time: "4:10 PM",
    riskLevel: "medium",
    description: "Llamada indicando premio de sorteo no participado.",
  },
];

export default function AlertasScreen() {
  const [blockingEnabled, setBlockingEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleCallDetail = (item: SuspiciousCall) => {
    Alert.alert(
      `Llamada Sospechosa: ${item.phoneNumber}`,
      `Fecha: ${item.date}\nHora: ${item.time}\nNivel de riesgo: ${
        item.riskLevel === "high"
          ? "Alto"
          : item.riskLevel === "medium"
          ? "Medio"
          : "Bajo"
      }\n\nDescripción: ${item.description}`,
      [{ text: "Cerrar" }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <PoliceHeader
        title="Sistema de Alertas"
        subtitle="Detección de llamadas sospechosas"
      />

      <View style={styles.contentContainer}>
        {/* Settings Section */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Configuración de Alertas</Text>

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

        {/* Alert Call Identification */}
        <View style={styles.alertIdentificationContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Llamadas Sospechosas</Text>
            <TouchableOpacity style={styles.refreshButton}>
              <FontAwesome5 name="sync-alt" size={16} color={Colors.primary} />
              <Text style={styles.refreshText}>Actualizar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.alertBox}>
            <View style={styles.alertIconContainer}>
              <FontAwesome5
                name="shield-alt"
                size={28}
                color={Colors.primary}
              />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>
                Sistema de identificación de llamadas activo
              </Text>
              <Text style={styles.alertDescription}>
                Identificamos automáticamente llamadas de riesgo en su
                dispositivo.
                {blockingEnabled
                  ? " Las llamadas de alto riesgo serán bloqueadas."
                  : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Suspicious Calls List */}
        <View style={styles.callsContainer}>
          <Text style={styles.sectionTitle}>
            Historial de Llamadas Sospechosas
          </Text>

          <FlatList
            data={SUSPICIOUS_CALLS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SuspiciousCallCard
                phoneNumber={item.phoneNumber}
                date={item.date}
                time={item.time}
                riskLevel={item.riskLevel}
                description={item.description}
                onPress={() => handleCallDetail(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.callsList}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
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
  alertIdentificationContainer: {
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  alertBox: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
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
  callsList: {
    paddingBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
});
