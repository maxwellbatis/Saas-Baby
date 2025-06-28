import React, { useRef, useState } from 'react';
import { adminMarketing } from '../../../lib/adminApi';

interface ImageGalleryUploadProps {
  value: string[];
  onChange: (gallery: string[]) => void;
}

const ImageGalleryUpload: React.FC<ImageGalleryUploadProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        
        console.log('📤 Enviando arquivo:', files[i].name, files[i].size, files[i].type);
        
        // Chama o endpoint de upload (ajuste se necessário)
        const res = await adminMarketing.uploadMedia(formData);
        console.log('📥 Resposta do upload:', res);
        
        let imageUrl = '';
        if (res.success && res.data && res.data.url) {
          imageUrl = res.data.url;
        } else if (res.url) {
          imageUrl = res.url;
        } else if (res.data && res.data.secureUrl) {
          imageUrl = res.data.secureUrl;
        }
        
        console.log('🖼️ URL da imagem:', imageUrl);
        
        if (imageUrl) {
          urls.push(imageUrl);
        } else {
          console.error('❌ Não foi possível obter a URL da imagem da resposta:', res);
          setError('Erro ao obter URL da imagem após upload');
          return;
        }
      }
      
      console.log('📋 URLs finais:', urls);
      onChange([...value, ...urls]);
    } catch (err: any) {
      console.error('💥 Erro no upload:', err);
      setError('Erro ao fazer upload. Tente novamente.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (idx: number) => {
    const newGallery = value.filter((_, i) => i !== idx);
    onChange(newGallery);
  };

  return (
    <div className="border p-4 rounded bg-gray-50">
      <div className="flex gap-2 flex-wrap mb-2">
        {value.map((url, idx) => (
          <div key={idx} className="w-20 h-20 bg-gray-200 rounded overflow-hidden relative group">
            <img 
              src={url} 
              alt="img" 
              className="object-cover w-full h-full"
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem:', url);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('✅ Imagem carregada com sucesso:', url);
              }}
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-xs text-red-600 group-hover:opacity-100 opacity-0 transition"
              title="Remover"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
        className="mb-2"
        disabled={uploading}
      />
      {uploading && <div className="text-blue-600 text-sm">Enviando imagens...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      {/* Debug info */}
      <div className="mt-2 text-xs text-gray-500">
        <div>URLs atuais: {value.length}</div>
        {value.map((url, idx) => (
          <div key={idx} className="truncate">{url}</div>
        ))}
      </div>
    </div>
  );
};

export default ImageGalleryUpload; 