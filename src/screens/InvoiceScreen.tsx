import React, { useRef } from 'react';
import api from '../api/axios';
import { Image, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import ImageUploadCard from '../components/ImageUploadCard';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';

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

  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);
  const [uploading, setUploading] = React.useState(false);
  const [proofImages, setProofImages] = React.useState<string[]>([]);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // For ViewShot
  const viewShotRef = useRef<any>(null);

  const handleCardPress = (event: any) => {
    setSelectedEvent(event);
    setProofImages([]);
    setUploadError(null);
  };

  const closeDetailView = () => {
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
        closeDetailView();
      } else {
        throw new Error('Payment API failed.');
      }
    } catch (err) {
      setUploadError('Failed to upload proof image(s) or submit payment.');
    } finally {
      setUploading(false);
    }
  };

  // ViewShot logic for sharing/downloading invoice details
  const handleShareInvoice = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        await Share.open({ url: uri, title: 'Invoice Proof' });
      } else {
        Alert.alert('Error', 'Invoice view not ready.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to share invoice.');
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        Alert.alert('Invoice Saved', 'Invoice image saved to your device.');
        // You can add logic to save to gallery if needed
      } else {
        Alert.alert('Error', 'Invoice view not ready.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save invoice.');
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

      {/* Invoice Details View */}
      {selectedEvent && (
        <ScrollView style={styles.detailViewOverlay} contentContainerStyle={styles.detailViewContent}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.95 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16 }}>
              {/* Eventra Logo */}
              <Image source={require('../../assets/EventraLogo.png')}
                style={styles.logo}
              />
              <Text style={styles.modalTitle}>
                {selectedEvent?.title || selectedEvent?.name || 'Event'}
              </Text>
              <Text style={styles.modalHint}>Generate Invoice</Text>

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
                <Text style={[styles.detailLabel, { marginTop: 8 }]}>Sub Event Tickets:</Text>
                {getTicketBreakdown(getCurrentMember(selectedEvent), selectedEvent).subEventDetails.map((sub: any) => (
                  <Text key={sub.subEventId || sub._id} style={styles.detailValue}>
                    {sub.itemName}:{' '}
                    {getTicketBreakdown(getCurrentMember(selectedEvent), selectedEvent).subTickets[
                      sub.subEventId
                    ] || 0}
                  </Text>
                ))}
                <Text style={[styles.detailLabel, { marginTop: 8 }]}>Total Amount:</Text>
                <Text style={styles.detailValue}>
                  {selectedEvent?.currency || 'PKR'}{' '}
                  {getTotalAmount(getCurrentMember(selectedEvent), selectedEvent)}
                </Text>
              </View>
              <View style={{ width: '100%', alignItems: 'flex-start', marginBottom: 12 }}>
                <Text style={styles.detailLabel}>Proof of Transaction:</Text>
                <ImageUploadCard images={proofImages} onAdd={handleAddImage} onRemove={handleRemoveImage} />
                {uploadError && (
                  <Text style={{ color: 'red', marginTop: 4 }}>{uploadError}</Text>
                )}
              </View>
            </View>
          </ViewShot>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShareInvoice}>
              <Ionicons name="share-social-outline" size={28} color="#2788ff" />
              <Text style={[styles.actionText, { color: '#2788ff' }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDownloadInvoice}>
              <Ionicons name="download-outline" size={28} color="#2788ff" />
              <Text style={[styles.actionText, { color: '#2788ff' }]}>Download</Text>
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
          <TouchableOpacity style={[styles.closeButton, { marginTop: 8 }]} onPress={closeDetailView}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f8ff',
    paddingTop: 16,
  },
    logo: {
    width: 100,
    height: 90,
    borderRadius: 12,
    marginBottom: -20,
    marginTop: -50,
    marginLeft: 60,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1b6dc1',
    marginBottom: 12,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  cardWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    marginRight: 14,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  hint: {
    fontSize: 13,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  detailViewOverlay: {
    position: 'absolute',
    left: 0,
    top: 60,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(240, 243, 255, 0.98)',
    zIndex: 999,
  },
  detailViewContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    width: '90%',
    minHeight: 500,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b6dc1',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalHint: {
    fontSize: 15,
    color: '#6c757d',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#1b6dc1',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    //  justifyContent: 'space-around',
    alignItems: 'center',
    width: '10%',
    marginTop: -30,
    marginBottom: 1,
    marginRight: 140,
    // flexWrap: 'wrap',
    // gap: 0,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  actionText: {
    color: '#6c757d',
    fontSize: 13,
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    color: '#1b6dc1',
    fontWeight: '600',
    marginBottom: 3,
  },
});
export default InvoiceScreen;