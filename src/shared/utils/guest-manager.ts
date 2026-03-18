export const GUEST_ID_KEY = "gestcom_guest_id";

export const guestManager = {
  // Obtiene el ID actual o genera uno nuevo si no existe
  getOrCreateGuestId: (): string => {
    if (typeof window === "undefined") return ""; // Evitar error en servidor (SSR)

    let guestId = localStorage.getItem(GUEST_ID_KEY);
    
    if (!guestId) {
      // Generamos un UUID v4 simple (random)
      guestId = crypto.randomUUID(); 
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    
    return guestId;
  },

  // Borra el ID (útil si el usuario se registra y queremos limpiar)
  clearGuestId: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(GUEST_ID_KEY);
    }
  }
};