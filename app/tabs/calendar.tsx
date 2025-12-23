import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import * as Notifications from 'expo-notifications'; // <--- Importado
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Usamos "any" para que TypeScript no bloquee la ejecución por tipos inexistentes
const handler: any = {
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
};

Notifications.setNotificationHandler(handler);

interface Tarea {
  id: number;
  nombre: string;
  materia: string;
  hora: string;
  completada: boolean;
  dia: number;
  notifIds?: string[]; // <--- Guardaremos los IDs aquí para poder cancelarlos
}

export default function CalendarScreen() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date().getDate());
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [nombreTarea, setNombreTarea] = useState('');
  const [materiaTarea, setMateriaTarea] = useState('');
  const [horaTarea, setHoraTarea] = useState('');

  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const fechaActual = new Date();
  const mesActual = meses[fechaActual.getMonth()];

  useEffect(() => {
    solicitarPermisos();
    cargarTareas();
  }, []);

  // Función para pedir permisos al usuario
  const solicitarPermisos = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permisos", "Activa las notificaciones para recibir recordatorios.");
    }
  };

  const cargarTareas = async () => {
    const guardadas = await AsyncStorage.getItem('eventos_calendario');
    if (guardadas) setTareas(JSON.parse(guardadas));
  };

  const guardarTareas = async (nuevasTareas: Tarea[]) => {
    setTareas(nuevasTareas);
    await AsyncStorage.setItem('eventos_calendario', JSON.stringify(nuevasTareas));
  };

