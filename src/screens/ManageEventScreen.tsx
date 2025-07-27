import React from 'react';
//import { fetchEvents, Event } from '../redux/slices/eventSlice';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/axios';

const ManageEventScreen = () => {
  const navigation = require('@react-navigation/native').useNavigation();
  const route = require('@react-navigation/native').useRoute();
  const { event } = route.params || {};
  const token = require('react-redux').useSelector((state: any) => state.auth.token);

  const handleCancelEvent = () => {
    if (!event?.eventId) return Alert.alert('Error', 'No eventId found');
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to cancel this event? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.delete('/events', {
                headers: { Authorization: `Bearer ${token}` },
                data: { eventId: Number(event.eventId) },
              });
              Alert.alert('Success', 'Event deleted successfully');
              navigation.goBack();
            } catch (err) {
              const errorAny = err as any;
              const errorMsg = errorAny && errorAny.response && errorAny.response.data && errorAny.response.data.message
                ? errorAny.response.data.message
                : 'Failed to delete event';
              Alert.alert('Error', errorMsg);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={28} color="#ffffffff" style={{ marginRight: 8, }} />
        <Text style={styles.headerText}>Manage Event</Text>
      </View>
      {/* <Text style={styles.title}>Manage Event</Text> */}

      <View style={styles.buttonGroup}>
        <View style={styles.row}>
          <Button
            style={styles.editButton}
            text="Edit Event"
            icon="create-outline"
            
            onPress={() => navigation.navigate('EditEventScreen', { event })}
          />
        </View>
        <View style={styles.row}>
          <Button style={styles.memberButton} text="Member List" icon="people-outline" />
        </View>
        <View style={styles.row}>
          <Button style={styles.paymentButton} text="Payment Verification Pending" icon="card-outline" />
        </View>
        <View style={styles.row}>
          <Button style={styles.approvalButton} text="Approval Pending" icon="time-outline" />
        </View>
        <View style={styles.row}>
          <Button style={styles.cancelButton} text="Cancel Event" icon="close-circle-outline" onPress={handleCancelEvent} />
        </View>
      </View>
    </View>
  );
};

const Button = ({ style, text, icon, onPress }: { style: any; text: string; icon: string; onPress?: () => void }) => (
  <TouchableOpacity style={[styles.button, style]} activeOpacity={0.85} onPress={onPress}>
    <Ionicons name={icon} size={22} color={style.color || '#fff'} style={{ marginRight: 10 }} />
    <Text style={[styles.buttonText, { color: style.color || '#fff' }]}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#005effff',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 240,
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffffff',
    letterSpacing: 0.5,
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
    marginBottom: 132,
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
    backgroundColor: '#df6be3ff',
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
    backgroundColor: '#5ad8ebff',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#ed6462ff',
    color: '#fff',
  },
});

export default ManageEventScreen;
