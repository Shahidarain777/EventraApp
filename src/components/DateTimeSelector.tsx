import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface DateTimeSelectorProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const [showMainModal, setShowMainModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentPickerType, setCurrentPickerType] = useState<'start' | 'end'>('start');
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>('date');

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${dayName}, ${day} ${month}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTimeRange = () => {
    const startTime = formatTime(startDate);
    const endTime = formatTime(endDate);
    return `${startTime} - ${endTime}`;
  };

  const formatDateRange = () => {
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    
    if (isSameDay) {
      return formatDate(startDate);
    } else {
      // Different dates - show range
      const startDay = startDate.getDate();
      const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
      const endDay = endDate.getDate();
      const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
      
      if (startDate.getMonth() === endDate.getMonth()) {
        // Same month
        return `${startDay} - ${endDay} ${startMonth}`;
      } else {
        // Different months
        return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
      }
    }
  };

  const getDisplayMonth = () => {
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    
    if (isSameDay) {
      return startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    } else {
      // For date ranges, show the start month
      return startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    }
  };

  const getDisplayDay = () => {
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    
    if (isSameDay) {
      return startDate.getDate().toString();
    } else {
      // For date ranges, show range like "13-14"
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();
      
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDay}-${endDay}`;
      } else {
        return startDay.toString(); // Just show start day if different months
      }
    }
  };

  const getTimezone = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMinutes = Math.abs(offset % 60);
    const offsetSign = offset <= 0 ? '+' : '-';
    
    return `PKT (UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')})`;
  };

  const openDatePicker = (type: 'start' | 'end') => {
    setCurrentPickerType(type);
    setCurrentMode('date');
    setShowTimePicker(false); // Close time picker if open
    setShowDatePicker(true);
  };

  const openTimePicker = (type: 'start' | 'end') => {
    setCurrentPickerType(type);
    setCurrentMode('time');
    setShowDatePicker(false); // Close date picker if open
    setShowTimePicker(true);
  };

  const handleDatePickerChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (currentPickerType === 'start') {
        onStartDateChange(selectedDate);
      } else {
        onEndDateChange(selectedDate);
      }
    }
    setShowDatePicker(false);
  };

  const handleTimePickerChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      if (currentPickerType === 'start') {
        onStartDateChange(selectedTime);
      } else {
        onEndDateChange(selectedTime);
      }
    }
    setShowTimePicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date & Time</Text>
      
      {/* Main Date & Time Display Card - Clickable */}
      <TouchableOpacity 
        style={styles.mainCard}
        onPress={() => setShowMainModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.dateSection}>
          <View style={styles.dateIconContainer}>
            <Text style={styles.monthText}>
              {getDisplayMonth()}
            </Text>
            <Text style={styles.dayText}>
              {getDisplayDay()}
            </Text>
          </View>
          
          <View style={styles.dateDetails}>
            <Text style={styles.dateText}>{formatDateRange()}</Text>
          </View>
          
          <View style={styles.timeSection}>
            <Ionicons name="time-outline" size={20} color="#2788ff" />
            <View style={styles.timeDetails}>
              <Text style={styles.timeText}>{formatTimeRange()}</Text>
              <Text style={styles.timezoneText}>{getTimezone()}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Main Date & Time Modal */}
      <Modal
        visible={showMainModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowMainModal(false);
          setShowDatePicker(false);
          setShowTimePicker(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.mainModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date & Time</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowMainModal(false);
                  setShowDatePicker(false);
                  setShowTimePicker(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Date & Time Controls */}
            <View style={styles.controlsContainer}>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Start</Text>
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => openDatePicker('start')}
                >
                  <Ionicons name="calendar-outline" size={16} color="#2788ff" />
                  <Text style={styles.controlButtonText}>
                    {startDate.toLocaleDateString('en-GB')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => openTimePicker('start')}
                >
                  <Ionicons name="time-outline" size={16} color="#2788ff" />
                  <Text style={styles.controlButtonText}>
                    {formatTime(startDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>End</Text>
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => openDatePicker('end')}
                >
                  <Ionicons name="calendar-outline" size={16} color="#2788ff" />
                  <Text style={styles.controlButtonText}>
                    {endDate.toLocaleDateString('en-GB')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => openTimePicker('end')}
                >
                  <Ionicons name="time-outline" size={16} color="#2788ff" />
                  <Text style={styles.controlButtonText}>
                    {formatTime(endDate)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => {
                setShowMainModal(false);
                setShowDatePicker(false);
                setShowTimePicker(false);
              }}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={currentPickerType === 'start' ? startDate : endDate}
          mode="date"
          display="default"
          onChange={handleDatePickerChange}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={currentPickerType === 'start' ? startDate : endDate}
          mode="time"
          display="default"
          onChange={handleTimePickerChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mainCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    width: '100%',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dateIconContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 60,
    minHeight: 60,
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2788ff',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2788ff',
    textAlign: 'center',
  },
  dateDetails: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDetails: {
    marginLeft: 8,
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timezoneText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  controlsContainer: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 10,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    width: 40,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
    gap: 6,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  mainModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0,
    width: '95%',
    maxWidth: 450,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  datePicker: {
    height: 200,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#2788ff',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  doneButton: {
    backgroundColor: '#2788ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 20,
    marginTop: 10,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default DateTimeSelector;
