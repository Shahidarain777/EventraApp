import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
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
  const countryOptions = countriesData.map((c) => ({
    label: c.name,
    value: c.name,
  }));

  const selectedCountry = countriesData.find((c) => c.name === country);
  const stateOptions =
    selectedCountry?.states.map((s) => ({
      label: s.name,
      value: s.name,
    })) || [];

  const selectedState = selectedCountry?.states.find((s) => s.name === state);
  const cityOptions =
    selectedState?.cities.map((cityName) => ({
      label: cityName,
      value: cityName,
    })) || [];

  return (
    <View style={styles.addressBox}>
      <View style={styles.row}>
        <View style={styles.pickerCol}>
          <Text style={styles.label}>Country</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setCountry(value);
              setState('');
              setCity('');
            }}
            items={countryOptions}
            placeholder={{ label: 'Select', value: '' }}
            value={country}
            style={pickerSelectStyles}
          />
        </View>

        <View style={styles.pickerCol}>
          <Text style={styles.label}>State</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setState(value);
              setCity('');
            }}
            items={stateOptions}
            placeholder={{ label: 'Select', value: '' }}
            value={state}
            disabled={!country}
            style={pickerSelectStyles}
          />
        </View>

        <View style={styles.pickerCol}>
          <Text style={styles.label}>City</Text>
          <RNPickerSelect
            onValueChange={(value) => setCity(value)}
            items={cityOptions}
            placeholder={{ label: 'Select', value: '' }}
            value={city}
            disabled={!state}
            style={pickerSelectStyles}
          />
        </View>
      </View>
    </View>
  );
};

export default AddressPicker;

const styles = StyleSheet.create({
  addressBox: {
    width: '100%',
    backgroundColor: '#f7faff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  pickerCol: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F8CFF',
    marginBottom: 4,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    backgroundColor: '#eaf0fa',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: '#222',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#dbe6fa',
    marginBottom: 4,
  },
  inputAndroid: {
    backgroundColor: '#eaf0fa',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: '#222',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#dbe6fa',
    marginBottom: 4,
  },
  placeholder: {
    color: '#888',
  },
};
