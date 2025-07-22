import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, TabParamList } from '../types/navigations';
import { fetchEvents, Event } from '../redux/slices/eventSlice';
import EventCard from '../components/EventCard'; // <-- Import your EventCard

const HomeScreen = () => {
  const navigation = useNavigation<
    CompositeNavigationProp<
      BottomTabNavigationProp<TabParamList, 'Home'>,
      StackNavigationProp<RootStackParamList>
    >
  >();
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector((state: RootState) => state.events.events);
  const loading = useSelector((state: RootState) => state.events.loading);
  const error = useSelector((state: RootState) => state.events.error);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchEvents());
  };

  const renderItem = ({ item }: { item: Event }) => (
    <EventCard event={item} showJoin showActions />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.homeText}>Home</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateEvent')}>
          <Text style={styles.createEventText}>Create Event</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorBanner}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={events}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={handleRefresh}
            style={{width: '100%', flex: 1}}
            windowSize={3}
            maxToRenderPerBatch={5}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No events found</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                  <Text style={styles.retryText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6695ebff',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: '2%',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  homeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  createEventText: {
    fontSize: 15,
    color: '#007BFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorBanner: {
    color: '#d9534f',
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    width: '100%',
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
});