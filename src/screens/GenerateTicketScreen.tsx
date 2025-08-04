import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { useRoute } from '@react-navigation/native';


const getCurrentMember = (event: any, userId: string) => {
  if (!event || !event.joinedMembers) return null;
  return event.joinedMembers.find((m: any) => m.userId?.toString() === userId);
};

const GenerateTicketScreen = () => {
  const viewShotRef = useRef<any>(null);
  const route = useRoute();
  const { event } = route.params as { event: any };
  const userId = useSelector((state: RootState) => state.auth.user?._id?.toString() || '');
  const member = getCurrentMember(event, userId);

  if (!event || !member) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#d9534f', fontSize: 16 }}>No ticket available.</Text>
      </View>
    );
  }

  const ticketData = {
    eventId: event.eventId,
    eventTitle: event.title,
    date: event.dateTime?.start,
    memberId: member.userId,
    memberName: member.name,
    paymentStatus: member.paymentStatus,
    ticketId: member.ticketId || member.userId,
  };

  const isValid = event.dateTime?.end ? new Date(event.dateTime.end) > new Date() : false;

  const handleDownload = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        Alert.alert('Ticket Saved', 'Ticket image saved to your device.');
      } else {
        Alert.alert('Error', 'Ticket view not ready.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save ticket.');
    }
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        await Share.share({ url: uri, title: 'My Event Ticket' });
      } else {
        Alert.alert('Error', 'Ticket view not ready.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to share ticket.');
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.ticketCard}>
        {/* Eventra Logo */}
        <Image source={require('../../assets/EventraLogo.png')}
          style={styles.logo}
        />
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>
          {event.dateTime?.start ? new Date(event.dateTime.start).toLocaleString() : ''} - {event.dateTime?.end ? new Date(event.dateTime.end).toLocaleString() : ''}
        </Text>
        <Text style={styles.eventVenue}>{event.location?.venueName || ''}</Text>
        <Text style={styles.eventAddress}>{event.location?.address || ''}</Text>
        <View style={styles.memberRow}>
          {member.profileImage ? (
            <Image
              source={{
                uri: (() => {
                  if (member.profileImage.startsWith('http')) return member.profileImage;
                  if (member.profileImage.startsWith('/uploads')) {
                    return `${require('../api/axios').default.defaults.baseURL?.replace(/\/api$/, '')}${member.profileImage}`;
                  }
                  if (member.profileImage.startsWith('/')) {
                    return `${require('../api/axios').default.defaults.baseURL?.replace(/\/api$/, '')}/uploads${member.profileImage}`;
                  }
                  return `${require('../api/axios').default.defaults.baseURL?.replace(/\/api$/, '')}/uploads/${member.profileImage}`;
                })()
              }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              {/* You may need to import Ionicons at the top if not already */}
              <Text style={{ fontSize: 38, color: '#bbb' }}>👤</Text>
            </View>
          )}
          <Text style={styles.memberName}>{member.name}</Text>
        </View>

        <Text style={styles.paymentStatus}>Payment: {member.paymentStatus}</Text>
        <Text style={styles.ticketId}>Ticket #: {member.ticketId || member.userId}</Text>
        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode value={JSON.stringify(ticketData)} size={160} />
        </View>
        <Text style={styles.validity}>{isValid ? 'Valid Ticket' : 'Expired Ticket'}</Text>
        <Text style={styles.instructions}>
          Show this ticket at entry. QR code will be scanned for verification.
        </Text>
        <Text style={styles.terms}>
          By using this ticket, you agree to the event terms and conditions.
        </Text>
      </ViewShot>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
          <Text style={styles.actionBtnText}>Download Ticket</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Text style={styles.actionBtnText}>Share Ticket</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7faff',
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 18,
    width: 340,
  },
    placeholderImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e0e7ef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2788ff',
    marginBottom: 6,
    textAlign: 'center',
  },
  eventDate: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  eventVenue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  eventAddress: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: '#e0e7ef',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  paymentStatus: {
    fontSize: 14,
    color: '#43a047',
    marginBottom: 2,
  },
  ticketId: {
    fontSize: 14,
    color: '#2788ff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  qrContainer: {
    marginVertical: 12,
    backgroundColor: '#f7faff',
    padding: 12,
    borderRadius: 16,
  },
  validity: {
    fontSize: 15,
    color: '#43a047',
    fontWeight: '600',
    marginBottom: 2,
  },
  instructions: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
    textAlign: 'center',
  },
  terms: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtn: {
    backgroundColor: '#2788ff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default GenerateTicketScreen;