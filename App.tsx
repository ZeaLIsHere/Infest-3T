/**
 * Akar aplikasi Pijar 3T.
 * Navigasi stack + tema dark default (PRD §9).
 */
import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {initDatabase} from './src/db';
import {colors} from './src/lib/theme';
import ChatScreen from './src/screens/ChatScreen';
import HomeScreen from './src/screens/HomeScreen';
import MaterialsScreen from './src/screens/MaterialsScreen';
import ProgressScreen from './src/screens/ProgressScreen';

export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  Materials: undefined;
  Progress: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const darkTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.error,
  },
};

function App() {
  useEffect(() => {
    initDatabase().catch(() => {
      // DB belum tersedia saat pertama dibuka: inisialisasi berikutnya akan mencoba lagi.
    });
  }, []);

  return (
    <NavigationContainer theme={darkTheme}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.surface},
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {fontWeight: '600'},
          contentStyle: {backgroundColor: colors.background},
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Beranda'}}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{title: 'Tanya AI'}}
        />
        <Stack.Screen
          name="Materials"
          component={MaterialsScreen}
          options={{title: 'Materi'}}
        />
        <Stack.Screen
          name="Progress"
          component={ProgressScreen}
          options={{title: 'Progres'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
