import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2f6bb2',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 },
      }}
    >
      {/* POSICIÓN 1 (Izquierda) */}
      <Tabs.Screen name="inicio" options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
      }} />

      {/* POSICIÓN 2 */}
      <Tabs.Screen name="calendar" options={{
          title: 'Calendario',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
      }} />

      {/* POSICIÓN 3 */}
      <Tabs.Screen name="projects" options={{
          title: 'Proyectos',
          tabBarIcon: ({ color }) => <Ionicons name="folder-open" size={24} color={color} />,
      }} />

      {/* POSICIÓN 4 (Derecha) */}
      <Tabs.Screen name="profile" options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={24} color={color} />,
      }} />

      {/* OCULTOS (Deben ir al final) */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="regisScreen" options={{ href: null }} />
    </Tabs>
  );
}