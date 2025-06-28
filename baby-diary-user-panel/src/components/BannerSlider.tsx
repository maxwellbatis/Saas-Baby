import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_CONFIG } from '../config/api';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  bgGradient?: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  targetUrl?: string;
  targetType?: string;
  targetId?: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

interface BannerSliderProps {
  location?: 'dashboard' | 'loja' | 'ambos';
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ location = 'dashboard' }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Buscar banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/public/banners?location=${location}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Filtrar banners ativos e com período válido
          const now = new Date();
          const activeBanners = data.data.filter((banner: Banner) => {
            if (!banner.isActive) return false;
            
            // Verificar período se definido
            if (banner.startDate && new Date(banner.startDate) > now) return false;
            if (banner.endDate && new Date(banner.endDate) < now) return false;
            
            return true;
          });
          
          setBanners(activeBanners);
        } else {
          setBanners([]);
        }
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error('Erro ao buscar banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate dos banners
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000); // Trocar a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // Buscar banners na inicialização
  useEffect(() => {
    fetchBanners();
  }, [location]);

  // Navegação manual
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToBanner = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Carregando banners...</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Não exibir nada se não há banners
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="w-full mb-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className={`relative overflow-hidden ${currentBanner.bgGradient || 'bg-gradient-to-r from-pink-400 to-purple-500'}`}>
            {/* Overlay escuro para melhor legibilidade do texto */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            
            {/* Conteúdo do banner */}
            <div className="relative p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {currentBanner.badge && (
                    <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-white/30">
                      {currentBanner.badge}
                    </Badge>
                  )}
                  <h3 className="text-xl font-bold mb-2">{currentBanner.title}</h3>
                  {currentBanner.subtitle && (
                    <p className="text-lg mb-2 opacity-90">{currentBanner.subtitle}</p>
                  )}
                  <p className="text-sm mb-4 opacity-90 line-clamp-2">{currentBanner.description}</p>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      if (currentBanner.ctaLink) {
                        window.location.href = currentBanner.ctaLink;
                      }
                    }}
                  >
                    {currentBanner.ctaText || 'Ver Mais'}
                  </Button>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <img
                    src={currentBanner.imageUrl}
                    alt={currentBanner.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Controles de navegação */}
            {banners.length > 1 && (
              <>
                {/* Botões de navegação */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToBanner(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 