const programarNotificaciones = async (nombre: string, materia: string, dia: number) => {
    const ids: string[] = [];
    const hoy = new Date();
    
    // Calculamos el día anterior
    const fechaAviso = new Date(hoy.getFullYear(), hoy.getMonth(), dia - 1);
    
    const horas = [9, 19]; // 9 AM y 7 PM

    for (const h of horas) {
      const fechaTrigger = new Date(fechaAviso);
      fechaTrigger.setHours(h, 0, 0, 0);

      // IMPORTANTE: Solo programar si la fecha es futura
      if (fechaTrigger > hoy) {
        try {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `🔔 Tarea pendiente: ${materia}`,
              body: `Mañana vence: ${nombre}`,
              sound: true,
            },
            // CORRECCIÓN AQUÍ: Se pasa como objeto con propiedad 'date'
            trigger: {
              date: fechaTrigger,
            } as any, 
          });
          ids.push(id);
        } catch (error) {
          console.warn("Error programando notificación:", error);
        }
      }
    }
    return ids;
  }
  const agregarTarea = async () => {
    if (!nombreTarea || !horaTarea || !materiaTarea) {
      Alert.alert("Error", "Llena todos los campos, incluyendo la materia");
      return;
    }

    // Programamos los avisos antes de guardar
    const notifIds = await programarNotificaciones(nombreTarea, materiaTarea, diaSeleccionado);

    const nueva: Tarea = {
      id: Date.now(),
      nombre: nombreTarea,
      materia: materiaTarea,
      hora: horaTarea,
      completada: false,
      dia: diaSeleccionado,
      notifIds: notifIds // Guardamos los IDs
    };
    
    const listaActualizada = [...tareas, nueva];
    guardarTareas(listaActualizada);

    setNombreTarea('');
    setMateriaTarea('');
    setHoraTarea('');
    setModalVisible(false);
  };

  const toggleTarea = async (id: number) => {
    const listaActualizada = await Promise.all(tareas.map(async (t) => {
      if (t.id === id) {
        const nuevoEstado = !t.completada;
        
        // 3. SI SE MARCA COMO HECHO, CANCELAMOS SUS NOTIFICACIONES
        if (nuevoEstado && t.notifIds) {
          for (const nId of t.notifIds) {
            await Notifications.cancelScheduledNotificationAsync(nId).catch(() => {});
          }
        }
        return { ...t, completada: nuevoEstado };
      }
      return t;
    }));
    guardarTareas(listaActualizada);
  };

  const obtenerColorDia = (numDia: number) => {
    const tareasDia = tareas.filter(t => t.dia === numDia);
    if (tareasDia.length === 0) return '#cfe2f3';
    const todasListas = tareasDia.every(t => t.completada);
    return todasListas ? '#4CAF50' : '#F44336';
  };

  const tareasDelDia = tareas.filter(t => t.dia === diaSeleccionado);

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>TaskFlow</Text>
      <Text style={styles.monthTitle}>{mesActual} {fechaActual.getFullYear()}</Text>

      <View style={styles.calendarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => {
            const colorFondo = obtenerColorDia(num);
            return (
              <TouchableOpacity
                key={num}
                onPress={() => setDiaSeleccionado(num)}
                style={[
                  styles.dayCard, 
                  { backgroundColor: colorFondo },
                  diaSeleccionado === num && styles.selectedDayCard
                ]}
              >
                <Text style={[styles.dayNum, (diaSeleccionado === num || colorFondo !== '#cfe2f3') && styles.selectedText]}>
                  {num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.tasksContainer}>
        <Text style={styles.sectionTitle}>Tareas del día {diaSeleccionado}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {tareasDelDia.length === 0 ? (
            <Text style={styles.emptyText}>No hay tareas para hoy.</Text>
          ) : (
            tareasDelDia.map((item) => (
              <View key={item.id} style={styles.taskCard}>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskName, item.completada && styles.textDone]}>
                    {item.nombre}
                  </Text>
                  <Text style={styles.materiaTextTag}>{item.materia}</Text>
                  <Text style={styles.taskTime}>{item.hora}</Text>
                </View>

                <View style={styles.checkboxWrapper}>
                    <Checkbox
                      style={styles.checkbox}
                      value={item.completada}
                      onValueChange={() => toggleTarea(item.id)}
                      color={item.completada ? '#4CAF50' : '#F44336'}
                    />
                    <Text style={[styles.statusMiniText, { color: item.completada ? '#4CAF50' : '#F44336' }]}>
                        {item.completada ? "¡Hecho!" : "Falta"}
                    </Text>
                </View>
              </View>
            ))
          )}
          
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ NUEVA TAREA ACADÉMICA</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Añadir Tarea</Text>
            <TextInput style={styles.input} placeholder="¿Qué tarea es?" value={nombreTarea} onChangeText={setNombreTarea} />
            <TextInput style={styles.input} placeholder="Materia (ej: Matemáticas)" value={materiaTarea} onChangeText={setMateriaTarea} />
            <TextInput style={styles.input} placeholder="Hora (ej: 09:00 AM)" value={horaTarea} onChangeText={setHoraTarea} />
            <TouchableOpacity style={styles.buttonSave} onPress={agregarTarea}>
              <Text style={styles.buttonText}>GUARDAR Y SINCRONIZAR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingTop: 50 },
  appTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  monthTitle: { fontSize: 18, textAlign: 'center', color: '#2f6bb2', marginBottom: 15 },
  calendarWrapper: { height: 80 },
  dayCard: { width: 55, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, elevation: 3 },
  selectedDayCard: { borderWidth: 3, borderColor: '#2f6bb2' },
  dayNum: { fontSize: 18, fontWeight: 'bold', color: '#2f6bb2' },
  selectedText: { color: '#fff' },
  tasksContainer: { flex: 1, backgroundColor: '#f2f2f2', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  taskCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
  taskInfo: { flex: 1 },
  taskName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  materiaTextTag: { fontSize: 12, color: '#2f6bb2', fontWeight: 'bold', marginTop: 2 },
  textDone: { textDecorationLine: 'line-through', color: '#aaa' },
  taskTime: { fontSize: 11, color: '#777', marginTop: 2 },
  checkboxWrapper: { alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  checkbox: { width: 28, height: 28, borderRadius: 8 },
  statusMiniText: { fontSize: 9, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 30 },
  addButton: { backgroundColor: '#2f6bb2', padding: 16, borderRadius: 25, marginTop: 15, marginBottom: 20 },
  addButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 30, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#cfe2f3', padding: 15, borderRadius: 20, marginBottom: 15 },
  buttonSave: { backgroundColor: '#2f6bb2', width: '100%', padding: 15, borderRadius: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  cancelText: { marginTop: 15, color: 'gray' }
});