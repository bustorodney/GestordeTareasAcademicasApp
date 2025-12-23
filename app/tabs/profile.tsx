import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  // Estados para los datos del perfil
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [fecha, setFecha] = useState('');
  const [password, setPassword] = useState('');

  // Cargar datos apenas entramos a la pantalla
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const datos = await AsyncStorage.getItem('datos_cuenta');
        if (datos) {
          const user = JSON.parse(datos);
          setNombre(user.nombre || '');
          setCorreo(user.correo || '');
          setPassword(user.password || '');
        }
      } catch (e) {
        console.log("Error al cargar perfil");
      }
    };
    cargarPerfil();
  }, []);

  // Función para guardar cambios hechos en el perfil
  const guardarCambios = async () => {
    try {
      const nuevoPerfil = { nombre, correo, password, fecha };
      await AsyncStorage.setItem('datos_cuenta', JSON.stringify(nuevoPerfil));
      Alert.alert("¡Hecho!", "Perfil actualizado correctamente");
    } catch (e) {
      Alert.alert("Error", "No se pudo actualizar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configura tu perfil</Text>
      
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle} />
        <TouchableOpacity style={styles.cameraIcon}>
          <Text>📷</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity>
        <Text style={styles.editPhoto}>Editar foto</Text>
      </TouchableOpacity>

      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Nombre completo" 
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Fecha de nacimiento (DD/MM/AAAA)" 
          value={fecha}
          onChangeText={setFecha}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Correo electrónico" 
          value={correo}
          editable={false} // El correo suele ser fijo, pero puedes quitar esto
        />
        <TextInput 
          style={styles.input} 
          placeholder="Contraseña" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.saveButton} onPress={guardarCambios}>
          <Text style={styles.saveText}>GUARDAR CAMBIOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20, color: '#333' },
  avatarContainer: { position: 'relative' },
  avatarCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E8F1F9', borderWidth: 3, borderColor: '#3B71CA' },
  cameraIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#ddd', padding: 8, borderRadius: 20 },
  editPhoto: { color: '#3B71CA', textDecorationLine: 'underline', marginVertical: 10, fontWeight: '500' },
  form: { width: '100%', marginTop: 10 },
  input: { backgroundColor: '#BDD4EB', padding: 15, borderRadius: 20, marginBottom: 15, textAlign: 'center', color: '#2f6bb2', fontSize: 16 },
  saveButton: { backgroundColor: '#3B71CA', padding: 18, borderRadius: 25, alignItems: 'center', marginTop: 10, elevation: 3 },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});