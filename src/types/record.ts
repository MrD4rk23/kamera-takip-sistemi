export interface Building {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CameraRecord {
  id: string;
  buildingId: string;
  date: string;
  serialNumber: number;
  cameraName: string;
  location: string;
  faultReason: string;
  performedAction: string;
  result: string;
  createdAt: string;
  updatedAt: string;
}

export type CameraFormData = Omit<CameraRecord, 'id' | 'createdAt' | 'updatedAt'>;

export const resultOptions = [
  "Sorunsuz Çalışıyor",
  "Arıza Giderildi",
  "Parça Bekleniyor",
  "İade Edildi",
  "Onarım Devam Ediyor",
  "Onarılamaz"
] as const;

export const defaultBuildings: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: "Abdurrahman Gazi Kız Yurdu", color: "bg-blue-500" },
  { name: "Şehit Ömer Halisdemir Erkek Yurdu", color: "bg-purple-500" },
  { name: "Fatih Sultan Mehmet Gençlik Merkezi", color: "bg-green-500" },
  { name: "Yunus Emre Kültür Merkezi", color: "bg-orange-500" },
  { name: "Spor Kompleksi", color: "bg-red-500" },
  { name: "Mimar Sinan Sosyal Tesisleri", color: "bg-teal-500" },
  { name: "Atatürk Gençlik Kampı", color: "bg-indigo-500" },
  { name: "İdari Bina", color: "bg-pink-500" },
  { name: "Eğitim ve Kültür Merkezi", color: "bg-cyan-500" },
  { name: "Diğer Binalar", color: "bg-gray-500" },
];
