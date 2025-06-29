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

// Função para upload de arquivo para o Firebase Storage
export const uploadToFirebaseStorage = async (
  buffer: Buffer,
  destinationPath: string,
  mimetype: string
): Promise<string> => {
  try {
    console.log('🔥 Iniciando upload para Firebase Storage...');
    console.log('📂 Caminho:', destinationPath);
    console.log('📄 Mimetype:', mimetype);
    console.log('📏 Tamanho do buffer:', buffer.length);
    
    if (!admin.apps.length) {
      console.log('⚠️ Firebase não inicializado, usando fallback local...');
      
      // Fallback: salvar localmente
      const fs = require('fs');
      const path = require('path');
      
      // Criar pasta uploads se não existir
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Salvar arquivo localmente
      const localPath = path.join(uploadsDir, path.basename(destinationPath));
      fs.writeFileSync(localPath, buffer);
      
      console.log('✅ Arquivo salvo localmente:', localPath);
      
      // Retornar URL simulada
      const publicUrl = `http://localhost:3000/uploads/${path.basename(destinationPath)}`;
      console.log('🔗 URL simulada gerada:', publicUrl);
      
      return publicUrl;
    }
    
    console.log('✅ Firebase inicializado, obtendo bucket...');
    const bucket = admin.storage().bucket();
    console.log('📦 Bucket obtido:', bucket.name);
    
    const file = bucket.file(destinationPath);
    console.log('📁 Arquivo criado no bucket');
    
    console.log('⬆️ Salvando arquivo...');
    await file.save(buffer, {
      metadata: { contentType: mimetype },
      public: true,
      resumable: false,
    });
    console.log('✅ Arquivo salvo');
    
    console.log('🌐 Tornando arquivo público...');
    await file.makePublic();
    console.log('✅ Arquivo tornado público');
    
    const publicUrl = file.publicUrl();
    console.log('🔗 URL pública gerada:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('💥 Erro no upload para Firebase Storage:', error);
    throw error;
  }
}; 