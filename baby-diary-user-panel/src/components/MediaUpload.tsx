import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  Download,
  Trash2,
  File,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { adminMarketing } from '../lib/adminApi';

interface MediaUploadProps {
  onUploadSuccess: (data: {
    url: string;
    publicId: string;
    type: 'image' | 'video';
    filename: string;
    size: number;
    mimetype: string;
  }) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  accept?: string;
  maxSize?: number;
  showPreview?: boolean;
}

interface UploadedMedia {
  url: string;
  publicId: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
  mimetype: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  className = '',
  accept = 'image/*,video/*',
  maxSize = 100 * 1024 * 1024, // 100MB padrão
  showPreview = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      const errorMsg = `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validar tipo
    const allowedTypes = accept.split(',');
    const isValidType = allowedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      const errorMsg = 'Tipo de arquivo não suportado';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await adminMarketing.uploadMedia(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        const mediaData = response.data;
        setUploadedMedia(mediaData);
        onUploadSuccess(mediaData);
        
        // Limpar progresso após 1 segundo
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error(response.error || 'Erro no upload');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro no upload';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!uploadedMedia) return;

    try {
      const response = await adminMarketing.downloadMedia({
        publicId: uploadedMedia.publicId,
        filename: uploadedMedia.filename
      });

      if (response.success) {
        // Criar link de download
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = uploadedMedia.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Erro ao fazer download:', err);
    }
  };

  const handleDelete = async () => {
    if (!uploadedMedia) return;

    try {
      await adminMarketing.deleteMedia(uploadedMedia.publicId);
      setUploadedMedia(null);
    } catch (err) {
      console.error('Erro ao deletar mídia:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (mimetype.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de Upload */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Input de arquivo */}
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Área de drop */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isUploading 
                  ? 'border-blue-300 bg-blue-50' 
                  : error 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              {isUploading ? (
                <div className="space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600">Fazendo upload...</p>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ) : uploadedMedia ? (
                <div className="space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                  <p className="text-sm text-gray-600">Upload concluído!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    Clique para selecionar um arquivo ou arraste aqui
                  </p>
                  <p className="text-xs text-gray-500">
                    Tipos aceitos: {accept.replace(/\*/g, '')}
                  </p>
                </div>
              )}
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview da mídia */}
      {showPreview && uploadedMedia && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getFileIcon(uploadedMedia.mimetype)}
                  <span className="text-sm font-medium">{uploadedMedia.filename}</span>
                  <Badge variant="secondary" className="text-xs">
                    {formatFileSize(uploadedMedia.size)}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownload}
                    className="h-8"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    className="h-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>

              {/* Preview visual */}
              <div className="relative">
                {uploadedMedia.type === 'image' ? (
                  <img
                    src={uploadedMedia.url}
                    alt={uploadedMedia.filename}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={uploadedMedia.url}
                    controls
                    className="w-full h-48 object-cover rounded-lg"
                  >
                    Seu navegador não suporta vídeos.
                  </video>
                )}
              </div>

              {/* Informações adicionais */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Tipo: {uploadedMedia.mimetype}</p>
                <p>URL: {uploadedMedia.url}</p>
                <p>ID: {uploadedMedia.publicId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 