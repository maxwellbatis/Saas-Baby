import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { messaging } from "@/firebase";
import { getToken } from "firebase/messaging";
import { API_CONFIG } from '../config/api';

const VAPID_KEY = "BJQCG3gllMVXza6KvglLt0X8rmryVH1XLQzDHM8w1bTllJLP3RHa5C6VEMNlmA7DR0m-qgYa-dRBpRaeeRjhcNg";

async function registerPushToken() {
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('[Push] Token gerado:', token);
    if (token) {
      const userToken = localStorage.getItem('token'); // ou ajuste conforme seu contexto de auth
      const body = { token, platform: "web", deviceInfo: {} };
      console.log('[Push] Corpo da requisição:', body);
      // ATENÇÃO: Em produção, tornar esta URL dinâmica!
      const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/register-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      console.log('[Push] Resposta do backend:', response.status, data);
    }
  } catch (err) {
    console.error("[Push] Erro ao registrar token de push:", err);
  }
}

export function NotificationBanner() {
  const [show, setShow] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      // Só mostra se não fechou antes
      if (localStorage.getItem("notificationBannerClosed") === "true") return;
      if (Notification.permission === "default") setShow(true);
      if (Notification.permission === "denied") {
        setShow(true);
        setDenied(true);
      }
    }
  }, []);

  const handleEnable = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setShow(false);
        localStorage.setItem("notificationBannerClosed", "true");
        alert("Notificações ativadas! Você receberá lembretes importantes.");
        await registerPushToken(); // Chama o registro do token
      } else if (permission === "denied") {
        setDenied(true);
      }
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("notificationBannerClosed", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-blue-50 border-t border-blue-200 p-4 flex flex-col md:flex-row items-center justify-between shadow-lg animate-fade-in">
      <div className="flex-1 text-center md:text-left">
        <b>Ative as notificações!</b> Receba lembretes de vacinas, dicas e novidades do Baby Diary.
        {denied && (
          <div className="text-red-600 text-sm mt-2">
            Você recusou as notificações. Para ativar, acesse as configurações do seu navegador e permita notificações para este site.
          </div>
        )}
      </div>
      {!denied && (
        <Button className="mt-2 md:mt-0 md:ml-4" onClick={handleEnable}>
          Ativar notificações
        </Button>
      )}
      <Button variant="ghost" className="ml-2" onClick={handleClose}>
        Fechar
      </Button>
    </div>
  );
} 