import { createApp } from 'vue'
import App from './App.vue'

// Bootstrap CSS (no JavaScript needed)
import 'bootstrap/dist/css/bootstrap.min.css'

// Custom styles
import '@/assets/styles/main.scss'

const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('=== VUE ERROR ===')
  console.error('Error:', err)
  console.error('Info:', info)
  console.error('Component:', instance)
  console.error('=================')
}

// Global warning handler
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('=== VUE WARNING ===')
  console.warn('Message:', msg)
  console.warn('Trace:', trace)
  console.warn('===================')
}

app.mount('#app')

// Log initialization
console.log('=== APP INITIALIZED ===')
console.log('Environment:', import.meta.env.MODE)
console.log('Mock mode:', import.meta.env.VITE_JMRI_MOCK_ENABLED)
