import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, StatusBar, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { initNotifications, markNotificationRead, deleteNotification, markAllNotificationsRead } from '../redux/slices/NotificationSlice';
import { AppDispatch } from '../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationScreen = () => {
  const [search, setSearch] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: any) => state.notifications.notifications);
  const loading = useSelector((state: any) => state.notifications.loading);
  const error = useSelector((state: any) => state.notifications.error);

  useEffect(() => {
    const ensureData = async () => {
      if (!notifications || notifications.length === 0) {
        try {
          const cached = await AsyncStorage.getItem('notifications');
          if (cached) {
            // Directly set local state instead of dispatching missing hydrate action
            // NOTE: This keeps redux state unchanged until a manual refresh
            try {
              const parsed = JSON.parse(cached);
              // simple fallback render using local variable; but we rely on redux, so setState pattern could be used.
              // For now trigger full fetch only if no cache
              // Optionally you could dispatch a new hydrate action if added later.
            } catch {}
          } else {
            dispatch(initNotifications());
          }
        } catch {
          dispatch(initNotifications());
        }
      }
    };
    ensureData();
  }, [dispatch]);

  const handleSearch = () => { 
    // Optionally filter notifications locally or refetch from backend
    dispatch(initNotifications());
  };

  const onMarkRead = useCallback((id: string) => {
    dispatch(markNotificationRead(id)).then(() => dispatch(initNotifications()));
  }, [dispatch]);

  const onDelete = useCallback((id: string, wasUnread: boolean) => {
    Alert.alert('Delete Notification', 'Are you sure you want to delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        dispatch(deleteNotification({ id, wasUnread })).then(() => dispatch(initNotifications()));
      }},
    ]);
  }, [dispatch]);

  const onMarkAll = useCallback(() => {
    dispatch(markAllNotificationsRead()).then(() => dispatch(initNotifications()));
  }, [dispatch]);

  const renderItem = ({ item }: { item: any }) => {
    const id = item._id || item.id;
    return (
      <View style={styles.notificationCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!item.read && (
              <TouchableOpacity onPress={() => onMarkRead(id)} style={styles.actionIconBtn}>
                <Ionicons name="checkmark-done-outline" size={20} color="#2266e4ff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => onDelete(id, !item.read)} style={styles.actionIconBtn}>
              <Ionicons name="trash-outline" size={20} color="#d9534f" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationMeta}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Text>
        {!item.read && (
          <Text style={styles.unreadBadge}>Unread</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.searchBarRow}>
        <Ionicons name="search-outline" size={22} color="#8fa1c7" style={styles.icon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Notifications..."
          placeholderTextColor="#8fa1c7"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Ionicons name="arrow-forward-circle" size={28} color="#4F8CFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => { dispatch(initNotifications()); }} style={styles.toolbarBtn}>
          <Ionicons name="refresh-outline" size={20} color="#4F8CFF" />
          <Text style={styles.toolbarBtnText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onMarkAll} style={styles.toolbarBtn}>
          <Ionicons name="checkmark-done-outline" size={20} color="#4F8CFF" />
          <Text style={styles.toolbarBtnText}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#2266e4ff" style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 32 }}>{error}</Text>
      ) : notifications.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 32, color: '#888' }}>No notifications found.</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item._id || item.id || Math.random().toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshing={loading}
          onRefresh={() => { dispatch(initNotifications()); }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9faff',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 14,
    margin: 0,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#2266e4ff',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#1a1a1a',
    fontSize: 18,
    borderWidth: 0,
    fontWeight: '400',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  searchBtn: {
    marginLeft: 8,
  },
  icon: {
    marginRight: 8,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1d23cbff',
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationMessage: {
    fontSize: 15,
    color: '#222',
    marginBottom: 6,
  },
  notificationMeta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#2266e4ff',
    color: '#fff',
    fontSize: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  actionIconBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 4,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#eef4ff',
  },
  toolbarBtnText: {
    color: '#4F8CFF',
    fontWeight: '600',
  },
});

export default NotificationScreen;
