import { CameraRecord, Building, defaultBuildings } from "@/types/record";

const STORAGE_KEYS = {
  BUILDINGS: "buildings",
  RECORDS: "camera_records",
} as const;

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
    return true;
  },

  deleteBuilding: (id: string): boolean => {
    const buildings = storageService.getAllBuildings();
    const filtered = buildings.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(filtered));
    
    const records = storageService.getAllRecords();
    const filteredRecords = records.filter(r => r.buildingId !== id);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filteredRecords));
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
    return records[index];
  },

  deleteRecord: (id: string): boolean => {
    const records = storageService.getAllRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filtered));
    return true;
  },

  getNextSerialNumber: (): number => {
    const records = storageService.getAllRecords();
    if (records.length === 0) return 1;
    const maxSerial = Math.max(...records.map(r => r.serialNumber || 0));
    return maxSerial + 1;
  },
};
