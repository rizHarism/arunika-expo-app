export async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("bukuTamuDB", 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("guests")) {
        db.createObjectStore("guests", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
