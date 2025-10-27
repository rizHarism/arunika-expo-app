import { openDB } from "./db.js";
import { syncData } from "./sync.js";

document.addEventListener("DOMContentLoaded", async () => {
  const db = await openDB();
  const tx = db.transaction("guests", "readonly");
  const store = tx.objectStore("guests");

  const req = store.getAll();
  req.onsuccess = () => {
    const tbody = document.getElementById("guestTableBody");
    req.result.forEach((tamu, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class='p-4 border border-gray-300 text-center'>${i + 1}</td>
        <td class='p-4 border border-gray-300 '>${tamu.nama}</td>
        <td class='p-4 border border-gray-300 '>${tamu.gender}</td>
        <td class='p-4 border border-gray-300 '>${tamu.pekerjaan}</td>
        <td class='p-4 border border-gray-300 '>${tamu.alamat}</td>
        <td class='p-4 border border-gray-300 '>${tamu.phone}</td>
        <td class='p-4 border border-gray-300 '>${tamu.email}</td>
        <td class='p-4 border border-gray-300 text-center'>${
          tamu.synced ? "✅" : "⏳"
        }</td>
      `;
      tbody.appendChild(row);
    });
  };

  document.getElementById("syncBtn")?.addEventListener("click", syncData);
});
