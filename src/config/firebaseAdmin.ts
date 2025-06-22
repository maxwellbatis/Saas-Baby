import * as admin from 'firebase-admin';
import path from 'path';

// Verifique se o Firebase Admin SDK já foi inicializado
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(__dirname, 'baby-diary-firebase-adminsdk.json');
  // ATENÇÃO: Renomeie 'baby-diary-firebase-adminsdk.json' para o nome exato do seu arquivo JSON
  // E certifique-se de que este arquivo NÃO seja versionado (adicione-o ao .gitignore)

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export const firebaseAdmin = admin; 