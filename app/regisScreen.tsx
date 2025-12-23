import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();

  // 1. Estados para capturar la información
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  // 2. Función de Registro con Mensajes Mejorados
  const manejarRegistro = async () => {
    // Validaciones iniciales con iconos
    if (!nombre || !correo || !password || !confirmarPassword) {
      Alert.alert("⚠️ Atención", "Para crear tu cuenta, todos los campos son obligatorios.");
      return;
    }

    if (password !== confirmarPassword) {
      Alert.alert("❌ Error", "Las contraseñas no coinciden. Inténtalo de nuevo.");
      return;
    }

    try {
      // Objeto con la información del usuario
      const datosUsuario = {
        nombre: nombre,
        correo: correo,
        password: password
      };

      // Guardar en la memoria (AsyncStorage)
      await AsyncStorage.setItem('datos_cuenta', JSON.stringify(datosUsuario));

      // Mensaje personalizado
      const tituloExito = "✨ ¡Cuenta Lista!";
      const mensajeCuerpo = `¡Hola ${nombre}! 👋\n\nTu cuenta ha sido creada con éxito. Ahora puedes organizar tus tareas académicas y proyectos.`;

      // 3. Confirmación según plataforma (Web o App)
      if (Platform.OS === 'web') {
        // Estilo para navegadores
        alert(`✅ ${tituloExito}\n\n${mensajeCuerpo}`);
        router.replace('/'); 
      } else {
        // Estilo para celulares
        Alert.alert(
          tituloExito,
          mensajeCuerpo,
          [
            { 
              text: "COMENZAR AHORA 🚀", 
              onPress: () => router.replace('/') 
            }
          ],
          { cancelable: false }
        );
      }

    } catch (error) {
      Alert.alert("❗ Error", "Tuvimos un problema al guardar tu información. Intenta más tarde.");
      console.log(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Gestor de Tareas Académicas</Text>
      </View>

      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Nombre completo" 
          placeholderTextColor="#7a8ba3"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Correo electrónico" 
          placeholderTextColor="#7a8ba3"
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={setCorreo}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Contraseña" 
          placeholderTextColor="#7a8ba3"
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Confirmar contraseña" 
          placeholderTextColor="#7a8ba3"
          secureTextEntry 
          value={confirmarPassword}
          onChangeText={setConfirmarPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={manejarRegistro}>
          <Text style={styles.buttonText}>REGISTRARSE</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/')} style={styles.loginLinkContainer}>
          <Text style={styles.footerLink}>
            ¿Ya tienes cuenta? <Text style={styles.loginText}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 30, 
    justifyContent: 'center', 
    backgroundColor: '#fff' 
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#333', 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#2f6bb2', 
    textAlign: 'center', 
    marginTop: 5 
  },
  form: { 
    width: '100%' 
  },
  input: { 
    backgroundColor: '#cfe2f3', 
    padding: 18, 
    borderRadius: 20, 
    marginBottom: 15, 
    textAlign: 'center',
    fontSize: 16,
    color: '#2f6bb2',
    borderWidth: 1,
    borderColor: '#b8d4f0'
  },
  button: { 
    backgroundColor: '#2f6bb2', 
    padding: 18, 
    borderRadius: 20, 
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  loginLinkContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerLink: { 
    color: '#666', 
    fontSize: 15 
  },
  loginText: {
    color: '#2f6bb2',
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  }
});