import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [numPendientes, setNumPendientes] = useState(0);

  // Carga los datos cada vez que la pantalla gana foco
  const cargarDatos = async () => {
    try {
      // 1. Cargar el nombre del usuario
      const user = await AsyncStorage.getItem('datos_cuenta');
      if (user) setNombre(JSON.parse(user).nombre.split(' ')[0]);

      // 2. CARGAR TAREAS DEL CALENDARIO (Sincronización real)
      const resTareas = await AsyncStorage.getItem('eventos_calendario');
      if (resTareas) {
        const lista = JSON.parse(resTareas);
        // Contamos cuántas NO están completadas
        const pendientes = lista.filter((t: any) => !t.completado).length;
        setNumPendientes(pendientes);
      } else {
        setNumPendientes(0);
      }
    } catch (e) {
      console.error("Error al cargar datos en Inicio:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView bounces={false}>
        {/* SECCIÓN BIENVENIDA (Tu estilo azul original) */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>¡Hola, {nombre || 'Bienvenido'}!</Text>
          <Text style={styles.appName}>TaskFlow</Text>
          
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Resumen de hoy</Text>
            <View style={styles.row}>
              <Ionicons name="book" size={20} color="#2f6bb2" />
              <Text style={styles.statusText}>
                {numPendientes > 0 
                  ? ` Tienes ${numPendientes} tareas pendientes en tu agenda` 
                  : ' ✨ ¡Todo listo! No tienes pendientes'}
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN DE NAVEGACIÓN (Tus botones grandes) */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>¿Qué quieres hacer?</Text>
          
          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={styles.mainButton}
              onPress={() => router.push('/tabs/calendar' as any)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="calendar" size={32} color="#fff" />
              </View>
              <View>
                <Text style={styles.buttonLabel}>Ver mi Agenda</Text>
                <Text style={styles.buttonSubLabelText}>Gestiona tus días</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: '#cfe2f3' }]}
              onPress={() => router.push('/tabs/projects' as any)}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#2f6bb2' }]}>
                <Ionicons name="folder-open" size={32} color="#fff" />
              </View>
              <View>
                <Text style={[styles.buttonLabel, { color: '#2f6bb2' }]}>Materias</Text>
                <Text style={[styles.buttonSubLabelText, { color: '#555' }]}>Progreso automático</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  welcomeSection: {
    padding: 30,
    backgroundColor: '#2f6bb2',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingBottom: 50,
    paddingTop: 50,
  },
  greeting: { fontSize: 20, color: '#cfe2f3' },
  appName: { fontSize: 40, fontWeight: 'bold', color: '#ffffff', marginBottom: 20 },
  statusCard: { 
    backgroundColor: '#ffffff', 
    padding: 20, 
    borderRadius: 25, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  statusTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  statusText: { color: '#666', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  menuSection: { padding: 30, marginTop: 10 },
  menuTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  buttonGrid: { flexDirection: 'column', gap: 15 },
  mainButton: {
    backgroundColor: '#2f6bb2',
    padding: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  iconCircle: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  buttonLabel: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buttonSubLabelText: { fontSize: 12, color: '#cfe2f3' },
});