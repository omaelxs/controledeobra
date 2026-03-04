/**
 * Serviço para upload de fotos de vistoria
 * Firebase Storage integration
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { ChecklistItemPhoto } from "@/types/vistoria";
import { validateFileUpload, generateUniqueFilename } from "@/lib/file-validation";

/**
 * Upload de foto para um item de checklist
 */
export async function uploadChecklistPhoto(
  file: File,
  obraId: string,
  apartamentoId: string,
  itemId: string
): Promise<ChecklistItemPhoto> {
  // Validar arquivo
  const buffer = await file.arrayBuffer();
  const validation = validateFileUpload(
    Buffer.from(buffer),
    file.type,
    { filename: file.name }
  );

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Gerar nome único
  const uniqueName = generateUniqueFilename(file.name);
  const path = `vistorias/${obraId}/${apartamentoId}/${itemId}/${uniqueName}`;

  // Upload
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, {
    customMetadata: {
      obraId,
      apartamentoId,
      itemId,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Obter URL pública
  const url = await getDownloadURL(storageRef);

  return {
    id: uniqueName,
    url,
    uploadedAt: new Date().toISOString(),
    size: file.size,
  };
}

/**
 * Deletar foto
 */
export async function deleteChecklistPhoto(
  obraId: string,
  apartamentoId: string,
  itemId: string,
  photoId: string
): Promise<void> {
  const path = `vistorias/${obraId}/${apartamentoId}/${itemId}/${photoId}`;
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
