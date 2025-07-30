import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchEvents, Event } from '../redux/slices/eventSlice';
import EventCard from '../components/EventCard';

const TABS = ['My Event', 'Joined Event'] as const;
type TabType = typeof TABS[number];

const MyEventsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector((state: RootState) => state.events.events);
  const loading = useSelector((state: RootState) => state.events.loading);
  const error = useSelector((state: RootState) => state.events.error);
  const userId = useSelector((state: RootState) => state.auth.user?._id);
  const [activeTab, setActiveTab] = useState<TabType>('My Event');

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // My Events: Only show events where hostId matches logged-in user's id
  const myEvents = events.filter(
    (event: Event) => event.hostId === userId
  );

  // Joined Events: Only show events where user is a joined member with specific statuses
  const joinedStatuses = [
    'approval_pending',
    'payment_pending',
    'payment_verification_pending',
    'member',
    'canceled',
  ];
  const joinedEvents = events.filter((event: Event) =>
    Array.isArray(event.joinedMembers) &&
    event.joinedMembers.some(
      (m) => m.userId?.toString() === userId?.toString() && joinedStatuses.includes(m.status)
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Tab Content */}
      {activeTab === 'My Event' ? (
        <FlatList
          data={myEvents}
          keyExtractor={item => item.eventId?.toString() || item.id?.toString()}
          renderItem={({ item }) => <EventCard event={item} showJoin={true} />}
          ListEmptyComponent={!loading ? <Text style={styles.empty}>No events found.</Text> : null}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchEvents())} />}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      ) : (
        <FlatList
          data={joinedEvents}
          keyExtractor={item => item.eventId?.toString() || item.id?.toString()}
          renderItem={({ item }) => <EventCard event={item} showJoin={true} />}
          ListEmptyComponent={!loading ? <Text style={styles.empty}>No joined events found.</Text> : null}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchEvents())} />}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6695ebff',
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#eaf0fa',
    borderRadius: 12,
    margin: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '90%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    borderBottomWidth: 3,
    borderBottomColor: '#2788ff',
  },
  tabButtonText: {
    color: '#2788ff',
    fontWeight: '600',
    fontSize: 16,
  },
  tabButtonTextActive: {
    color: '#222',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginVertical: 18,
    alignSelf: 'center',
  },
  error: {
    color: '#d9534f',
    marginBottom: 10,
    fontSize: 15,
    alignSelf: 'center',
  },
  empty: {
    color: '#888',
    fontSize: 16,
    alignSelf: 'center',
    marginTop: 40,
  },
});

export default MyEventsScreen;
