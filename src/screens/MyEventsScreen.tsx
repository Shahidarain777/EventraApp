import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchEvents, Event } from '../redux/slices/eventSlice';
import EventCard from '../components/EventCard';

const MyEventsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector((state: RootState) => state.events.events);
  const loading = useSelector((state: RootState) => state.events.loading);
  const error = useSelector((state: RootState) => state.events.error);

  const userId = useSelector((state: RootState) => state.auth.user?._id);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Only show events where hostName matches logged-in user's name
  const myEvents = events.filter(
    (event: Event) => event.hostId === userId
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={myEvents}
        keyExtractor={item => item.eventId?.toString() || item.id?.toString()}
        renderItem={({ item }) => <EventCard event={item} showJoin={false} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No events found.</Text> : null}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchEvents())} />}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6695ebff',
    width: '100%',
    
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
