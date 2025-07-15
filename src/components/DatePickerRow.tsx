import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerRowProps {
  date: { start: Date; end: Date };
  setShowStartPicker: (show: boolean) => void;
  setShowEndPicker: (show: boolean) => void;
  showStartPicker: boolean;
  showEndPicker: boolean;
  handleDateChange: (type: 'start' | 'end', event: unknown, selectedDate?: Date) => void;
  styles: any;
}

const DatePickerRow: React.FC<DatePickerRowProps> = ({
  date, setShowStartPicker, setShowEndPicker, showStartPicker, showEndPicker, handleDateChange, styles
}) => (
  <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
      <Text style={styles.dateBtnText}>{date.start.toLocaleDateString()}</Text>
    </TouchableOpacity>
    <Text style={{ marginHorizontal: 8, fontWeight: 'bold', fontSize: 16, color: '#333' }}>—</Text>
    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
      <Text style={styles.dateBtnText}>{date.end.toLocaleDateString()}</Text>
    </TouchableOpacity>
    {showStartPicker && (
      <DateTimePicker
        value={date.start}
        mode="date"
        display="default"
        onChange={(e: any, d?: Date) => handleDateChange('start', e, d)}
      />
    )}
    {showEndPicker && (
      <DateTimePicker
        value={date.end}
        mode="date"
        display="default"
        onChange={(e: any, d?: Date) => handleDateChange('end', e, d)}
      />
    )}
  </View>
);

export default DatePickerRow;
