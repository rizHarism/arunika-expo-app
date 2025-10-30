import { openDB } from "./db.js";

const SCRIPT_URL = "https://simple-proxy-eosin.vercel.app/api/proxy";

/* ----------------------------------------------------
   INTERNET CHECK (Cordova + Browser fallback)
---------------------------------------------------- */
function isOnline() {
  // Cordova plugin
  if (
    typeof navigator.connection !== "undefined" &&
    navigator.connection.type
  ) {
    return navigator.connection.type !== "none";
  }

  // Browser fallback
  return navigator.onLine;
}

/* ----------------------------------------------------
   GET UNSYNCED DATA
---------------------------------------------------- */
async function getUnsynced(db) {
  const tx = db.transaction("guests", "readonly");
  const store = tx.objectStore("guests");

  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result.filter((i) => !i.synced));
    req.onerror = reject;
  });
}

/* ----------------------------------------------------
   MARK RECORD AS SYNCED
---------------------------------------------------- */
async function markAsSynced(db, id) {
  const tx = db.transaction("guests", "readwrite");
  const store = tx.objectStore("guests");

  const record = await new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });

  if (!record) return;

  record.synced = true;

  await new Promise((resolve, reject) => {
    const req = store.put(record);
    req.onsuccess = resolve;
    req.onerror = reject;
  });
}

/* ----------------------------------------------------
   SYNC FUNCTION
---------------------------------------------------- */
export async function syncData() {
  if (!isOnline()) {
    console.log("📴 Offline — sync ditunda");
    return;
  }

  const db = await openDB();
  const unsynced = await getUnsynced(db);

  if (unsynced.length === 0) {
    console.log("✅ Tidak ada data baru untuk disinkron");
    return;
  }

  console.log(`📤 Menyinkronkan ${unsynced.length} data...`);

  for (const guest of unsynced) {
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guest),
      });

      const result = await res.json();

      if (result.success) {
        console.log(`✅ Sukses sync: ${guest.nama}`);
        await markAsSynced(db, guest.id);
      } else {
        console.warn(`⚠️ Server error pada: ${guest.nama}`, result.error);
        return; // stop so we don't spam server
      }
    } catch (err) {
      console.error(`❌ Gagal sync untuk ${guest.nama}`, err);
      return; // stop if connection breaks
    }
  }

  console.log("🎉 Semua data tersinkron!");
}
