import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const CommunityGuidelinesScreen = () => {
  const navigation = useNavigation();

  const guidelines = [
    {
      icon: 'shield-checkmark',
      title: 'Be Respectful',
      description: 'Treat all community members with respect and kindness. No harassment, bullying, or discriminatory behavior.',
    },
    {
      icon: 'checkmark-circle',
      title: 'Authentic Events Only',
      description: 'Only post real, legitimate events. Fake events, scams, or misleading information will be removed.',
    },
    {
      icon: 'eye-off',
      title: 'No Inappropriate Content',
      description: 'Keep content family-friendly. No adult content, violence, hate speech, or offensive material.',
    },
    {
      icon: 'lock-closed',
      title: 'Protect Personal Information',
      description: 'Don\'t share personal details like phone numbers, addresses, or financial information in public.',
    },
    {
      icon: 'cash',
      title: 'No Spam or Solicitation',
      description: 'Don\'t use the platform for excessive self-promotion, spam, or unsolicited commercial messages.',
    },
    {
      icon: 'people',
      title: 'Meet Safely',
      description: 'When attending events, meet in public places and let someone know where you\'re going.',
    },
  ];

  const safetyTips = [
    'Always verify event details and organizer credentials',
    'Meet in well-lit, public locations for events',
    'Trust your instincts - if something feels wrong, leave',
    'Don\'t share financial information with strangers',
    'Report suspicious activity or users immediately',
    'Keep your personal information private until you trust someone',
    'Use the app\'s messaging system rather than sharing personal contact details',
    'Be cautious of events that seem too good to be true',
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
        <Text style={styles.headerTitle}>Community Guidelines</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Welcome to the Eventra community! These guidelines help ensure a safe and positive experience for everyone.
        </Text>

        {/* Community Guidelines Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Guidelines</Text>
          <View style={styles.guidelinesContainer}>
            {guidelines.map((guideline, index) => (
              <View key={index} style={styles.guidelineItem}>
                <View style={styles.guidelineIconContainer}>
                  <Ionicons name={guideline.icon as any} size={24} color="#007BFF" />
                </View>
                <View style={styles.guidelineContent}>
                  <Text style={styles.guidelineTitle}>{guideline.title}</Text>
                  <Text style={styles.guidelineDescription}>{guideline.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Safety Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.safetyContainer}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark-outline" size={32} color="#28a745" />
              <Text style={styles.safetyHeaderText}>Stay Safe While Using Eventra</Text>
            </View>
            
            {safetyTips.map((tip, index) => (
              <View key={index} style={styles.safetyTip}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark" size={16} color="#28a745" />
                </View>
                <Text style={styles.safetyTipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Violation Reporting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Violations</Text>
          <View style={styles.reportContainer}>
            <View style={styles.reportIconContainer}>
              <Ionicons name="flag" size={32} color="#ff6b6b" />
            </View>
            <Text style={styles.reportTitle}>See Something? Say Something!</Text>
            <Text style={styles.reportDescription}>
              If you encounter content or behavior that violates our community guidelines, please report it immediately. We take all reports seriously and will take appropriate action.
            </Text>
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => navigation.navigate('ReportProblemScreen' as never)}
            >
              <Ionicons name="flag-outline" size={20} color="#fff" />
              <Text style={styles.reportButtonText}>Report a Problem</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Consequences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consequences of Violations</Text>
          <View style={styles.consequencesContainer}>
            <Text style={styles.consequencesText}>
              Violations of our community guidelines may result in:
            </Text>
            <View style={styles.consequencesList}>
              <Text style={styles.consequenceItem}>• Warning or temporary suspension</Text>
              <Text style={styles.consequenceItem}>• Content removal</Text>
              <Text style={styles.consequenceItem}>• Permanent account ban</Text>
              <Text style={styles.consequenceItem}>• Legal action (for serious violations)</Text>
            </View>
            <Text style={styles.consequencesNote}>
              We reserve the right to take action at our discretion to maintain a safe community environment.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
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
    marginRight: 32,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginVertical: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  guidelinesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  guidelineItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guidelineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  guidelineDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  safetyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  safetyHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  safetyHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 8,
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  safetyTipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  reportContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffe6e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  reportButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  consequencesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  consequencesText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    fontWeight: '500',
  },
  consequencesList: {
    marginBottom: 16,
  },
  consequenceItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  consequencesNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CommunityGuidelinesScreen;
