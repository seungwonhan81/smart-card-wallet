import { BusinessCardData } from '../types';

const DB_NAME = 'SmartCardWalletDB';
const DB_VERSION = 1;
const STORE_NAME = 'cards';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const dbGetCards = async (): Promise<BusinessCardData[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Migrate old 'phone' field to 'mobile'
        const cards = request.result.map((card: any) => {
          if ('phone' in card && !('mobile' in card)) {
            const { phone, ...rest } = card;
            return { ...rest, mobile: phone, tel: '' };
          }
          return { ...card, mobile: card.mobile || '', tel: card.tel || '' };
        });
        resolve(cards);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('DB Load Error:', error);
    return [];
  }
};

export const dbSaveCard = async (card: BusinessCardData): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(card); // put handles both insert and update

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const dbDeleteCard = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const requestPersistentStorage = async (): Promise<boolean> => {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const granted = await navigator.storage.persist();
    return granted;
  }
  return false;
};

export const exportCardsToJSON = async (): Promise<void> => {
  const cards = await dbGetCards();
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smart-card-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importCardsFromJSON = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const cards: BusinessCardData[] = JSON.parse(e.target?.result as string);
        if (!Array.isArray(cards)) throw new Error('올바르지 않은 파일 형식');
        for (const card of cards) {
          await dbSaveCard(card);
        }
        resolve(cards.length);
      } catch {
        reject(new Error('백업 파일 형식이 올바르지 않습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsText(file);
  });
};