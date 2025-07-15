import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type UserSearchBoxProps = {
  label: string;
  value: string;
  setValue: (val: string) => void;
  type: 'subLeader' | 'financeManager';
  userSearchType: 'subLeader' | 'financeManager' | null;
  setUserSearchType: (type: 'subLeader' | 'financeManager' | null) => void;
  showUserDropdown: boolean;
  setShowUserDropdown: (show: boolean) => void;
  userQuery: string;
  setUserQuery: (query: string) => void;
  userResults: { id: string; username: string }[];
  styles: any;
};

const UserSearchBox: React.FC<UserSearchBoxProps> = ({
  label, value, setValue, type,
  userSearchType, setUserSearchType,
  showUserDropdown, setShowUserDropdown,
  userQuery, setUserQuery, userResults, styles
}) => (
  <View style={styles.userSearchBox}>
    <Text style={styles.label}>{label} <Text style={{color:'#888',fontSize:13}}>(optional)</Text></Text>
    <View style={styles.userSearchInputRow}>
      <TextInput
        style={styles.userSearchInput}
        placeholder={label}
        placeholderTextColor="#888"
        value={type === userSearchType ? userQuery : value}
        onFocus={() => {
          setUserSearchType(type);
          setShowUserDropdown(true);
          setUserQuery(value);
        }}
        onChangeText={text => {
          setUserQuery(text);
          setShowUserDropdown(true);
          setUserSearchType(type);
          setValue(text);
        }}
      />
      <Ionicons name="search" size={22} style={styles.userSearchIcon} />
    </View>
    {showUserDropdown && userSearchType === type && userResults.length > 0 && (
      <View style={styles.userDropdown}>
        <ScrollView style={{ maxHeight: 120 }}>
          {userResults.map((user) => (
            <TouchableOpacity key={user.id} style={styles.userDropdownItem} onPress={() => {
              setValue(user.username);
              setShowUserDropdown(false);
              setUserQuery(user.username);
            }}>
              <Text style={styles.userDropdownText}>{user.username}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )}
  </View>
);

export default UserSearchBox;
