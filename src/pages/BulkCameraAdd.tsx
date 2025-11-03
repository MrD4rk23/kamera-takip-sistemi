import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storageService } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function BulkCameraAdd() {
  const navigate = useNavigate();
  const { buildingId } = useParams();
  const { toast } = useToast();
  const [cameraType, setCameraType] = useState<"İç Kamera" | "Dış Kamera">("İç Kamera");
  const [count, setCount] = useState<number>(10);

  const building = storageService.getAllBuildings().find(b => b.id === buildingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!buildingId) return;

    const existingRecords = storageService.getRecordsByBuilding(buildingId);
    const startNumber = existingRecords.filter(r => r.location.includes(cameraType)).length + 1;

    // Toplu kamera oluştur
    for (let i = 0; i < count; i++) {
      const cameraNumber = startNumber + i;
      const newRecord = {
        buildingId,
        date: new Date().toISOString().split('T')[0],
        serialNumber: Date.now() + i,
        cameraName: `${cameraType} ${cameraNumber}`,
        location: `${cameraType} - ${building?.name || ''}`,
        faultReason: "",
        performedAction: "",
        result: "Sorunsuz Çalışıyor",
      };
      
      storageService.addRecord(newRecord);
    }

    toast({
      title: "✅ Toplu Kamera Eklendi",
      description: `${count} adet ${cameraType} başarıyla oluşturuldu.`,
    });

    navigate(`/building/${buildingId}`);
  };

  if (!building) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Bina bulunamadı</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/building/${buildingId}`)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Toplu Kamera Ekle</h1>
            <p className="text-white/80 mt-1">{building.name}</p>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Toplu Kamera Oluşturma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cameraType">Kamera Tipi</Label>
                <Select
                  value={cameraType}
                  onValueChange={(value) => setCameraType(value as "İç Kamera" | "Dış Kamera")}
                >
                  <SelectTrigger id="cameraType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="İç Kamera">İç Kamera</SelectItem>
                    <SelectItem value="Dış Kamera">Dış Kamera</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Kameralar otomatik olarak numaralandırılacak (örn: İç Kamera 1, İç Kamera 2...)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Kamera Sayısı</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  {count} adet {cameraType} oluşturulacak
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="font-medium text-blue-900">📝 Bilgilendirme:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Tüm kameralar <strong>"Sorunsuz Çalışıyor"</strong> durumunda oluşturulacak</li>
                  <li>Kamera isimleri otomatik numaralandırılacak</li>
                  <li>Daha sonra her kamerayı tek tek düzenleyebilirsiniz</li>
                  <li>Arızalı kameraları sonradan güncelleyebilirsiniz</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/building/${buildingId}`)}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button type="submit" className="flex-1 gap-2">
                  <Plus className="h-4 w-4" />
                  {count} Kamera Oluştur
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
