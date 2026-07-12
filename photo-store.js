(function () {
  const DB_NAME = "plantoguide";
  const DB_VERSION = 1;
  const STORE_NAME = "photos";

  window.photoStoreAvailable = typeof indexedDB !== "undefined";
  let openPromise = null;

  function markUnavailable() {
    window.photoStoreAvailable = false;
    return null;
  }

  function photoStoreOpen() {
    if (!window.photoStoreAvailable) return Promise.resolve(null);
    if (openPromise) return openPromise;
    openPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
            store.createIndex("tripKey", "tripKey", { unique: false });
          }
        };
        request.onsuccess = () => {
          window.photoStoreAvailable = true;
          resolve(request.result);
        };
        request.onerror = () => resolve(markUnavailable());
        request.onblocked = () => resolve(markUnavailable());
      } catch (_) {
        resolve(markUnavailable());
      }
    });
    return openPromise;
  }

  async function withStore(mode, action, fallback) {
    try {
      const db = await photoStoreOpen();
      if (!db) return fallback;
      return await new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = action(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(fallback);
        transaction.onerror = () => resolve(fallback);
      });
    } catch (_) {
      markUnavailable();
      return fallback;
    }
  }

  async function photoStorePut(record) {
    if (!record || !record.id || !record.tripKey || !record.src) return null;
    return withStore("readwrite", (store) => store.put(record), null);
  }

  async function photoStoreGetAll(tripKey) {
    if (!tripKey) return [];
    try {
      const db = await photoStoreOpen();
      if (!db) return [];
      return await new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index("tripKey");
        const request = index.getAll(tripKey);
        request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
        request.onerror = () => resolve([]);
        transaction.onerror = () => resolve([]);
      });
    } catch (_) {
      markUnavailable();
      return [];
    }
  }

  async function photoStoreDelete(id) {
    if (!id) return null;
    return withStore("readwrite", (store) => store.delete(id), null);
  }

  async function photoStoreDeleteTrip(tripKey) {
    if (!tripKey) return null;
    try {
      const db = await photoStoreOpen();
      if (!db) return null;
      return await new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index("tripKey");
        const request = index.openCursor(IDBKeyRange.only(tripKey));
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(null);
      });
    } catch (_) {
      markUnavailable();
      return null;
    }
  }

  window.photoStoreOpen = photoStoreOpen;
  window.photoStorePut = photoStorePut;
  window.photoStoreGetAll = photoStoreGetAll;
  window.photoStoreDelete = photoStoreDelete;
  window.photoStoreDeleteTrip = photoStoreDeleteTrip;
})();
