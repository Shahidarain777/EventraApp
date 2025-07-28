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
  const [tempDate, setTempDate] = useState(new Date());

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
    setTempDate(type === 'start' ? startDate : endDate);
    setShowDatePicker(true);
  };

  const openTimePicker = (type: 'start' | 'end') => {
    setCurrentPickerType(type);
    setCurrentMode('time');
    setTempDate(type === 'start' ? startDate : endDate);
    setShowTimePicker(true);
  };

  const handleDatePickerChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleTimePickerChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTempDate(selectedTime);
    }
  };

  const confirmDateSelection = () => {
    if (currentPickerType === 'start') {
      onStartDateChange(tempDate);
    } else {
      onEndDateChange(tempDate);
    }
    setShowDatePicker(false);
  };

  const confirmTimeSelection = () => {
    if (currentPickerType === 'start') {
      onStartDateChange(tempDate);
    } else {
      onEndDateChange(tempDate);
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
              {startDate.toLocaleDateString('en-US', { month: 'short' })}
            </Text>
            <Text style={styles.dayText}>
              {startDate.getDate()}
            </Text>
          </View>
          
          <View style={styles.dateDetails}>
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
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
        onRequestClose={() => setShowMainModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.mainModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date & Time</Text>
              <TouchableOpacity 
                onPress={() => setShowMainModal(false)}
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
              onPress={() => setShowMainModal(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {currentPickerType === 'start' ? 'Start' : 'End'} Date
              </Text>
            </View>
            
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDatePickerChange}
              style={styles.datePicker}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={confirmDateSelection}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {currentPickerType === 'start' ? 'Start' : 'End'} Time
              </Text>
            </View>
            
            <DateTimePicker
              value={tempDate}
              mode="time"
              display="spinner"
              onChange={handleTimePickerChange}
              style={styles.datePicker}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={confirmTimeSelection}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
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
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIconContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 50,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2788ff',
    textTransform: 'uppercase',
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2788ff',
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
