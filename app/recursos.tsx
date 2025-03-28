import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Image,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import PoliceHeader from '../components/PoliceHeader';
import EmergencyContactCard from '../components/EmergencyContactCard';

interface PreventionTip {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface ResourceLink {
  id: string;
  title: string;
  url: string;
  description: string;
  icon: string;
}

const PREVENTION_TIPS: PreventionTip[] = [
  {
    id: '1',
    title: 'Verifique la identidad del llamante',
    description: 'Siempre verifique la identidad de quien llama. Si recibe una llamada de una entidad bancaria o estatal, cuelgue y llame al número oficial.',
    icon: 'user-check'
  },
  {
    id: '2',
    title: 'No proporcione información personal',
    description: 'Nunca comparta información personal, bancaria o códigos de verificación por teléfono a personas desconocidas.',
    icon: 'lock'
  },
  {
    id: '3',
    title: 'Reconozca señales de alarma',
    description: 'Desconfíe de llamadas que generan urgencia, miedo o presión para tomar decisiones inmediatas.',
    icon: 'exclamation-triangle'
  },
  {
    id: '4',
    title: 'Mantenga la calma',
    description: 'Ante una posible extorsión, mantenga la calma. No actúe impulsivamente y busque ayuda de las autoridades.',
    icon: 'heart'
  },
  {
    id: '5',
    title: 'Coordine con otros comerciantes',
    description: 'Mantenga comunicación con otros comerciantes de la zona para conocer sobre nuevos casos o modalidades de extorsión.',
    icon: 'store'
  }
];

const RESOURCE_LINKS: ResourceLink[] = [
  {
    id: '1',
    title: 'Policía Nacional',
    url: 'https://www.policia.gov.co/',
    description: 'Sitio oficial de la Policía Nacional de Colombia.',
    icon: 'shield-alt'
  },
  {
    id: '2',
    title: 'GAULA - Grupo Antiextorsión',
    url: 'https://www.policia.gov.co/especializados/gaula',
    description: 'Información sobre el Grupo Antiextorsión y Antisecuestro.',
    icon: 'user-shield'
  },
  {
    id: '3',
    title: 'Fiscalía General de la Nación',
    url: 'https://www.fiscalia.gov.co/',
    description: 'Denuncias y seguimiento de casos.',
    icon: 'balance-scale'
  },
  {
    id: '4',
    title: 'Prevención de Extorsión',
    url: 'https://www.mindefensa.gov.co/',
    description: 'Guías y material educativo sobre prevención de extorsión.',
    icon: 'book'
  }
];

export default function RecursosScreen() {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  
  const toggleTip = (id: string) => {
    if (expandedTip === id) {
      setExpandedTip(null);
    } else {
      setExpandedTip(id);
    }
  };
  
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <PoliceHeader 
        title="Recursos e Información" 
        subtitle="Aprenda a prevenir la extorsión" 
      />
      
      <ScrollView style={styles.contentContainer}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image 
            source={require('../assets/images/prevention-banner.jpg')}
            style={styles.heroBanner}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>
              Juntos contra la extorsión
            </Text>
            <Text style={styles.heroSubtitle}>
              Recursos para la comunidad comercial de Kennedy
            </Text>
          </View>
        </View>
        
        {/* Prevention Tips */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Consejos de Prevención
          </Text>
          
          {PREVENTION_TIPS.map(tip => (
            <TouchableOpacity 
              key={tip.id}
              style={styles.tipContainer}
              onPress={() => toggleTip(tip.id)}
              activeOpacity={0.8}
            >
              <View style={styles.tipHeader}>
                <View style={styles.tipIconContainer}>
                  <FontAwesome5 name={tip.icon} size={20} color={Colors.light} />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <FontAwesome5 
                  name={expandedTip === tip.id ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color={Colors.primary} 
                />
              </View>
              
              {expandedTip === tip.id && (
                <Text style={styles.tipDescription}>
                  {tip.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Types of Extortion */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Modalidades de Extorsión
          </Text>
          
          <View style={styles.extortionTypesContainer}>
            <View style={styles.extortionTypeCard}>
              <View style={styles.extortionIconContainer}>
                <FontAwesome5 name="phone" size={24} color={Colors.danger} />
              </View>
              <Text style={styles.extortionTypeTitle}>Extorsión Telefónica</Text>
              <Text style={styles.extortionTypeDescription}>
                Llamadas donde amenazan con daños a familiares o al negocio si no se realiza un pago.
              </Text>
            </View>
            
            <View style={styles.extortionTypeCard}>
              <View style={styles.extortionIconContainer}>
                <FontAwesome5 name="envelope" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.extortionTypeTitle}>Extorsión por Mensajes</Text>
              <Text style={styles.extortionTypeDescription}>
                Mensajes de texto o WhatsApp con amenazas directas o suplantando identidades.
              </Text>
            </View>
            
            <View style={styles.extortionTypeCard}>
              <View style={styles.extortionIconContainer}>
                <FontAwesome5 name="store-alt" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.extortionTypeTitle}>Extorsión Presencial</Text>
              <Text style={styles.extortionTypeDescription}>
                Visitas al negocio solicitando pagos por "seguridad" o "permiso" para operar.
              </Text>
            </View>
          </View>
        </View>
        
        {/* Useful Links */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Enlaces Útiles
          </Text>
          
          {RESOURCE_LINKS.map(resource => (
            <TouchableOpacity 
              key={resource.id}
              style={styles.resourceLinkContainer}
              onPress={() => handleOpenLink(resource.url)}
              activeOpacity={0.7}
            >
              <View style={styles.resourceLinkIconContainer}>
                <FontAwesome5 name={resource.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.resourceLinkContent}>
                <Text style={styles.resourceLinkTitle}>{resource.title}</Text>
                <Text style={styles.resourceLinkDescription}>{resource.description}</Text>
              </View>
              <FontAwesome5 name="external-link-alt" size={16} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Emergency Contacts */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Contactos de Emergencia
          </Text>
          
          <EmergencyContactCard
            title="Línea de Emergencia"
            phoneNumber="123"
            description="Línea nacional de emergencias"
            icon="ambulance"
            isPrimary
          />
          
          <EmergencyContactCard
            title="GAULA Anti-Extorsión"
            phoneNumber="165"
            description="Grupo Anti-Extorsión y Secuestro"
            icon="user-shield"
          />
          
          <EmergencyContactCard
            title="CAI Caldas"
            phoneNumber="6014567890"
            description="Localidad Kennedy, Bogotá"
            icon="shield-alt"
          />
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/policia-logo.png')} 
              style={styles.footerLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.footerText}>
            Policía Nacional de Colombia
          </Text>
          <Text style={styles.footerSubtext}>
            App - Anti-Extorsión
          </Text>
        </View>
      </ScrollView>
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
  },
  heroContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  heroBanner: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 69, 124, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.light,
    opacity: 0.9,
  },
  sectionContainer: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  tipContainer: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  tipDescription: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 22,
    marginTop: 12,
    marginLeft: 48,
  },
  extortionTypesContainer: {
    marginBottom: 16,
  },
  extortionTypeCard: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  extortionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  extortionTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  extortionTypeDescription: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  resourceLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resourceLinkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceLinkContent: {
    flex: 1,
  },
  resourceLinkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  resourceLinkDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: Colors.grey,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLogo: {
    width: 48,
    height: 48,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
}); 