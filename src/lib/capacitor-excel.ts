import { CameraRecord, Building } from "@/types/record";
import * as XLSX from "xlsx";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const exportToExcelCapacitor = async (records: CameraRecord[]) => {
  // Excel için veri hazırla
  const excelData = records.map(record => ({
    "Tarih": new Date(record.date).toLocaleDateString('tr-TR'),
    "Sıra No": record.serialNumber,
    "Kamera Adı": record.cameraName,
    "Konum": record.location,
    "Arıza Sebebi": record.faultReason,
    "Yapılan İşlem": record.performedAction,
    "Durum": record.result,
  }));

  // Worksheet oluştur
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Sütun genişliklerini ayarla
  const columnWidths = [
    { wch: 12 }, // Tarih
    { wch: 8 },  // Sıra No
    { wch: 25 }, // Kamera Adı
    { wch: 25 }, // Konum
    { wch: 35 }, // Arıza Sebebi
    { wch: 35 }, // Yapılan İşlem
    { wch: 18 }, // Durum
  ];
  ws['!cols'] = columnWidths;

  // Workbook oluştur
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Kamera Kayıtları");

  // Dosya adı oluştur
  const fileName = `kamera-kayitlari-${new Date().toISOString().split('T')[0]}.xlsx`;

  // Native platform kontrolü
  if (Capacitor.isNativePlatform()) {
    try {
      // Excel dosyasını base64'e çevir
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // Dosyayı kaydet
      const result = await Filesystem.writeFile({
        path: fileName,
        data: wbout,
        directory: Directory.Cache,
      });

      // Share API ile paylaş
      await Share.share({
        title: 'Kamera Kayıtları',
        text: 'Kamera Takip Sistemi Kayıtları',
        url: result.uri,
        dialogTitle: 'Excel dosyasını paylaş',
      });

      return true;
    } catch (error) {
      console.error('Excel export hatası:', error);
      throw error;
    }
  } else {
    // Web için normal indirme
    XLSX.writeFile(wb, fileName);
    return true;
  }
};

// Tüm binaların toplu raporunu oluştur
export const exportAllBuildingsToExcel = async (
  buildings: Building[], 
  getRecordsByBuilding: (buildingId: string) => CameraRecord[]
) => {
  // Workbook oluştur
  const wb = XLSX.utils.book_new();

  // Özet sayfa için veri hazırla
  const summaryData = [];
  for (const building of buildings) {
    const cameras = getRecordsByBuilding(building.id);
    const faultCount = cameras.filter(c => 
      c.result !== "Arıza Giderildi" && c.result !== "İade Edildi"
    ).length;
    const workingCount = cameras.length - faultCount;

    summaryData.push({
      "Bina Adı": building.name,
      "Toplam Kamera": cameras.length,
      "Çalışan": workingCount,
      "Arızalı": faultCount,
      "Arıza Oranı": cameras.length > 0 
        ? `%${((faultCount / cameras.length) * 100).toFixed(1)}` 
        : "%0",
    });
  }

  // Özet sayfasını ekle
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [
    { wch: 35 }, // Bina Adı
    { wch: 15 }, // Toplam Kamera
    { wch: 12 }, // Çalışan
    { wch: 12 }, // Arızalı
    { wch: 12 }, // Arıza Oranı
  ];
  XLSX.utils.book_append_sheet(wb, summaryWs, "📊 Özet");

  // Her bina için ayrı sayfa oluştur
  for (const building of buildings) {
    const cameras = getRecordsByBuilding(building.id);
    
    if (cameras.length > 0) {
      const buildingData = cameras.map(record => ({
        "Tarih": new Date(record.date).toLocaleDateString('tr-TR'),
        "Sıra No": record.serialNumber,
        "Kamera Adı": record.cameraName,
        "Konum": record.location,
        "Arıza Sebebi": record.faultReason,
        "Yapılan İşlem": record.performedAction,
        "Durum": record.result,
      }));

      const ws = XLSX.utils.json_to_sheet(buildingData);
      ws['!cols'] = [
        { wch: 12 }, // Tarih
        { wch: 8 },  // Sıra No
        { wch: 25 }, // Kamera Adı
        { wch: 25 }, // Konum
        { wch: 35 }, // Arıza Sebebi
        { wch: 35 }, // Yapılan İşlem
        { wch: 18 }, // Durum
      ];

      // Sayfa adını kısalt (Excel limit: 31 karakter)
      let sheetName = building.name;
      if (sheetName.length > 31) {
        sheetName = sheetName.substring(0, 28) + "...";
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  }

  // Tüm kameraları içeren genel sayfa
  const allCameras: any[] = [];
  for (const building of buildings) {
    const cameras = getRecordsByBuilding(building.id);
    cameras.forEach(record => {
      allCameras.push({
        "Bina": building.name,
        "Tarih": new Date(record.date).toLocaleDateString('tr-TR'),
        "Sıra No": record.serialNumber,
        "Kamera Adı": record.cameraName,
        "Konum": record.location,
        "Arıza Sebebi": record.faultReason,
        "Yapılan İşlem": record.performedAction,
        "Durum": record.result,
      });
    });
  }

  if (allCameras.length > 0) {
    const allWs = XLSX.utils.json_to_sheet(allCameras);
    allWs['!cols'] = [
      { wch: 30 }, // Bina
      { wch: 12 }, // Tarih
      { wch: 8 },  // Sıra No
      { wch: 25 }, // Kamera Adı
      { wch: 25 }, // Konum
      { wch: 35 }, // Arıza Sebebi
      { wch: 35 }, // Yapılan İşlem
      { wch: 18 }, // Durum
    ];
    XLSX.utils.book_append_sheet(wb, allWs, "🔍 Tüm Kayıtlar");
  }

  // Dosya adı oluştur
  const fileName = `tum-binalar-raporu-${new Date().toISOString().split('T')[0]}.xlsx`;

  // Native platform kontrolü
  if (Capacitor.isNativePlatform()) {
    try {
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      const result = await Filesystem.writeFile({
        path: fileName,
        data: wbout,
        directory: Directory.Cache,
      });

      await Share.share({
        title: 'Tüm Binalar Raporu',
        text: 'Kamera Takip Sistemi - Toplu Rapor',
        url: result.uri,
        dialogTitle: 'Excel dosyasını paylaş',
      });

      return true;
    } catch (error) {
      console.error('Excel export hatası:', error);
      throw error;
    }
  } else {
    // Web için normal indirme
    XLSX.writeFile(wb, fileName);
    return true;
  }
};
