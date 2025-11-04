import { CameraRecord, Building, defaultBuildings } from "@/types/record";
import { database } from "./firebase";
import { ref, set, remove, onValue } from "firebase/database";

const STORAGE_KEYS = {
  BUILDINGS: "buildings",
  RECORDS: "camera_records",
} as const;

// Firebase realtime listeners
let buildingsListenerActive = false;
let recordsListenerActive = false;

// Firebase'den gelen güncellemeleri localStorage'a kaydet
const setupFirebaseListeners = () => {
  if (typeof window === 'undefined') return;

  // Buildings listener
  if (!buildingsListenerActive) {
    const buildingsRef = ref(database, STORAGE_KEYS.BUILDINGS);
    onValue(buildingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const buildings = Object.values(data) as Building[];
        localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));
        console.log("🔥 Firebase: Binalar güncellendi", buildings.length);
        // Trigger custom event for UI update
        window.dispatchEvent(new CustomEvent('buildingsUpdated'));
      }
    });
    buildingsListenerActive = true;
  }

  // Records listener
  if (!recordsListenerActive) {
    const recordsRef = ref(database, STORAGE_KEYS.RECORDS);
    onValue(recordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const records = Object.values(data) as CameraRecord[];
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
        console.log("🔥 Firebase: Kayıtlar güncellendi", records.length);
        // Trigger custom event for UI update
        window.dispatchEvent(new CustomEvent('recordsUpdated'));
      }
    });
    recordsListenerActive = true;
  }
};

// İlk yükleme
if (typeof window !== 'undefined') {
  setupFirebaseListeners();
}

// Firebase'e kaydetme helper (background, hata yakalamaz)
const syncToFirebase = (key: string, data: any) => {
  try {
    const dataRef = ref(database, key);
    set(dataRef, data).catch((error) => {
      console.error("Firebase sync error:", error);
    });
  } catch (error) {
    console.error("Firebase sync error:", error);
  }
};

export const storageService = {
  // Building methods
  getAllBuildings: (): Building[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
      if (!stored) {
        const initialBuildings: Building[] = defaultBuildings.map((b, index) => ({
          ...b,
          id: (index + 1).toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(initialBuildings));
        return initialBuildings;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error("Binalar yüklenirken hata:", error);
      const initialBuildings: Building[] = defaultBuildings.map((b, index) => ({
        ...b,
        id: (index + 1).toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      return initialBuildings;
    }
  },

  getBuilding: (id: string): Building | null => {
    const buildings = storageService.getAllBuildings();
    return buildings.find(b => b.id === id) || null;
  },

  addBuilding: (name: string, color: string): Building => {
    const buildings = storageService.getAllBuildings();
    const newBuilding: Building = {
      id: Date.now().toString(),
      name,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    buildings.push(newBuilding);
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));
    
    // Firebase sync (background)
    const buildingsObj = buildings.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});
    syncToFirebase(STORAGE_KEYS.BUILDINGS, buildingsObj);
    
    return newBuilding;
  },

  updateBuilding: (id: string, name: string, color: string): boolean => {
    const buildings = storageService.getAllBuildings();
    const index = buildings.findIndex(b => b.id === id);
    if (index === -1) return false;
    
    buildings[index] = {
      ...buildings[index],
      name,
      color,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));
    
    // Firebase sync (background)
    const buildingsObj = buildings.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});
    syncToFirebase(STORAGE_KEYS.BUILDINGS, buildingsObj);
    
    return true;
  },

  deleteBuilding: (id: string): boolean => {
    const buildings = storageService.getAllBuildings();
    const filtered = buildings.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(filtered));
    
    const records = storageService.getAllRecords();
    const filteredRecords = records.filter(r => r.buildingId !== id);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filteredRecords));
    
    // Firebase sync (background)
    const buildingsObj = filtered.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});
    syncToFirebase(STORAGE_KEYS.BUILDINGS, buildingsObj);
    
    const recordsObj = filteredRecords.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});
    syncToFirebase(STORAGE_KEYS.RECORDS, recordsObj);
    
    return true;
  },

  getAllRecords: (): CameraRecord[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Kayıtlar yüklenirken hata:", error);
      return [];
    }
  },

  getRecordsByBuilding: (buildingId: string): CameraRecord[] => {
    const records = storageService.getAllRecords();
    return records.filter(r => r.buildingId === buildingId);
  },

  getRecord: (id: string): CameraRecord | null => {
    const records = storageService.getAllRecords();
    return records.find(r => r.id === id) || null;
  },

  addRecord: (record: Omit<CameraRecord, 'id' | 'createdAt' | 'updatedAt'>): CameraRecord => {
    const records = storageService.getAllRecords();
    const newRecord: CameraRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    
    // Firebase sync (background)
    const recordsObj = records.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});
    syncToFirebase(STORAGE_KEYS.RECORDS, recordsObj);
    
    return newRecord;
  },

  updateRecord: (id: string, updates: Partial<CameraRecord>): CameraRecord | null => {
    const records = storageService.getAllRecords();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    
    // Firebase sync (background)
    const recordsObj = records.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});
    syncToFirebase(STORAGE_KEYS.RECORDS, recordsObj);
    
    return records[index];
  },

  deleteRecord: (id: string): boolean => {
    const records = storageService.getAllRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filtered));
    
    // Firebase sync (background)
    const recordsObj = filtered.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});
    syncToFirebase(STORAGE_KEYS.RECORDS, recordsObj);
    
    return true;
  },

  getNextSerialNumber: (): number => {
    const records = storageService.getAllRecords();
    if (records.length === 0) return 1;
    const maxSerial = Math.max(...records.map(r => r.serialNumber || 0));
    return maxSerial + 1;
  },
};
