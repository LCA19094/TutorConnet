import { useState, useEffect, useRef } from 'react';

/**
 * Hook para auto-guardado con debounce
 * @param {Function} saveFunction - Función para guardar los datos
 * @param {number} delay - Tiempo de espera en ms antes de auto-guardar
 * @returns {Object} - Estado de guardado y función para marcar como modificado
 */
export function useAutoSave(saveFunction, delay = 2000) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [saveError, setSaveError] = useState(null);
  const debounceTimer = useRef(null);
  const lastDataRef = useRef(null);

  const autoSave = async (data) => {
    // Evitar guardar si los datos no han cambiado
    if (JSON.stringify(lastDataRef.current) === JSON.stringify(data)) {
      return;
    }

    lastDataRef.current = data;

    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Establecer nuevo timer
    debounceTimer.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setSaveError(null);
        const response = await saveFunction(data);
        setLastSaved(new Date());
        
        // Emitir evento de cambio global con tutorId
        const tutorId = response?.data?.data?.id;
        window.dispatchEvent(new CustomEvent('tutorProfileUpdated', { 
          detail: {
            ...data,
            tutorId 
          }
        }));
      } catch (err) {
        setSaveError(err.message || 'Error al guardar');
        console.error('Auto-save error:', err);
      } finally {
        setIsSaving(false);
      }
    }, delay);
  };

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    saveError,
    autoSave
  };
}
