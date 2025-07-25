import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ManageEventScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Event</Text>

      <View style={styles.buttonGroup}>
        <View style={styles.row}>
          <Button style={styles.editButton} text="Edit Event" icon="pencil" />
        </View>
        <View style={styles.row}>
          <Button style={styles.memberButton} text="Member List" icon="account-group" />
        </View>
        <View style={styles.row}>
          <Button style={styles.paymentButton} text="Payment Verification Pending" icon="credit-card-clock" />
        </View>
        <View style={styles.row}>
          <Button style={styles.approvalButton} text="Approval Pending" icon="account-clock" />
        </View>
        <View style={styles.row}>
          <Button style={styles.cancelButton} text="Cancel Event" icon="close-circle" />
        </View>
      </View>
    </View>
  );
};

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Button = ({ style, text, icon }: { style: any; text: string; icon: string }) => (
  <TouchableOpacity style={[styles.button, style]} activeOpacity={0.85}>
    <Icon name={icon} size={22} color={style.color || '#fff'} style={{ marginRight: 10 }} />
    <Text style={[styles.buttonText, { color: style.color || '#fff' }]}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 32,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
  },
  row: {
    width: '100%',
    marginBottom: 18,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  editButton: {
    backgroundColor: '#2788ff',
    color: '#fff',
  },
  memberButton: {
    backgroundColor: '#43a047',
    color: '#fff',
  },
  paymentButton: {
    backgroundColor: '#ffb300',
    color: '#fff',
  },
  approvalButton: {
    backgroundColor: '#6d4cff',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#e53935',
    color: '#fff',
  },
});

export default ManageEventScreen;
