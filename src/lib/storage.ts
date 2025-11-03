import { CameraRecord, Building, defaultBuildings } from "@/types/record";
import { supabase } from "./supabase";

export const storageService = {
  // Building methods
  getAllBuildings: async (): Promise<Building[]> => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // İlk kez açıldığında varsayılan binaları ekle
      if (!data || data.length === 0) {
        const initialBuildings = defaultBuildings.map(b => ({
          name: b.name,
          color: b.color,
          icon: b.icon || null,
        }));
        
        const { data: inserted, error: insertError } = await supabase
          .from('buildings')
          .insert(initialBuildings)
          .select();
        
        if (insertError) throw insertError;
        return inserted as Building[];
      }
      
      return data as Building[];
    } catch (error) {
      console.error("Binalar yüklenirken hata:", error);
      return [];
    }
  },

  getBuilding: async (id: string): Promise<Building | null> => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Building;
    } catch (error) {
      console.error("Bina yüklenirken hata:", error);
      return null;
    }
  },

  addBuilding: async (name: string, color: string): Promise<Building | null> => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .insert([{ name, color }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Building;
    } catch (error) {
      console.error("Bina eklenirken hata:", error);
      return null;
    }
  },

  updateBuilding: async (id: string, name: string, color: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('buildings')
        .update({ name, color, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Bina güncellenirken hata:", error);
      return false;
    }
  },

  deleteBuilding: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Bina silinirken hata:", error);
      return false;
    }
  },

  // Camera record methods
  getAllRecords: async (): Promise<CameraRecord[]> => {
    try {
      const { data, error} = await supabase
        .from('cameras')
        .select('*')
        .order('serial_number', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(record => ({
        id: record.id,
        buildingId: record.building_id,
        date: record.date,
        serialNumber: record.serial_number,
        cameraName: record.camera_name,
        location: record.location,
        faultReason: record.fault_reason || "",
        performedAction: record.performed_action || "",
        result: record.result,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      })) as CameraRecord[];
    } catch (error) {
      console.error("Kayıtlar yüklenirken hata:", error);
      return [];
    }
  },

  getRecordsByBuilding: async (buildingId: string): Promise<CameraRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('cameras')
        .select('*')
        .eq('building_id', buildingId)
        .order('serial_number', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(record => ({
        id: record.id,
        buildingId: record.building_id,
        date: record.date,
        serialNumber: record.serial_number,
        cameraName: record.camera_name,
        location: record.location,
        faultReason: record.fault_reason || "",
        performedAction: record.performed_action || "",
        result: record.result,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      })) as CameraRecord[];
    } catch (error) {
      console.error("Bina kayıtları yüklenirken hata:", error);
      return [];
    }
  },

  getRecord: async (id: string): Promise<CameraRecord | null> => {
    try {
      const { data, error } = await supabase
        .from('cameras')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        buildingId: data.building_id,
        date: data.date,
        serialNumber: data.serial_number,
        cameraName: data.camera_name,
        location: data.location,
        faultReason: data.fault_reason || "",
        performedAction: data.performed_action || "",
        result: data.result,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as CameraRecord;
    } catch (error) {
      console.error("Kayıt yüklenirken hata:", error);
      return null;
    }
  },

  addRecord: async (record: Omit<CameraRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CameraRecord | null> => {
    try {
      const { data, error } = await supabase
        .from('cameras')
        .insert([{
          building_id: record.buildingId,
          date: record.date,
          serial_number: record.serialNumber,
          camera_name: record.cameraName,
          location: record.location,
          fault_reason: record.faultReason || null,
          performed_action: record.performedAction || null,
          result: record.result,
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        buildingId: data.building_id,
        date: data.date,
        serialNumber: data.serial_number,
        cameraName: data.camera_name,
        location: data.location,
        faultReason: data.fault_reason || "",
        performedAction: data.performed_action || "",
        result: data.result,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as CameraRecord;
    } catch (error) {
      console.error("Kayıt eklenirken hata:", error);
      return null;
    }
  },

  updateRecord: async (id: string, updates: Partial<CameraRecord>): Promise<CameraRecord | null> => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.buildingId !== undefined) updateData.building_id = updates.buildingId;
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.serialNumber !== undefined) updateData.serial_number = updates.serialNumber;
      if (updates.cameraName !== undefined) updateData.camera_name = updates.cameraName;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.faultReason !== undefined) updateData.fault_reason = updates.faultReason;
      if (updates.performedAction !== undefined) updateData.performed_action = updates.performedAction;
      if (updates.result !== undefined) updateData.result = updates.result;
      
      const { data, error } = await supabase
        .from('cameras')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        buildingId: data.building_id,
        date: data.date,
        serialNumber: data.serial_number,
        cameraName: data.camera_name,
        location: data.location,
        faultReason: data.fault_reason || "",
        performedAction: data.performed_action || "",
        result: data.result,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as CameraRecord;
    } catch (error) {
      console.error("Kayıt güncellenirken hata:", error);
      return null;
    }
  },

  deleteRecord: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('cameras')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Kayıt silinirken hata:", error);
      return false;
    }
  },

  getNextSerialNumber: async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('cameras')
        .select('serial_number')
        .order('serial_number', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return 1;
      return data[0].serial_number + 1;
    } catch (error) {
      console.error("Seri numara alınırken hata:", error);
      return 1;
    }
  },
};
