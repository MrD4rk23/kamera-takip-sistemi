import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CameraRecord, resultOptions, Building } from "@/types/record";
import { storageService } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Calendar as CalendarIcon, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CameraForm = () => {
  const navigate = useNavigate();
  const { cameraId, buildingId: paramBuildingId } = useParams();
  const isEdit = !!cameraId && cameraId !== "new";

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [building, setBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    buildingId: paramBuildingId || "",
    date: new Date().toISOString().split('T')[0],
    serialNumber: 0, // Will be set in useEffect
    cameraName: "",
    location: "",
    faultReason: "",
    performedAction: "",
    result: "Arıza Giderildi",
  });

  useEffect(() => {
    loadFormData();
  }, [cameraId, paramBuildingId, isEdit, navigate]);

  const loadFormData = () => {
    if (isEdit && cameraId) {
      const record = storageService.getRecord(cameraId);
      if (record) {
        setFormData({
          buildingId: record.buildingId,
          date: record.date,
          serialNumber: record.serialNumber,
          cameraName: record.cameraName,
          location: record.location,
          faultReason: record.faultReason,
          performedAction: record.performedAction,
          result: record.result,
        });
        const buildingData = storageService.getBuilding(record.buildingId);
        setBuilding(buildingData);
      } else {
        toast.error("Kayıt bulunamadı");
        navigate("/");
      }
    } else if (paramBuildingId) {
      const buildingData = storageService.getBuilding(paramBuildingId);
      if (buildingData) {
        setBuilding(buildingData);
        const nextSerial = storageService.getNextSerialNumber();
        setFormData(prev => ({ ...prev, serialNumber: nextSerial }));
      } else {
        toast.error("Bina bulunamadı");
        navigate("/");
      }
    } else {
      const nextSerial = storageService.getNextSerialNumber();
      setFormData(prev => ({ ...prev, serialNumber: nextSerial }));
    }
  };

  // Otomatik kaydetme - her değişiklikte
  useEffect(() => {
    if (isEdit && cameraId) {
      const timer = setTimeout(() => {
        storageService.updateRecord(cameraId, formData);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData, cameraId, isEdit]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cameraName.trim()) {
      toast.error("Kamera adı zorunludur");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Konum zorunludur");
      return;
    }
    if (!formData.buildingId) {
      toast.error("Bina seçimi zorunludur");
      return;
    }

    if (isEdit && cameraId) {
      storageService.updateRecord(cameraId, formData);
      toast.success("Kayıt güncellendi");
      navigate(`/building/${formData.buildingId}`);
    } else {
      storageService.addRecord(formData);
      toast.success("Kayıt eklendi");
      navigate(`/building/${formData.buildingId}`);
    }
  };

  const handleDelete = () => {
    if (cameraId) {
      const buildingId = formData.buildingId;
      storageService.deleteRecord(cameraId);
      toast.success("Kayıt silindi");
      navigate(`/building/${buildingId}`);
    }
  };

  const handleBack = () => {
    if (formData.buildingId) {
      navigate(`/building/${formData.buildingId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gradient-primary shadow-elevated">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBack}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {isEdit ? "Kamera Düzenle" : "Yeni Kamera"}
              </h1>
              <p className="text-sm text-white/80">
                {building?.name || "Kamera kaydı"}
                {isEdit && ` • #${formData.serialNumber}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 space-y-4 shadow-card bg-gradient-card">
            {/* Tarih ve Sıra No */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tarih *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(new Date(formData.date), "PPP", { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={(date) => date && handleChange("date", date.toISOString().split('T')[0])}
                      initialFocus
                      locale={tr}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Sıra No *</Label>
                <Input
                  id="serialNumber"
                  type="number"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange("serialNumber", parseInt(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
            </div>

            {/* Kamera Bilgileri */}
            <div className="space-y-2">
              <Label htmlFor="cameraName">Kamera Adı *</Label>
              <Input
                id="cameraName"
                value={formData.cameraName}
                onChange={(e) => handleChange("cameraName", e.target.value)}
                placeholder="Örn: Giriş Kapısı Kamerası"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Konum / Bölge *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Örn: Ana Giriş, 1. Kat Koridor"
              />
            </div>

            {/* Arıza Detayları */}
            <div className="space-y-2">
              <Label htmlFor="faultReason">Arıza Sebebi</Label>
              <Textarea
                id="faultReason"
                value={formData.faultReason}
                onChange={(e) => handleChange("faultReason", e.target.value)}
                placeholder="Arızanın detaylı açıklaması..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="performedAction">Yapılan İşlem</Label>
              <Textarea
                id="performedAction"
                value={formData.performedAction}
                onChange={(e) => handleChange("performedAction", e.target.value)}
                placeholder="Yapılan onarım ve işlemler..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">Durum *</Label>
              <Select value={formData.result} onValueChange={(value) => handleChange("result", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resultOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" className="flex-1 gap-2 bg-gradient-primary">
              <Save className="h-4 w-4" />
              {isEdit ? "Güncelle" : "Kaydet"}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isEdit && (
            <p className="text-xs text-muted-foreground text-center">
              Değişiklikler otomatik olarak kaydedilir
            </p>
          )}
        </form>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kaydı sil?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Kamera kaydı kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CameraForm;
