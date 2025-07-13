import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import countriesData from '../data/countries.json';

interface AddressPickerProps {
  country: string;
  state: string;
  city: string;
  setCountry: (val: string) => void;
  setState: (val: string) => void;
  setCity: (val: string) => void;
}

const AddressPicker: React.FC<AddressPickerProps> = ({ country, state, city, setCountry, setState, setCity }) => {
  const [countryQuery, setCountryQuery] = useState('');
  const [stateQuery, setStateQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Filtered lists
  const filteredCountries = countriesData.filter(c => c.name.toLowerCase().includes(countryQuery.toLowerCase()));
  const selectedCountry = countriesData.find(c => c.name === country);
  const filteredStates = selectedCountry ? selectedCountry.states.filter(s => s.name.toLowerCase().includes(stateQuery.toLowerCase())) : [];
  const selectedState = selectedCountry?.states.find(s => s.name === state);
  const filteredCities = selectedState ? selectedState.cities.filter(cityName => cityName.toLowerCase().includes(cityQuery.toLowerCase())) : [];

  // Handlers
  const handleCountrySelect = (name: string) => {
    setCountry(name);
    setCountryQuery(name);
    setState('');
    setStateQuery('');
    setCity('');
    setCityQuery('');
    setShowCountryDropdown(false);
  };
  const handleStateSelect = (name: string) => {
    setState(name);
    setStateQuery(name);
    setCity('');
    setCityQuery('');
    setShowStateDropdown(false);
  };
  const handleCitySelect = (name: string) => {
    setCity(name);
    setCityQuery(name);
    setShowCityDropdown(false);
  };

  return (
    <View style={styles.addressBox}>
      <View style={styles.row}>
        <View style={styles.pickerCol}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            placeholder="Select"
            placeholderTextColor="#222"
            value={countryQuery || country}
            onChangeText={text => { setCountryQuery(text); setShowCountryDropdown(true); }}
            onFocus={() => setShowCountryDropdown(true)}
          />
          {showCountryDropdown && (
            <FlatList
              data={filteredCountries}
              keyExtractor={item => item.name}
              style={styles.dropdown}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleCountrySelect(item.name)} style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          )}
        </View>
        <View style={styles.pickerCol}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="Select"
            placeholderTextColor="#222"
            value={stateQuery || state}
            onChangeText={text => { setStateQuery(text); setShowStateDropdown(true); }}
            onFocus={() => setShowStateDropdown(true)}
            editable={!!country}
          />
          {showStateDropdown && !!country && (
            <FlatList
              data={filteredStates}
              keyExtractor={item => item.name}
              style={styles.dropdown}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleStateSelect(item.name)} style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          )}
        </View>
        <View style={styles.pickerCol}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Select"
            placeholderTextColor="#222"
            value={cityQuery || city}
            onChangeText={text => { setCityQuery(text); setShowCityDropdown(true); }}
            onFocus={() => setShowCityDropdown(true)}
            editable={!!state}
          />
          {showCityDropdown && !!state && (
            <FlatList
              data={filteredCities}
              keyExtractor={item => item}
              style={styles.dropdown}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleCitySelect(item)} style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addressBox: {
    width: '100%',
    backgroundColor: '#f7faff',
  
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    shadowColor: '#4F8CFF',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    gap: 8,
  },
  pickerCol: {
    flex: 1,
    marginHorizontal: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F8CFF',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#eaf0fa',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 6,
    color: '#222',
    fontSize: 17,
    borderWidth: 1,

    borderColor: '#dbe6fa',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  dropdown: {
    maxHeight: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0dbeeff',
    marginBottom: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4fa',
  },
  dropdownItemText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});

export default AddressPicker;
