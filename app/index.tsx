import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [inputUsuario, setInputUsuario] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    async function configurarNotificaciones() {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      }
    }
    configurarNotificaciones();
  }, []);

  const manejarLogin = async () => {
    if (!inputUsuario || !inputPassword) {
      const msg = "Ingresa tus datos";
      Platform.OS === 'web' ? alert(msg) : Alert.alert("Aviso", msg);
      return;
    }

    setCargando(true);
    try {
      const datosGuardados = await AsyncStorage.getItem('datos_cuenta');
      if (datosGuardados) {
        const usuarioValido = JSON.parse(datosGuardados);
        const correoIngresado = inputUsuario.trim().toLowerCase();
        const correoRegistrado = usuarioValido.correo.trim().toLowerCase();

        if (correoIngresado === correoRegistrado && inputPassword === usuarioValido.password) {
          
          // ✅ LA RUTA CORRECTA AHORA ES:
          const rutaDestino = '/tabs/inicio'; 

          if (Platform.OS === 'web') {
            router.replace(rutaDestino as any);
          } else {
            // Un pequeño delay para que el teclado se cierre y la transición sea limpia
            setTimeout(() => { 
                router.replace(rutaDestino as any); 
            }, 100);
          }
        } else {
          Alert.alert("Error", "Credenciales incorrectas");
        }
      } else {
        Alert.alert("Error", "No hay cuenta registrada");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Gestor Académico</Text>
          <Text style={styles.subtitle}>Inicia sesión</Text>
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Correo" autoCapitalize="none" value={inputUsuario} onChangeText={setInputUsuario} />
            <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={inputPassword} onChangeText={setInputPassword} />
            <TouchableOpacity style={styles.button} onPress={manejarLogin} disabled={cargando}>
              {cargando ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>INGRESAR</Text>}
            </TouchableOpacity>
          </View>
          {/* ✅ CORREGIDO TAMBIÉN EL REGISTRO SI ESTÁ EN LA RAÍZ */}
          <TouchableOpacity onPress={() => router.push('/regisScreen' as any)} style={{ marginTop: 20 }}>
            <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  innerContainer: { padding: 30, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2f6bb2' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 30 },
  form: { width: '100%', maxWidth: 400 },
  input: { backgroundColor: '#cfe2f3', padding: 15, borderRadius: 15, marginBottom: 15, textAlign: 'center' },
  button: { backgroundColor: '#2f6bb2', padding: 18, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#2f6bb2', textDecorationLine: 'underline' }
});