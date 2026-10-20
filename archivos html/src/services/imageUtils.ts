/**
 * Utilidades para procesamiento, validación y optimización de fotografías
 * Permite almacenar imágenes optimizadas en el navegador y preparar la subida a Firebase Storage.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  fileName: string;
  mimeType: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_RAW_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function processAndOptimizeImage(file: File): Promise<ProcessedImageResult> {
  // 1. Validar tipo de archivo
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
  const isExtValid = ALLOWED_EXTENSIONS.includes(fileExt);

  if (!isMimeValid && !isExtValid) {
    throw new Error(
      `Formato de imagen no compatible ("${file.name}"). Por favor selecciona una fotografía en formato JPG, JPEG, PNG o WEBP.`
    );
  }

  // 2. Validar tamaño máximo
  if (file.size > MAX_RAW_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `La fotografía es demasiado pesada (${sizeMb} MB). El tamaño máximo permitido es de 10 MB.`
    );
  }

  // 3. Cargar en FileReader
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen desde tu dispositivo.'));
    reader.readAsDataURL(file);
  });

  // 4. Cargar en elemento Image para redimensionar y optimizar de forma respetuosa
  return new Promise<ProcessedImageResult>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxDimension = 1000; // Máximo 1000px de ancho o alto para retrato memorial
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback a imagen sin redimensionar
          return resolve({
            dataUrl: rawDataUrl,
            width: img.width,
            height: img.height,
            fileSizeBytes: file.size,
            fileName: file.name,
            mimeType: file.type || 'image/jpeg',
          });
        }

        // Suavizado de imagen de alta fidelidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG con calidad 0.85 para tamaño liviano (~150KB)
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Estimar bytes resultantes de la cadena base64
        const stringLength = optimizedDataUrl.length - 'data:image/jpeg;base64,'.length;
        const estimatedBytes = Math.round((stringLength * 3) / 4);

        resolve({
          dataUrl: optimizedDataUrl,
          width,
          height,
          fileSizeBytes: estimatedBytes,
          fileName: file.name,
          mimeType: 'image/jpeg',
        });
      } catch (err: any) {
        // En caso de fallo en canvas, devolver dataUrl original
        resolve({
          dataUrl: rawDataUrl,
          width: img.width,
          height: img.height,
          fileSizeBytes: file.size,
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
        });
      }
    };

    img.onerror = () => {
      reject(new Error('El archivo seleccionado no es una imagen válida o está dañado.'));
    };

    img.src = rawDataUrl;
  });
}
