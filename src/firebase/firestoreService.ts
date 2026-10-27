import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import {
  BusProductionItem,
  QualityCheckpointItem,
  DefectItem,
  MaterialStockItem,
} from '../utils/storage';

export const FirestoreService = {
  // Production Buses
  subscribeBuses: (callback: (buses: BusProductionItem[]) => void) => {
    try {
      const q = collection(db, 'production_buses');
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: BusProductionItem[] = [];
            snapshot.forEach((doc) => {
              list.push({ ...doc.data(), id: doc.id } as BusProductionItem);
            });
            callback(list);
          }
        },
        (error) => {
          console.warn('Firestore buses subscription notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Firestore subscription fallback:', err);
      return () => {};
    }
  },

  syncBus: async (bus: BusProductionItem) => {
    try {
      const busRef = doc(db, 'production_buses', bus.id);
      await setDoc(busRef, { ...bus, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Firestore syncBus offline:', e);
    }
  },

  // Defects
  subscribeDefects: (callback: (defects: DefectItem[]) => void) => {
    try {
      const q = query(collection(db, 'defects'), orderBy('reportedDate', 'desc'), limit(50));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: DefectItem[] = [];
            snapshot.forEach((doc) => {
              list.push({ ...doc.data(), id: doc.id } as DefectItem);
            });
            callback(list);
          }
        },
        (error) => {
          console.warn('Firestore defects subscription notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Firestore defects subscription fallback:', err);
      return () => {};
    }
  },

  syncDefect: async (defect: DefectItem) => {
    try {
      const defRef = doc(db, 'defects', defect.id);
      await setDoc(defRef, defect, { merge: true });
    } catch (e) {
      console.warn('Firestore syncDefect offline:', e);
    }
  },

  // Checkpoints
  subscribeCheckpoints: (callback: (checkpoints: QualityCheckpointItem[]) => void) => {
    try {
      const q = query(collection(db, 'checkpoints'), orderBy('date', 'desc'), limit(50));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: QualityCheckpointItem[] = [];
            snapshot.forEach((doc) => {
              list.push({ ...doc.data(), id: doc.id } as QualityCheckpointItem);
            });
            callback(list);
          }
        },
        (error) => {
          console.warn('Firestore checkpoints subscription notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Firestore checkpoints subscription fallback:', err);
      return () => {};
    }
  },

  syncCheckpoint: async (checkpoint: QualityCheckpointItem) => {
    try {
      const cpRef = doc(db, 'checkpoints', checkpoint.id);
      await setDoc(cpRef, checkpoint, { merge: true });
    } catch (e) {
      console.warn('Firestore syncCheckpoint offline:', e);
    }
  },

  // Material Stock
  syncStockItem: async (item: MaterialStockItem) => {
    try {
      const stockRef = doc(db, 'material_stock', item.id);
      await setDoc(stockRef, item, { merge: true });
    } catch (e) {
      console.warn('Firestore syncStockItem offline:', e);
    }
  },

  // Paint Scans
  syncPaintScan: async (scan: any) => {
    try {
      const scanRef = doc(db, 'paint_scans', scan.id);
      await setDoc(scanRef, scan, { merge: true });
    } catch (e) {
      console.warn('Firestore syncPaintScan offline:', e);
    }
  },
};
