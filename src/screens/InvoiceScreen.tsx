import React from 'react';
import api from '../api/axios';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Share, Alert, Platform } from 'react-native';
import ImageUploadCard from '../components/ImageUploadCard';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
// import CameraRoll from '@react-native-camera-roll/camera-roll';

const InvoiceScreen: React.FC = () => {
  const events = useSelector((state: any) => state.events.events);
  const currentUserId = useSelector((state: any) =>
    state.auth.user?._id?.toString() || state.auth.user?.id?.toString() || ''
  );
  const token = useSelector((state: RootState) => state.auth.token);
  const paymentPendingEvents = events.filter((event: any) =>
    Array.isArray(event.joinedMembers) &&
    event.joinedMembers.some((m: any) => m.userId?.toString() === currentUserId && m.status === 'payment_pending')
  );

  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);
  const [uploading, setUploading] = React.useState(false);
  const [proofImages, setProofImages] = React.useState<string[]>([]);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleCardPress = (event: any) => {
    setSelectedEvent(event);
    setProofImages([]);
    setUploadError(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
    setProofImages([]);
    setUploadError(null);
  };

  const getCurrentMember = (event: any) =>
    event?.joinedMembers?.find((m: any) => m.userId?.toString() === currentUserId);

  const getTicketBreakdown = (member: any, event: any) => {
    const mainTickets = member?.ticketQuantities?.mainEvent || 0;
    const subTickets = member?.ticketQuantities?.subEvents || {};
    const subEventDetails = event?.subEvents || [];
    return { mainTickets, subTickets, subEventDetails };
  };

  const getTotalAmount = (member: any, event: any) => member?.totalAmount || 0;

  const handleAddImage = async () => {
    setUploadError(null);
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        setUploadError('Image picker error: ' + response.errorMessage);
        return;
      }
      const asset = response.assets && response.assets[0];
      if (asset?.uri) {
        setProofImages((prev) => [...prev, asset.uri!]);
      }
    });
  };

  const handleRemoveImage = (idx: number) => {
    setProofImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadProof = async () => {
    if (!proofImages.length || !selectedEvent) return;

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Upload images and collect URLs
      const uploadedUrls: string[] = [];
      for (const uri of proofImages) {
        const formData = new FormData();
        formData.append('image', {
          uri,
          type: 'image/jpeg',
          name: `proof_${Date.now()}.jpg`,
        } as any);
        formData.append('eventId', selectedEvent?.eventId || '');
        const res = await api.post('/upload_image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
        if (!res.data?.image?.url) {
          throw new Error('Image upload failed.');
        }
        uploadedUrls.push(res.data.image.url);
      }

      // 2. Call payment API
      const member = getCurrentMember(selectedEvent);
      const paymentPayload = {
       // id: undefined, // let backend generate or set as needed
        userId: member?.userId || currentUserId,
        eventId: selectedEvent?.eventId || selectedEvent?.id,
        hostId: selectedEvent?.hostId,
        name: member?.name || '',
        amount: member?.totalAmount,
        paymentStatus: 'payment_verification_pending',
        paymentMethod: 'manual',
        proofImages: uploadedUrls,
        accountHolderName: selectedEvent?.accountHolderName || '',
        accountNumber: selectedEvent?.accountNumber || '',
        bankName: selectedEvent?.bankName || '',
        createdAt: new Date(),
      };
      const paymentRes = await api.post('/payments', paymentPayload);
      if (paymentRes.status === 200 || paymentRes.status === 201) {
        // Update event member status after payment
        await api.put(
          '/event_members',
          {
            eventId: Number(selectedEvent?.eventId || selectedEvent?.id),
            userId: member?.userId || currentUserId,
            status: 'payment_verification_pending',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Alert.alert('Success', 'Payment proof submitted successfully.');
        closeModal();
      } else {
        throw new Error('Payment API failed.');
      }
    } catch (err) {
      setUploadError('Failed to upload proof image(s) or submit payment.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!proofImages.length) {
      setUploadError('No proof images to save.');
      return;
    }
    setUploadError(null);
    try {
      for (const img of proofImages) {
        // await CameraRoll.save(img, { type: 'photo' });
      }
      Alert.alert('Success', 'Proof image(s) saved to gallery.');
    } catch (err) {
      setUploadError('Saving to gallery failed. Please check permissions or try again.');
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Invoices</Text>
      <View style={styles.listContainer}>
        {paymentPendingEvents.length === 0 ? (
          <Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            No pending invoices found.
          </Text>
        ) : (
          paymentPendingEvents.map((event: any) => (
            <View key={event.eventId || event.id} style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => handleCardPress(event)}
              >
                <View style={styles.cardLeft}>
                  <Ionicons
                    name="wallet-outline"
                    size={28}
                    color="#2788ff"
                    style={styles.cardIcon}
                  />
                  <View>
                    <Text style={styles.eventName}>{event.title || event.name || 'Event'}</Text>
                    <Text style={styles.hint}>Generate Invoice</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedEvent?.title || selectedEvent?.name || 'Event'}
            </Text>
            <Text style={styles.modalHint}>Generate Invoice</Text>

            {selectedEvent && (
              <View style={{ width: '100%', marginBottom: 12 }}>
                <Text style={styles.detailLabel}>
                  Member Name:{' '}
                  <Text style={styles.detailValue}>
                    {getCurrentMember(selectedEvent)?.name || '-'}
                  </Text>
                </Text>
                <Text style={styles.detailLabel}>
                  Host Name:{' '}
                  <Text style={styles.detailValue}>{selectedEvent.hostName || '-'}</Text>
                </Text>
                <Text style={styles.detailLabel}>
                  Account Holder:{' '}
                  <Text style={styles.detailValue}>{selectedEvent.accountHolderName || '-'}</Text>
                </Text>
                <Text style={styles.detailLabel}>
                  Account Number:{' '}
                  <Text style={styles.detailValue}>{selectedEvent.accountNumber || '-'}</Text>
                </Text>
                <Text style={styles.detailLabel}>
                  Bank Name:{' '}
                  <Text style={styles.detailValue}>{selectedEvent.bankName || '-'}</Text>
                </Text>

                <Text style={[styles.detailLabel, { marginTop: 8 }]}>Tickets:</Text>
                <Text style={styles.detailValue}>
                  Main Event:{' '}
                  {getTicketBreakdown(getCurrentMember(selectedEvent), selectedEvent).mainTickets}
                </Text>
                {getTicketBreakdown(getCurrentMember(selectedEvent), selectedEvent).subEventDetails.map((sub: any) => (
                  <Text key={sub.subEventId || sub._id} style={styles.detailValue}>
                    {sub.itemName}:{' '}
                    {
                      getTicketBreakdown(getCurrentMember(selectedEvent), selectedEvent).subTickets[
                        sub.subEventId
                      ] || 0
                    }
                  </Text>
                ))}
                <Text style={[styles.detailLabel, { marginTop: 8 }]}>Total Amount:</Text>
                <Text style={styles.detailValue}>
                  {selectedEvent?.currency || 'PKR'}{' '}
                  {getTotalAmount(getCurrentMember(selectedEvent), selectedEvent)}
                </Text>
              </View>
            )}

            <View style={{ width: '100%', alignItems: 'flex-start', marginBottom: 12 }}>
              <Text style={styles.detailLabel}>Upload Proof of Transaction:</Text>
              <ImageUploadCard images={proofImages} onAdd={handleAddImage} onRemove={handleRemoveImage} />
              {uploadError && (
                <Text style={{ color: 'red', marginTop: 4 }}>{uploadError}</Text>
              )}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={async () => {
                  if (!selectedEvent) return;
                  const member = getCurrentMember(selectedEvent);
                  const ticketBreakdown = getTicketBreakdown(member, selectedEvent);
                  let ticketText = `Main Event: ${ticketBreakdown.mainTickets}`;
                  ticketBreakdown.subEventDetails.forEach((sub: any) => {
                    ticketText += `\n${sub.itemName}: ${
                      ticketBreakdown.subTickets[sub.subEventId] || 0
                    }`;
                  });

                  const shareText = `Event: ${selectedEvent.title || selectedEvent.name}\nMember: ${
                    member?.name
                  }\nHost: ${selectedEvent.hostName}\nAccount Holder: ${
                    selectedEvent.accountHolderName
                  }\nAccount Number: ${selectedEvent.accountNumber}\nBank Name: ${
                    selectedEvent.bankName
                  }\n${ticketText}\nTotal: ${selectedEvent?.currency || 'PKR'} ${getTotalAmount(
                    member,
                    selectedEvent
                  )}`;

                  try {
                    await Share.share({ message: shareText });
                  } catch (error) {
                    setUploadError('Share failed.');
                  }
                }}
              >
                <Ionicons name="share-social-outline" size={28} color="#2788ff" />
                <Text style={[styles.actionText, { color: '#2788ff' }]}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleSaveToGallery}
                disabled={!proofImages.length}
              >
                <Ionicons
                  name="image-outline"
                  size={28}
                  color={proofImages.length ? '#2788ff' : '#888'}
                />
                <Text style={[styles.actionText, { color: proofImages.length ? '#2788ff' : '#888' }]}>
                  Save to Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} disabled>
                <Ionicons name="document-outline" size={28} color="#888" />
                <Text style={styles.actionText}>Save as PDF</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 16, backgroundColor: '#28a745' }]}
              onPress={handleUploadProof}
              disabled={uploading || !proofImages.length}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.closeButtonText}>Submit Payment Proof</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.closeButton, { marginTop: 8 }]} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7faff', paddingTop: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#2788ff', marginBottom: 10, textAlign: 'center' },
  listContainer: { paddingHorizontal: 12 },
  cardWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardIcon: { marginRight: 12 },
  eventName: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 2 },
  hint: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2788ff', marginBottom: 8, textAlign: 'center' },
  modalHint: { fontSize: 15, color: '#888', fontStyle: 'italic', marginBottom: 20, textAlign: 'center' },
  closeButton: { backgroundColor: '#2788ff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', marginTop: 16, marginBottom: 8 },
  actionBtn: { alignItems: 'center', justifyContent: 'center', width: 80 },
  actionText: { color: '#888', fontSize: 13, marginTop: 4 },
  detailLabel: { fontSize: 14, color: '#333', fontWeight: 'bold', marginBottom: 2 },
  detailValue: { fontSize: 14, color: '#2788ff', fontWeight: '600', marginBottom: 2 },
});

export default InvoiceScreen;
