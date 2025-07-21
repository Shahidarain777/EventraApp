import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EventCard from '../components/EventCard';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Event } from '../redux/slices/eventSlice';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigations';

type NavigationProp = StackNavigationProp<RootStackParamList, 'EventDetailScreen'>;
const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  // Fetch events from Redux state
  const events = useSelector((state: RootState) => state.events.events);
  const navigation = useNavigation<NavigationProp>();

  const handleSearch = () => {
    setLoading(true);
    const q = query.trim().toLowerCase();
    const filtered = events.filter(event => {
      return (
        (event.title && event.title.toLowerCase().includes(q)) ||
        (event.organizer && event.organizer.toLowerCase().includes(q)) ||
        (event.category && event.category.toLowerCase().includes(q))
      );
    });
    setResults(filtered);
    setLoading(false);
  };

  return (
    <LinearGradient colors={["#4F8CFF", "#A6C8FF"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.searchBarRow}>
          <Ionicons name="search-outline" size={22} color="#8fa1c7" style={styles.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8fa1c7"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
            <Ionicons name="arrow-forward-circle" size={28} color="#4F8CFF" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <Text style={styles.loadingText}>Searching...</Text>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                onJoin={() => {}}
                onLike={() => {}}
                onComment={() => {}}
              />
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No events found.</Text>}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF0FA',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 14,
    margin: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2266e4ff',
  },
  icon: {
    marginRight: 8,
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
  loadingText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#f8f8f8ff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#ff3636ff',
    fontSize: 16,
    fontWeight: '400',
  },
});
