import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ServiceRecord, resultOptions } from "@/types/record";
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

const RecordForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    serialNumber: storageService.getNextSerialNumber(),
    deviceName: "",
    brand: "",
    model: "",
    deviceSerialNo: "",
    department: "",
    faultReason: "",
    performedAction: "",
    result: "Arıza Giderildi",
  });

  useEffect(() => {
    if (isEdit && id) {
      const record = storageService.getRecord(id);
      if (record) {
        setFormData({
          date: record.date,
          serialNumber: record.serialNumber,
          deviceName: record.deviceName,
          brand: record.brand,
          model: record.model,
          deviceSerialNo: record.deviceSerialNo,
          department: record.department,
          faultReason: record.faultReason,
          performedAction: record.performedAction,
          result: record.result,
        });
      } else {
        toast.error("Kayıt bulunamadı");
        navigate("/");
      }
    }
  }, [id, isEdit, navigate]);

  // Otomatik kaydetme - her değişiklikte
  useEffect(() => {
    if (isEdit && id) {
      const timer = setTimeout(() => {
        storageService.updateRecord(id, formData);
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    }
  }, [formData, id, isEdit]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasyon
    if (!formData.deviceName.trim()) {
      toast.error("Cihaz adı zorunludur");
      return;
    }
    if (!formData.brand.trim()) {
      toast.error("Marka zorunludur");
      return;
    }
    if (!formData.department.trim()) {
      toast.error("Geldiği birim zorunludur");
      return;
    }

    if (isEdit && id) {
      storageService.updateRecord(id, formData);
      toast.success("Kayıt güncellendi");
    } else {
      storageService.addRecord(formData);
      toast.success("Kayıt eklendi");
    }
    navigate("/");
  };

  const handleDelete = () => {
    if (id) {
      storageService.deleteRecord(id);
      toast.success("Kayıt silindi");
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
              onClick={() => navigate("/")}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {isEdit ? "Kayıt Düzenle" : "Yeni Kayıt"}
              </h1>
              <p className="text-sm text-white/80">
                {isEdit ? `#${formData.serialNumber}` : "Arıza kaydı oluştur"}
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

            {/* Cihaz Bilgileri */}
            <div className="space-y-2">
              <Label htmlFor="deviceName">Cihazın Adı *</Label>
              <Input
                id="deviceName"
                value={formData.deviceName}
                onChange={(e) => handleChange("deviceName", e.target.value)}
                placeholder="Örn: Dizüstü Bilgisayar"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marka *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="Örn: HP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="Örn: Pavilion"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceSerialNo">Seri No</Label>
              <Input
                id="deviceSerialNo"
                value={formData.deviceSerialNo}
                onChange={(e) => handleChange("deviceSerialNo", e.target.value)}
                placeholder="Cihazın seri numarası"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Geldiği Birim *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                placeholder="Örn: İnsan Kaynakları"
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
              <Label htmlFor="result">Sonuç *</Label>
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
              Bu işlem geri alınamaz. Kayıt kalıcı olarak silinecektir.
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

export default RecordForm;
