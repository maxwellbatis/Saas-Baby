import { messaging, getToken } from '../firebase'; // Import from your firebase.ts
import { registerDeviceToken } from './api'; // Assuming you have this function in your api lib

export const requestNotificationPermission = async () => {
  console.log('Requesting notification permission...');
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const vapidKey = 'BJQCG3gllMVXza6KvglLt0X8rmryVH1XLQzDHM8w1bTllJLP3RHa5C6VEMNlmA7DR0m-qgYa-dRBpRaeeRjhcNg';
      
      const currentToken = await getToken(messaging, { vapidKey: vapidKey });
      
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // Send the token to your server
        await registerDeviceToken({
          token: currentToken,
          platform: 'web',
        });
        console.log('FCM Token registered with backend.');
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
}; 