import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

export default function ProjectsScreen() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // --- LÓGICA DE CÁLCULO AUTOMÁTICO ---
  const calcularProgresoDesdeCalendario = async () => {
    try {
      // 1. Obtener materias y tareas de la agenda
      const resProyectos = await AsyncStorage.getItem('lista_proyectos');
      const resCalendario = await AsyncStorage.getItem('eventos_calendario');

      const listaMaterias = resProyectos ? JSON.parse(resProyectos) : [];
      const listaTareas = resCalendario ? JSON.parse(resCalendario) : [];

      // 2. Mapear cada materia y calcular su porcentaje real
      const materiasActualizadas = listaMaterias.map((materia: any) => {
        // Filtramos tareas que pertenecen a esta materia (ignorando mayúsculas/minúsculas)
        const tareasDeEstaMateria = listaTareas.filter(
          (t: any) => t.materia.toLowerCase().trim() === materia.nombre.toLowerCase().trim()
        );

        const total = tareasDeEstaMateria.length;
        const hechas = tareasDeEstaMateria.filter((t: any) => t.completada).length;

        // Si no hay tareas en la agenda, el progreso es 0
        const nuevoPorcentaje = total > 0 ? Math.round((hechas / total) * 100) : 0;

        return { 
          ...materia, 
          progreso: nuevoPorcentaje, 
          tareasTotales: total, 
          tareasHechas: hechas 
        };
      });

      setProyectos(materiasActualizadas);
      // Guardamos el cálculo para que persista
      await AsyncStorage.setItem('lista_proyectos', JSON.stringify(materiasActualizadas));
    } catch (e) {
      console.error("Error calculando progreso:", e);
    }
  };

  // Refrescar cada vez que el usuario entra a la pantalla
  useFocusEffect(
    useCallback(() => {
      calcularProgresoDesdeCalendario();
    }, [])
  );

  const agregarProyecto = async () => {
    if (!nuevoNombre.trim()) return Alert.alert("Aviso", "Escribe el nombre");
    const nuevo = { id: Date.now().toString(), nombre: nuevoNombre, progreso: 0 };
    const nuevaLista = [...proyectos, nuevo];
    await AsyncStorage.setItem('lista_proyectos', JSON.stringify(nuevaLista));
    setNuevoNombre('');
    setModalVisible(false);
    calcularProgresoDesdeCalendario();
  };

  const borrarProyecto = async (id: string) => {
    Alert.alert("Eliminar", "¿Borrar esta materia?", [
      { text: "No" },
      { text: "Sí", onPress: async () => {
          const filtrados = proyectos.filter(p => p.id !== id);
          await AsyncStorage.setItem('lista_proyectos', JSON.stringify(filtrados));
          setProyectos(filtrados);
      }}
    ]);
  };

  const filtrados = proyectos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#2f6bb2" />
          <TextInput style={styles.inputBusqueda} placeholder="Buscar materia..." value={busqueda} onChangeText={setBusqueda} />
        </View>
        <TouchableOpacity style={styles.btnMas} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Basado en {proyectos.length} materias activas</Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        {filtrados.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardInfo}>
              <View>
                <Text style={styles.cardTitle}>{p.nombre}</Text>
                <Text style={styles.progresoTxt}>
                   {p.tareasHechas || 0} de {p.tareasTotales || 0} tareas en agenda
                </Text>
              </View>
              <TouchableOpacity onPress={() => borrarProyecto(p.id)}>
                <Ionicons name="trash-outline" size={22} color="#ff4444" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.barritaBg}>
              <View style={[styles.barritaFill, { width: `${p.progreso}%` }]} />
            </View>
            <Text style={styles.percentTxt}>{p.progreso}% completado</Text>
          </View>
        ))}
      </ScrollView>

      {/* MODAL AGREGAR */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nueva Materia</Text>
            <TextInput style={styles.modalInput} placeholder="Nombre de la materia" value={nuevoNombre} onChangeText={setNuevoNombre} />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnGuardar} onPress={agregarProyecto}><Text style={{color:'white'}}>Guardar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f4f8', borderRadius: 20, paddingLeft: 15 },
  inputBusqueda: { flex: 1, padding: 10 },
  btnMas: { backgroundColor: '#2f6bb2', width: 45, height: 45, borderRadius: 25, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  hint: { textAlign: 'center', color: '#2f6bb2', fontSize: 12, fontWeight: '600' },
  scroll: { padding: 20 },
  card: { backgroundColor: '#cfe2f3', padding: 20, borderRadius: 25, marginBottom: 15 },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2f6bb2' },
  progresoTxt: { fontSize: 12, color: '#555' },
  barritaBg: { height: 10, backgroundColor: '#fff', borderRadius: 5, marginTop: 15 },
  barritaFill: { height: 10, backgroundColor: '#2f6bb2', borderRadius: 5 },
  percentTxt: { textAlign: 'right', fontSize: 12, fontWeight: 'bold', color: '#2f6bb2', marginTop: 5 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', width: '80%', padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInput: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 20, padding: 8 },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnGuardar: { backgroundColor: '#2f6bb2', padding: 10, borderRadius: 10 }
});