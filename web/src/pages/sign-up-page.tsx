import { Navigate } from 'react-router-dom'

// Регистрация теперь происходит автоматически при первом входе через email-код или OAuth.
export const SignUpPage = () => <Navigate to="/sign-in" replace />
