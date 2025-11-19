import { useEffect } from 'react';

/**
 * Hook para escuchar cambios en el perfil del tutor
 * Ideal para sincronizar datos en tiempo real entre perfil de tutor y vista de estudiante
 * @param {Function} callback - Función a ejecutar cuando se actualice el perfil
 */
export function useTutorProfileSync(callback) {
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedData = event.detail;
      if (callback) {
        callback(updatedData);
      }
    };

    // Escuchar evento personalizado de actualización de perfil
    window.addEventListener('tutorProfileUpdated', handleProfileUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('tutorProfileUpdated', handleProfileUpdate);
    };
  }, [callback]);
}
