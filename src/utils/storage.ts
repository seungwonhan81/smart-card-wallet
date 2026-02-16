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