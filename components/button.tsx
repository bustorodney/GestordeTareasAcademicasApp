import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type ButtonProps = {
  title: string;
  onPress: () => void;
};

const Button: React.FC<ButtonProps> = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

export default Button;

const styles = StyleSheet.create({
  button: { backgroundColor: '#3b6fb6', borderRadius: 30, paddingVertical: 15, paddingHorizontal: 50, alignItems: 'center' },
  text: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
