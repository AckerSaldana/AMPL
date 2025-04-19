import { supabase } from '../supabase/supabaseClient';

const uploadEvidenceToSupabase = async (file) => {
  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('No se pudo obtener el usuario autenticado.');
  }

  const filePath = `evidences/${user.id}/${Date.now()}_${file.name}`;

  // 1. Subir el PDF al bucket
  const { error: uploadError } = await supabase.storage
    .from('evidences')
    .upload(filePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Error al subir el archivo: ${uploadError.message}`);
  }

  // 2. Obtener la URL pública del archivo
  const { data: publicUrlData, error: urlError } = supabase.storage
    .from('evidences')
    .getPublicUrl(filePath);

  if (urlError || !publicUrlData?.publicUrl) {
    throw new Error('No se pudo obtener la URL pública del archivo.');
  }

  return publicUrlData.publicUrl;
};

export default uploadEvidenceToSupabase;
