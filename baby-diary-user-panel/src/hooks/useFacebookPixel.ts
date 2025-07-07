import { useEffect } from 'react';
import { getApiUrl } from '@/config/api';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export function useFacebookPixel() {
  useEffect(() => {
    fetch(`${getApiUrl()}/admin/integrations/config?key=FACEBOOK_PIXEL_ID`)
      .then(res => res.json())
      .then(data => {
        if (data.value && !window.fbq) {
          (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
            if (f.fbq) return;
            n = f.fbq = function () {
              n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
          })(window, document, 'script',
            'https://connect.facebook.net/en_US/fbevents.js', undefined, undefined, undefined);
          window.fbq && window.fbq('init', data.value);
          window.fbq && window.fbq('track', 'PageView');
        }
      });
  }, []);
} 