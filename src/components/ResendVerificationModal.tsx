import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/axios';

interface ResendVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  email?: string;
}

const ResendVerificationModal = ({ visible, onClose, email: initialEmail }: ResendVerificationModalProps) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);

  const handleResendVerification = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/resend-verification', { email: email.trim() });
      if (response.status === 200) {
        Alert.alert(
          'Verification Email Sent',
          'A new verification email has been sent to your email address. Please check your inbox and spam folder.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend verification email.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Resend Verification Email</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalDescription}>
            Enter your email address to receive a new verification email.
          </Text>
          
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={22} color="#8fa1c7" style={styles.icon} />
            <TextInput
              style={styles.inputRowInput}
              placeholder="Email"
              placeholderTextColor="#8fa1c7"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor="#4F8CFF"
              autoFocus
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalConfirmButton} 
              onPress={handleResendVerification}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalConfirmText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ResendVerificationModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    opacity: 0.95,
  },
  icon: {
    marginLeft: 8,
    marginRight: 8,
  },
  inputRowInput: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#1a1a1a',
    fontSize: 18,
    borderWidth: 0,
    fontWeight: '400',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#4F8CFF',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 