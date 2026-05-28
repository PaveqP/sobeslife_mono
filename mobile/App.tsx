import 'react-native-gesture-handler'
import * as WebBrowser from 'expo-web-browser'
import { Provider } from 'react-redux'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppNavigation } from './src/app/navigation'
import { store } from './src/app/store'
import { ThemeProvider } from './src/shared/theme/theme-provider'

WebBrowser.maybeCompleteAuthSession()

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <SafeAreaProvider>
            <AppNavigation />
          </SafeAreaProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}
