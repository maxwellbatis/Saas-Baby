import * as admin from 'firebase-admin';

// Verificar se as credenciais do Firebase estão configuradas
const hasFirebaseConfig = process.env.FIREBASE_PROJECT_ID && 
                         process.env.FIREBASE_PRIVATE_KEY && 
                         process.env.FIREBASE_CLIENT_EMAIL;

// Configuração do Firebase Admin SDK
const serviceAccount = {
  type: process.env.FIREBASE_TYPE || 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID || '',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
  client_id: process.env.FIREBASE_CLIENT_ID || '',
  auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
  token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || ''
};

// Inicializar Firebase Admin SDK apenas se houver configuração completa
if (!admin.apps.length && hasFirebaseConfig) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('✅ Firebase Admin SDK inicializado com sucesso');
  } catch (error) {
    console.warn('⚠️ Erro ao inicializar Firebase Admin SDK:', error);
  }
} else if (!hasFirebaseConfig) {
  console.log('ℹ️ Firebase Admin SDK não configurado - notificações push desabilitadas');
}

// Exportar messaging apenas se o Firebase estiver inicializado
export const messaging = admin.apps.length > 0 ? admin.messaging() : null;
export default admin; 