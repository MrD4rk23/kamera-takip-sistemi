import { CameraRecord, Building, defaultBuildings } from "@/types/record";

const STORAGE_KEY = "camera_records";
const BUILDINGS_KEY = "buildings";

export const storageService = {
  // Building methods
  getAllBuildings: (): Building[] => {
    try {
      const data = localStorage.getItem(BUILDINGS_KEY);
      if (!data) {
        // İlk kez açıldığında varsayılan binaları ekle
        const initialBuildings = defaultBuildings.map(b => ({
          ...b,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        localStorage.setItem(BUILDINGS_KEY, JSON.stringify(initialBuildings));
        return initialBuildings;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Binalar yüklenirken hata:", error);
      return [];
    }
  },

  getBuilding: (id: string): Building | null => {
    const buildings = storageService.getAllBuildings();
    return buildings.find(b => b.id === id) || null;
  },

  addBuilding: (name: string, color: string): Building => {
    const buildings = storageService.getAllBuildings();
    const newBuilding: Building = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    buildings.push(newBuilding);
    localStorage.setItem(BUILDINGS_KEY, JSON.stringify(buildings));
    return newBuilding;
  },

  updateBuilding: (id: string, name: string, color: string): void => {
    const buildings = storageService.getAllBuildings();
    const index = buildings.findIndex(b => b.id === id);
    if (index !== -1) {
      buildings[index] = {
        ...buildings[index],
        name,
        color,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(BUILDINGS_KEY, JSON.stringify(buildings));
    }
  },

  deleteBuilding: (id: string): void => {
    const buildings = storageService.getAllBuildings();
    const filtered = buildings.filter(b => b.id !== id);
    localStorage.setItem(BUILDINGS_KEY, JSON.stringify(filtered));
    // Binaya ait kameraları da sil
    const records = storageService.getAllRecords();
    const filteredRecords = records.filter(r => r.buildingId !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
  },

  // Camera record methods
  getAllRecords: (): CameraRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Kayıtlar yüklenirken hata:", error);
      return [];
    }
  },

  getRecordsByBuilding: (buildingId: string): CameraRecord[] => {
    return storageService.getAllRecords().filter(r => r.buildingId === buildingId);
  },

  getRecord: (id: string): CameraRecord | null => {
    const records = storageService.getAllRecords();
    return records.find(record => record.id === id) || null;
  },

  addRecord: (record: Omit<CameraRecord, 'id' | 'createdAt' | 'updatedAt'>): CameraRecord => {
    const records = storageService.getAllRecords();
    const newRecord: CameraRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return newRecord;
  },

  updateRecord: (id: string, updates: Partial<CameraRecord>): CameraRecord | null => {
    const records = storageService.getAllRecords();
    const index = records.findIndex(record => record.id === id);
    if (index === -1) return null;

    records[index] = {
      ...records[index],
      ...updates,
      id: records[index].id,
      createdAt: records[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return records[index];
  },

  deleteRecord: (id: string): boolean => {
    const records = storageService.getAllRecords();
    const filteredRecords = records.filter(record => record.id !== id);
    if (filteredRecords.length === records.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
    return true;
  },

  getNextSerialNumber: (): number => {
    const records = storageService.getAllRecords();
    if (records.length === 0) return 1;
    const maxSerial = Math.max(...records.map(r => r.serialNumber));
    return maxSerial + 1;
  },
};
