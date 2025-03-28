import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { Link } from "expo-router";

import { Colors } from "../constants/Colors";
import EmergencyContactCard from "../components/EmergencyContactCard";

export default function HomeScreen() {
  const handleEmergencyPress = () => {
    Alert.alert(
      "Llamada de Emergencia",
      "¿Desea realizar una llamada de emergencia al 123?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Llamar",
          onPress: () => {
            // Logic to make the call would go here
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ height: 170 }}>
        <View style={styles.headerOverlay}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/policia-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>Aplicación Anti-Extorsión</Text>
          <Text style={styles.headerSubtitle}>
            App - Anti-Extorsión
          </Text>
        </View>

        {/* Colombian flag stripe */}
        <View style={styles.flagStripe}>
          <View
            style={[styles.flagColor, { backgroundColor: Colors.flagYellow }]}
          />
          <View
            style={[styles.flagColor, { backgroundColor: Colors.flagBlue }]}
          />
          <View
            style={[styles.flagColor, { backgroundColor: Colors.flagRed }]}
          />
        </View>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Emergency Button */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyPress}
          activeOpacity={0.8}
        >
          <FontAwesome5
            name="exclamation-circle"
            size={24}
            color={Colors.light}
          />
          <Text style={styles.emergencyButtonText}>Emergencia</Text>
        </TouchableOpacity>

        {/* Quick Access Cards */}
        <View style={styles.quickAccessContainer}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>
          <View style={styles.cardRow}>
            <Link href="/reportar" asChild>
              <TouchableOpacity style={styles.quickCard} activeOpacity={0.7}>
                <View
                  style={[
                    styles.cardIconContainer,
                    { backgroundColor: Colors.danger },
                  ]}
                >
                  <FontAwesome5
                    name="exclamation-triangle"
                    size={20}
                    color={Colors.light}
                  />
                </View>
                <Text style={styles.cardTitle}>Reportar</Text>
                <Text style={styles.cardSubtitle}>Incidentes</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/alertas" asChild>
              <TouchableOpacity style={styles.quickCard} activeOpacity={0.7}>
                <View
                  style={[
                    styles.cardIconContainer,
                    { backgroundColor: Colors.warning },
                  ]}
                >
                  <FontAwesome5 name="bell" size={20} color={Colors.light} />
                </View>
                <Text style={styles.cardTitle}>Alertas</Text>
                <Text style={styles.cardSubtitle}>Recientes</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/grabacion" asChild>
              <TouchableOpacity style={styles.quickCard} activeOpacity={0.7}>
                <View
                  style={[
                    styles.cardIconContainer,
                    { backgroundColor: Colors.info },
                  ]}
                >
                  <FontAwesome5
                    name="microphone"
                    size={20}
                    color={Colors.light}
                  />
                </View>
                <Text style={styles.cardTitle}>Grabar</Text>
                <Text style={styles.cardSubtitle}>Llamadas</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.contactsContainer}>
          <Text style={styles.sectionTitle}>Contactos de Emergencia</Text>

          <EmergencyContactCard
            title="Línea de Emergencia"
            phoneNumber="123"
            description="Línea nacional de emergencias"
            icon="ambulance"
            isPrimary
          />

          <EmergencyContactCard
            title="CAI Caldas"
            phoneNumber="6014567890"
            description="Localidad Kennedy, Bogotá"
            icon="shield-alt"
          />

          <EmergencyContactCard
            title="GAULA Anti-Extorsión"
            phoneNumber="165"
            description="Grupo Anti-Extorsión y Secuestro"
            icon="user-shield"
          />
        </View>

        {/* Latest Alert */}
        <View style={styles.alertContainer}>
          <Text style={styles.sectionTitle}>Ultima Alerta</Text>
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <FontAwesome5
                name="exclamation-triangle"
                size={18}
                color={Colors.danger}
              />
              <Text style={styles.alertTitle}>
                Nueva modalidad de extorsión
              </Text>
            </View>
            <Text style={styles.alertDate}>21 de Marzo, 2023</Text>
            <Text style={styles.alertDescription}>
              Se han reportado casos de individuos que se hacen pasar por
              funcionarios del Ministerio de Hacienda solicitando pagos por
              supuestas deudas tributarias.
            </Text>
            <TouchableOpacity style={styles.alertButton}>
              <Text style={styles.alertButtonText}>Ver Más</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  headerBackground: {
    width: "100%",
    height: 180,
  },
  headerOverlay: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 69, 124, 0.85)", // Police blue with opacity
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: "center",
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: Colors.light,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.light,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light,
    opacity: 0.9,
  },
  flagStripe: {
    flexDirection: "row",
    height: 5,
  },
  flagColor: {
    flex: 1,
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emergencyButtonText: {
    color: Colors.light,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  quickAccessContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickCard: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.dark,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  contactsContainer: {
    marginBottom: 24,
  },
  alertContainer: {
    marginBottom: 24,
  },
  alertCard: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
    marginLeft: 8,
  },
  alertDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertButton: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  alertButtonText: {
    color: Colors.light,
    fontSize: 12,
    fontWeight: "bold",
  },
});
