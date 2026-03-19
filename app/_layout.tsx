import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Theme } from '@/constants/theme';
import { initDatabase } from '@/lib/database';
import { seedExercises } from '@/lib/exercises';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const LiftLogTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Theme.accent,
    background: Theme.background,
    card: Theme.background,
    text: Theme.text,
    border: Theme.divider,
    notification: Theme.danger,
  },
};

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    try {
      initDatabase();
      seedExercises();
      setDbReady(true);
    } catch (e) {
      console.error('Failed to initialize database:', e);
    }
  }, []);

  if (!dbReady) {
    return null;
  }

  return (
    <ThemeProvider value={LiftLogTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Theme.background },
          headerTintColor: Theme.text,
          contentStyle: { backgroundColor: Theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="workout/[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
