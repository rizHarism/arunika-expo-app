import { openDB } from "./db.js";

export async function syncData() {
  const db = await openDB();
  const tx = db.transaction("guests", "readonly");
  const store = tx.objectStore("guests");
  const all = await store.getAll();

  all.onsuccess = async () => {
    const unsynced = all.result.filter((d) => !d.synced);
    for (const data of unsynced) {
      try {
        await fetch("https://script.google.com/macros/s/YOUR_ID/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        markAsSynced(db, data.id);
      } catch (e) {
        console.error("Gagal sync:", e);
      }
    }
  };
}

function markAsSynced(db, id) {
  const tx = db.transaction("guests", "readwrite");
  const store = tx.objectStore("guests");
  const req = store.get(id);
  req.onsuccess = () => {
    const item = req.result;
    item.synced = true;
    store.put(item);
  };
}
