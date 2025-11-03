import { ServiceRecord } from "@/types/record";
import * as XLSX from "xlsx";

export const exportToExcel = (records: ServiceRecord[]) => {
  // Excel için veri hazırla
  const excelData = records.map(record => ({
    "Tarih": new Date(record.date).toLocaleDateString('tr-TR'),
    "Sıra No": record.serialNumber,
    "Cihazın Adı": record.deviceName,
    "Marka": record.brand,
    "Model": record.model,
    "Seri No": record.deviceSerialNo,
    "Geldiği Birim": record.department,
    "Arıza Sebebi": record.faultReason,
    "Yapılan İşlem": record.performedAction,
    "Sonuç": record.result,
  }));

  // Worksheet oluştur
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Sütun genişliklerini ayarla
  const columnWidths = [
    { wch: 12 }, // Tarih
    { wch: 8 },  // Sıra No
    { wch: 20 }, // Cihazın Adı
    { wch: 15 }, // Marka
    { wch: 15 }, // Model
    { wch: 15 }, // Seri No
    { wch: 20 }, // Geldiği Birim
    { wch: 30 }, // Arıza Sebebi
    { wch: 30 }, // Yapılan İşlem
    { wch: 15 }, // Sonuç
  ];
  ws['!cols'] = columnWidths;

  // Workbook oluştur
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Arıza Kayıtları");

  // Dosya adı oluştur
  const fileName = `ariza-kayitlari-${new Date().toISOString().split('T')[0]}.xlsx`;

  // Excel dosyasını indir
  XLSX.writeFile(wb, fileName);
};
