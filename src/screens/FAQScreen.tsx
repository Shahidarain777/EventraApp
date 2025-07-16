import React, { useState } from 'react';
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

const FAQScreen = () => {
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      question: 'How to book an event?',
      answer: 'To book an event, simply browse through our event listings on the Home screen. Tap on any event card to view details, then tap the "Book Now" or "Register" button. You may need to provide additional information depending on the event requirements.',
    },
    {
      question: 'How to like or comment on an event?',
      answer: 'You can like an event by double-tapping on the event card or tapping the heart icon. To comment, tap the comment icon below the event card and type your message in the comment box. Your comments will be visible to other users.',
    },
    {
      question: 'How to create an event?',
      answer: 'To create an event, tap the "+" icon in the bottom navigation bar. Fill out all the required information including event title, description, date, time, location, and upload event images. Once submitted, your event will be reviewed and published.',
    },
    {
      question: 'How to report a problem?',
      answer: 'You can report problems through the "Report a Problem" option in Help & Support. Choose the appropriate category (bug report, inappropriate content, etc.) and provide detailed information about the issue you\'re experiencing.',
    },
    {
      question: 'How to reset my password?',
      answer: 'To reset your password, go to the login screen and tap "Forgot Password". Enter your email address and you\'ll receive a password reset link. You can also change your password from the Profile screen if you\'re already logged in.',
    },
    {
      question: 'How to update my profile information?',
      answer: 'Go to your Profile screen from the bottom navigation. Tap on your profile picture to update it, or contact support to update other information like your name or email address.',
    },
    {
      question: 'How to share an event?',
      answer: 'Tap the share icon on any event card to share it with friends through various apps like WhatsApp, SMS, or social media. The shared link will allow others to view the event details.',
    },
    {
      question: 'What should I do if an event is cancelled?',
      answer: 'If an event is cancelled, you\'ll receive a notification. Any fees paid will be automatically refunded to your original payment method within 3-5 business days. Contact support if you don\'t receive your refund.',
    },
    {
      question: 'How to contact event organizers?',
      answer: 'Event organizer contact information is available on the event details page. You can also leave comments on the event for public questions that other attendees might find helpful.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take your privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent. Read our Privacy Policy for more details.',
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
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Find answers to common questions about using Eventra. If you can't find what you're looking for, contact our support team.
        </Text>

        <View style={styles.faqContainer}>
          {faqData.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.questionContainer}
                onPress={() => toggleExpanded(index)}
              >
                <Text style={styles.questionText}>{item.question}</Text>
                <Ionicons
                  name={expandedItems.includes(index) ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#007BFF"
                />
              </TouchableOpacity>
              
              {expandedItems.includes(index) && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            If you couldn't find the answer you're looking for, don't hesitate to contact our support team.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
  faqContainer: {
    marginBottom: 32,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 12,
  },
  contactSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FAQScreen;
