import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Route } from 'react-router-dom'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

createRoot(document.getElementById("root")!).render(<App />);
