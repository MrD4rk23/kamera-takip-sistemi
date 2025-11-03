import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CameraRecord, Building } from "@/types/record";
import { storageService } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Plus, Download, Layers, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import { exportToExcelCapacitor } from "@/lib/capacitor-excel";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const BuildingDetail = () => {
  const navigate = useNavigate();
  const { buildingId } = useParams();
  const [building, setBuilding] = useState<Building | null>(null);
  const [cameras, setCameras] = useState<CameraRecord[]>([]);
  const [filteredCameras, setFilteredCameras] = useState<CameraRecord[]>([]);
  const [cameraToDelete, setCameraToDelete] = useState<string | null>(null);
  const [bulkDeleteType, setBulkDeleteType] = useState<"faulty" | "working" | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!buildingId) {
      navigate("/");
      return;
    }

    const buildingData = storageService.getBuilding(buildingId);
    if (!buildingData) {
      toast.error("Bina bulunamadı");
      navigate("/");
      return;
    }

    setBuilding(buildingData);
    loadCameras();
  }, [buildingId, navigate]);

  useEffect(() => {
    filterCameras();
  }, [cameras, filterStatus]);

  const filterCameras = () => {
    if (filterStatus === "all") {
      setFilteredCameras(cameras);
    } else if (filterStatus === "working") {
      setFilteredCameras(cameras.filter(c => 
        c.result === "Sorunsuz Çalışıyor" || c.result === "Arıza Giderildi"
      ));
    } else if (filterStatus === "faulty") {
      setFilteredCameras(cameras.filter(c => 
        c.result !== "Sorunsuz Çalışıyor" && c.result !== "Arıza Giderildi" && c.result !== "İade Edildi"
      ));
    } else {
      // Specific status filter
      setFilteredCameras(cameras.filter(c => c.result === filterStatus));
    }
  };

  const loadCameras = () => {
    if (!buildingId) return;
    const camerasData = storageService.getRecordsByBuilding(buildingId);
    // Tarihe göre azalan sıralama
    const sorted = camerasData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setCameras(sorted);
  };

  const handleExport = async () => {
    if (cameras.length === 0) {
      toast.error("Dışa aktarılacak kayıt yok");
      return;
    }
    try {
      await exportToExcelCapacitor(cameras as any);
      toast.success("Excel dosyası hazırlandı");
    } catch (error) {
      toast.error("Dışa aktarma başarısız");
      console.error(error);
    }
  };

  const getResultBadgeVariant = (result: string) => {
    if (result === "Sorunsuz Çalışıyor") return "default";
    if (result === "Arıza Giderildi") return "secondary";
    if (result === "Parça Bekleniyor") return "secondary";
    if (result === "Onarım Devam Ediyor") return "secondary";
    if (result === "İade Edildi") return "outline";
    return "destructive";
  };

  const handleDeleteCamera = (cameraId: string) => {
    setCameraToDelete(cameraId);
  };

  const confirmDelete = () => {
    if (!cameraToDelete) return;
    
    storageService.deleteRecord(cameraToDelete);
    toast.success("Kamera silindi");
    setCameraToDelete(null);
    loadCameras();
  };

  const handleBulkDelete = (type: "faulty" | "working") => {
    setBulkDeleteType(type);
  };

  const confirmBulkDelete = () => {
    if (!bulkDeleteType || !buildingId) return;

    let camerasToDelete: CameraRecord[] = [];
    
    if (bulkDeleteType === "faulty") {
      camerasToDelete = cameras.filter(c => 
        c.result !== "Sorunsuz Çalışıyor" && c.result !== "Arıza Giderildi" && c.result !== "İade Edildi"
      );
    } else if (bulkDeleteType === "working") {
      camerasToDelete = cameras.filter(c => 
        c.result === "Sorunsuz Çalışıyor" || c.result === "Arıza Giderildi"
      );
    }

    camerasToDelete.forEach(camera => {
      storageService.deleteRecord(camera.id);
    });

    toast.success(`${camerasToDelete.length} kamera silindi`);
    setBulkDeleteType(null);
    loadCameras();
  };

  const faultCount = cameras.filter(c => 
    c.result !== "Sorunsuz Çalışıyor" && c.result !== "Arıza Giderildi" && c.result !== "İade Edildi"
  ).length;

  if (!building) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gradient-primary shadow-elevated">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                onClick={() => navigate("/")}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-white truncate">{building.name}</h1>
                <p className="text-sm text-white/80">
                  {cameras.length} Kamera {faultCount > 0 && `• ${faultCount} Arızalı`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-white/10 text-white border-white/30">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="working">Çalışanlar</SelectItem>
                  <SelectItem value="faulty">Arızalılar</SelectItem>
                  <SelectItem value="Sorunsuz Çalışıyor">Sorunsuz Çalışıyor</SelectItem>
                  <SelectItem value="Arıza Giderildi">Arıza Giderildi</SelectItem>
                  <SelectItem value="Parça Bekleniyor">Parça Bekleniyor</SelectItem>
                  <SelectItem value="Onarım Devam Ediyor">Onarım Devam Ediyor</SelectItem>
                  <SelectItem value="Onarılamaz">Onarılamaz</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Toplu Sil</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleBulkDelete("working")}
                    className="gap-2 text-green-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Çalışanları Sil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleBulkDelete("faulty")}
                    className="gap-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Arızalıları Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={handleExport}
                size="sm"
                variant="secondary"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button
                onClick={() => navigate(`/building/${buildingId}/bulk`)}
                size="sm"
                variant="outline"
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Toplu</span>
              </Button>
              <Button
                onClick={() => navigate(`/camera/new/${buildingId}`)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Ekle</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1">Toplam</p>
            <p className="text-2xl font-bold text-primary">{cameras.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1">Çalışan</p>
            <p className="text-2xl font-bold text-green-600">
              {cameras.length - faultCount}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1">Arızalı</p>
            <p className="text-2xl font-bold text-red-600">{faultCount}</p>
          </Card>
        </div>

        {/* Cameras List */}
        {filteredCameras.length === 0 ? (
          <Card className="p-12 text-center shadow-card">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {cameras.length === 0 ? "Henüz kamera kaydı yok" : "Filtre ile eşleşen kamera bulunamadı"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {cameras.length === 0 ? "Yeni bir kamera kaydı eklemek için + butonuna tıklayın" : "Farklı bir filtre seçeneği deneyin"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredCameras.map((camera) => (
              <Card
                key={camera.id}
                className="p-4 bg-gradient-card shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/camera/${camera.id}`)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono shrink-0">
                        #{camera.serialNumber}
                      </Badge>
                      <h3 className="font-semibold text-foreground truncate">
                        {camera.cameraName}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1 truncate">
                      📍 {camera.location}
                    </p>
                    {camera.faultReason && (
                      <p className="text-xs text-muted-foreground truncate">
                        {camera.faultReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    <div className="text-right">
                      <Badge 
                        variant={getResultBadgeVariant(camera.result)} 
                        className={`mb-2 whitespace-nowrap ${camera.result === "Sorunsuz Çalışıyor" ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
                      >
                        {camera.result}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(camera.date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCamera(camera.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => navigate(`/camera/new/${buildingId}`)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-elevated hover:scale-110 transition-transform bg-gradient-primary"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!cameraToDelete} onOpenChange={() => setCameraToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kamerayı silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Kamera kaydı kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={!!bulkDeleteType} onOpenChange={() => setBulkDeleteType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkDeleteType === "working" ? "Çalışan Kameraları" : "Arızalı Kameraları"} Silmek İstediğinize Emin Misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. 
              {bulkDeleteType === "working" && (
                <span className="block mt-2 font-semibold text-green-600">
                  {cameras.filter(c => c.result === "Sorunsuz Çalışıyor" || c.result === "Arıza Giderildi").length} adet çalışan kamera
                </span>
              )}
              {bulkDeleteType === "faulty" && (
                <span className="block mt-2 font-semibold text-red-600">
                  {cameras.filter(c => c.result !== "Sorunsuz Çalışıyor" && c.result !== "Arıza Giderildi" && c.result !== "İade Edildi").length} adet arızalı kamera
                </span>
              )}
              {" "}kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Toplu Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BuildingDetail;
