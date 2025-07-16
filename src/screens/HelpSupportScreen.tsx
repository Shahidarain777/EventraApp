import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const HelpSupportScreen = () => {
  const navigation = useNavigation();

  const openEmail = () => {
    const email = 'support@eventra.com';
    const subject = 'Support Request';
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.openURL(mailto).catch(() => {
      Alert.alert('Error', 'Unable to open email app');
    });
  };

  const openPhone = () => {
    const phoneNumber = 'tel:+1234567890';
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const openWebsite = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open website');
    });
  };

  const helpOptions = [
    {
      icon: 'help-circle-outline',
      title: 'FAQs',
      subtitle: 'Frequently Asked Questions',
      action: () => navigation.navigate('FAQScreen' as never),
    },
    {
      icon: 'mail-outline',
      title: 'Email Support',
      subtitle: 'support@eventra.com',
      action: openEmail,
    },
    {
      icon: 'call-outline',
      title: 'Phone Support',
      subtitle: '+92 (234) 567-890',
      action: openPhone,
    },
    {
      icon: 'chatbubble-outline',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      action: () => Alert.alert('Coming Soon', 'Live chat will be available soon!'),
    },
    {
      icon: 'bug-outline',
      title: 'Report a Problem',
      subtitle: 'Bug reports & feedback',
      action: () => navigation.navigate('ReportProblemScreen' as never),
    },
    {
      icon: 'shield-outline',
      title: 'Privacy Policy',
      subtitle: 'View our privacy policy',
      action: () => openWebsite('https://eventra.com/privacy'),
    },
    {
      icon: 'document-text-outline',
      title: 'Terms of Service',
      subtitle: 'View terms and conditions',
      action: () => openWebsite('https://eventra.com/terms'),
    },
    {
      icon: 'people-outline',
      title: 'Community Guidelines',
      subtitle: 'Safety tips and guidelines',
      action: () => navigation.navigate('CommunityGuidelinesScreen' as never),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionDescription}>
          Need help? We're here to assist you. Choose from the options below to get the support you need.
        </Text>

        <View style={styles.optionsContainer}>
          {helpOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionItem}
              onPress={option.action}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon as any} size={24} color="#007BFF" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info Section */}
        <View style={styles.appInfoSection}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>1.0.0 (Build 100)</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>July 16, 2025</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Developer</Text>
                <Text style={styles.infoValue}>© Eventra 2025</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginRight: 32, // Compensate for back button
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginVertical: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  appInfoSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
});

export default HelpSupportScreen;
