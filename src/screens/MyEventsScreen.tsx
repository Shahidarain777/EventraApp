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
  // Get user's location
  const userCity = useSelector((state: RootState) => state.auth.user?.Address?.city?.toLowerCase() || '');
  const userState = useSelector((state: RootState) => state.auth.user?.Address?.state?.toLowerCase() || '');
  const userCountry = useSelector((state: RootState) => state.auth.user?.Address?.country?.toLowerCase() || '');
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector((state: RootState) => state.events.events);
  const loading = useSelector((state: RootState) => state.events.loading);
  const error = useSelector((state: RootState) => state.events.error);
  const userId = useSelector((state: RootState) => state.auth.user?._id);
  const [activeTab, setActiveTab] = useState<TabType>('My Event');

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // My Events: Only show events where hostId matches logged-in user's id, sorted by location priority and newest first
  const myEvents = events
    .filter((event: Event) => event.hostId === userId)
    .sort((a, b) => {
      const aCity = a.location?.city?.toLowerCase() || '';
      const bCity = b.location?.city?.toLowerCase() || '';
      const aState = a.location?.state?.toLowerCase() || '';
      const bState = b.location?.state?.toLowerCase() || '';
      const aCountry = a.location?.country?.toLowerCase() || '';
      const bCountry = b.location?.country?.toLowerCase() || '';
      const aPriority = (aCity === userCity ? 3 : 0) + (aState === userState ? 2 : 0) + (aCountry === userCountry ? 1 : 0);
      const bPriority = (bCity === userCity ? 3 : 0) + (bState === userState ? 2 : 0) + (bCountry === userCountry ? 1 : 0);
      if (aPriority !== bPriority) return bPriority - aPriority;
      const aDate = new Date(a.createdAt || a.dateTime?.start || 0).getTime();
      const bDate = new Date(b.createdAt || b.dateTime?.start || 0).getTime();
      return bDate - aDate;
    });

  // Joined Events: Only show events where user is a joined member with specific statuses
  const joinedStatuses = [
    'approval_pending',
    'payment_pending',
    'payment_verification_pending',
    'member',
    'canceled',
  ];
  // Joined Events: Only show events where user is a joined member with specific statuses, sorted by location priority and newest first
  const joinedEvents = events
    .filter((event: Event) =>
      Array.isArray(event.joinedMembers) &&
      event.joinedMembers.some(
        (m) => m.userId?.toString() === userId?.toString() && joinedStatuses.includes(m.status)
      )
    )
    .sort((a, b) => {
      const aCity = a.location?.city?.toLowerCase() || '';
      const bCity = b.location?.city?.toLowerCase() || '';
      const aState = a.location?.state?.toLowerCase() || '';
      const bState = b.location?.state?.toLowerCase() || '';
      const aCountry = a.location?.country?.toLowerCase() || '';
      const bCountry = b.location?.country?.toLowerCase() || '';
      const aPriority = (aCity === userCity ? 3 : 0) + (aState === userState ? 2 : 0) + (aCountry === userCountry ? 1 : 0);
      const bPriority = (bCity === userCity ? 3 : 0) + (bState === userState ? 2 : 0) + (bCountry === userCountry ? 1 : 0);
      if (aPriority !== bPriority) return bPriority - aPriority;
      const aDate = new Date(a.createdAt || a.dateTime?.start || 0).getTime();
      const bDate = new Date(b.createdAt || b.dateTime?.start || 0).getTime();
      return bDate - aDate;
    });

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar with Tabs */}
      <View style={styles.statusBarContainer}>
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
      </View>
      {/* Tab Content fills the rest of the screen */}
      <View style={styles.listContainer}>
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
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#075cf8ff',
    width: '100%',
  },
  statusBarContainer: {
    backgroundColor: '#f0f0f0',
    paddingTop: 8,
    paddingBottom: 0,
    paddingHorizontal: 0,
    zIndex: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffffff',
    borderRadius: 10,
    padding: 4,
    marginHorizontal: 16,
    marginTop: -5,
    marginBottom: 2,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 15,
  },
  tabButtonActive: {
    backgroundColor: '#075cf8ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabButtonText: {
    color: '#2788ff',
    fontWeight: '600',
    fontSize: 20,
  },
  tabButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    width: '100%',
    paddingBottom: 0,
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
