import { openDB } from "./db.js";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxW8F2g1LcuNze4ycDqe7MF-eYXTDcFx9XI0uXXbMbxAh1ewrCMjkAE179l_vuXoes/exec";

export async function syncData() {
  if (!navigator.onLine) {
    console.log("Offline — sync ditunda");
    return;
  }

  const db = await openDB();
  const tx = db.transaction("guests", "readonly");
  const store = tx.objectStore("guests");
  const request = await store.getAll();

  async function getUnsyncedData(store) {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result;
        const unsynced = all.filter((item) => !item.synced);
        resolve(unsynced);
      };
      req.onerror = reject;
    });
  }

  // pemakaian:
  const unsynced = await getUnsyncedData(store);
  console.log("Data belum tersinkron:", unsynced);

  for (const guest of unsynced) {
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guest),
      });

      const result = await res.json();

      if (result.success) {
        console.log(`✅ Data ${guest.nama} tersinkron`);
        await markAsSynced(db, guest.id);
      } else {
        console.warn(`⚠️ Gagal sync ${guest.nama}:`, result.error);
      }
    } catch (err) {
      console.error("❌ Gagal koneksi ke server:", err);
      break; // stop loop agar tidak spam
    }
  }
}

async function markAsSynced(db, id) {
  const tx = db.transaction("guests", "readwrite");
  const store = tx.objectStore("guests");
  const record = await store.get(id);
  if (record) {
    record.synced = true;
    await store.put(record);
  }
}
