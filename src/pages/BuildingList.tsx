import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building } from "@/types/record";
import { storageService } from "@/lib/storage";
import { exportAllBuildingsToExcel } from "@/lib/capacitor-excel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Camera, Settings, Plus, Edit2, Download, ArrowLeft, Upload, Database, LogOut, Trash2, Key } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

const colorOptions = [
  { value: "bg-blue-500", label: "Mavi" },
  { value: "bg-purple-500", label: "Mor" },
  { value: "bg-green-500", label: "Yeşil" },
  { value: "bg-orange-500", label: "Turuncu" },
  { value: "bg-red-500", label: "Kırmızı" },
  { value: "bg-teal-500", label: "Turkuaz" },
  { value: "bg-indigo-500", label: "İndigo" },
  { value: "bg-pink-500", label: "Pembe" },
  { value: "bg-cyan-500", label: "Camgöbeği" },
  { value: "bg-gray-500", label: "Gri" },
];

const BuildingList = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingStats, setBuildingStats] = useState<Record<string, { total: number; faulty: number }>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [newBuildingName, setNewBuildingName] = useState("");
  const [newBuildingColor, setNewBuildingColor] = useState(colorOptions[0].value);
  const [bulkDeleteType, setBulkDeleteType] = useState<"all-faulty" | "all-working" | null>(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    console.log("📋 BuildingList: Binalar yükleniyor...");
    try {
      const allBuildings = await storageService.getAllBuildings();
      console.log("📋 BuildingList: Yüklenen bina sayısı:", allBuildings.length);
      setBuildings(allBuildings);
      
      // Load stats for each building
      const stats: Record<string, { total: number; faulty: number }> = {};
      for (const building of allBuildings) {
        const cameras = await storageService.getRecordsByBuilding(building.id);
        const faultyCameras = cameras.filter(c => 
          c.result !== "Sorunsuz Çalışıyor" && c.result !== "Arıza Giderildi" && c.result !== "İade Edildi"
        );
        stats[building.id] = {
          total: cameras.length,
          faulty: faultyCameras.length,
        };
      }
      setBuildingStats(stats);
      console.log("✅ BuildingList: Binalar ve istatistikler yüklendi");
    } catch (error: any) {
      console.error("❌ BuildingList hatası:", error);
      console.error("Hata mesajı:", error.message, error.details, error.hint);
      toast.error("Binalar yüklenemedi: " + error.message);
    }
  };

  const getBuildingCameraCount = (buildingId: string) => {
    return buildingStats[buildingId]?.total || 0;
  };

  const getBuildingFaultCount = (buildingId: string) => {
    return buildingStats[buildingId]?.faulty || 0;
  };

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setNewBuildingName(building.name);
    setNewBuildingColor(building.color);
    setIsEditDialogOpen(true);
  };

  const handleSaveBuilding = async () => {
    if (!newBuildingName.trim()) {
      toast.error("Bina adı gerekli");
      return;
    }

    try {
      if (editingBuilding) {
        const success = await storageService.updateBuilding(editingBuilding.id, newBuildingName, newBuildingColor);
        if (!success) {
          toast.error("Bina güncellenemedi");
          return;
        }
        toast.success("Bina güncellendi");
      } else {
        const newBuilding = await storageService.addBuilding(newBuildingName, newBuildingColor);
        if (!newBuilding) {
          toast.error("Bina eklenemedi");
          return;
        }
        toast.success("Bina eklendi");
      }

      // State'leri temizle
      setEditingBuilding(null);
      setNewBuildingName("");
      setNewBuildingColor(colorOptions[0].value);
      
      // Dialog'u kapat
      setIsEditDialogOpen(false);
      
      // Binaları yeniden yükle
      await loadBuildings();
    } catch (error: any) {
      console.error("❌ handleSaveBuilding hatası:", error);
      toast.error("Hata: " + error.message);
    }
  };

  const handleAddNew = () => {
    setEditingBuilding(null);
    setNewBuildingName("");
    setNewBuildingColor(colorOptions[0].value);
    setIsEditDialogOpen(true);
  };

  const handleExportAll = async () => {
    const totalCameras = buildings.reduce((sum, b) => sum + getBuildingCameraCount(b.id), 0);
    
    if (totalCameras === 0) {
      toast.error("Dışa aktarılacak kayıt yok");
      return;
    }

    try {
      await exportAllBuildingsToExcel(buildings, async (buildingId) => 
        await storageService.getRecordsByBuilding(buildingId)
      );
      toast.success("Toplu rapor hazırlandı");
    } catch (error) {
      toast.error("Dışa aktarma başarısız");
      console.error(error);
    }
  };

  const handleBackupDownload = async () => {
    try {
      const allBuildings = await storageService.getAllBuildings();
      const allCameras = await storageService.getAllRecords();
      
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: {
          buildings: allBuildings,
          cameras: allCameras,
        }
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kamera-yedek-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("Yedek indirildi!");
    } catch (error) {
      toast.error("Yedekleme başarısız");
      console.error(error);
    }
  };

  const handleBackupRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        
        if (!backup.data || !backup.data.buildings || !backup.data.cameras) {
          toast.error("Geçersiz yedek dosyası");
          return;
        }

        if (confirm("Mevcut tüm veriler silinip yedek yüklenecek. Emin misiniz?")) {
          localStorage.setItem('buildings', JSON.stringify(backup.data.buildings));
          localStorage.setItem('camera_records', JSON.stringify(backup.data.cameras));
          
          toast.success("Yedek geri yüklendi!");
          loadBuildings();
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (error) {
        toast.error("Yedek dosyası okunamadı");
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleLogout = () => {
    if (confirm("Çıkış yapmak istediğinizden emin misiniz?")) {
      localStorage.removeItem("currentUser");
      toast.success("Çıkış yapıldı");
      navigate("/login");
    }
  };

  const handleBulkDelete = (type: "all-faulty" | "all-working") => {
    setBulkDeleteType(type);
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeleteType) return;

    let totalDeleted = 0;
    
    for (const building of buildings) {
      const cameras = await storageService.getRecordsByBuilding(building.id);
      let camerasToDelete = [];
      
      if (bulkDeleteType === "all-faulty") {
        camerasToDelete = cameras.filter(c => 
          c.result !== "Sorunsuz Çalışıyor" && c.result !== "Arıza Giderildi" && c.result !== "İade Edildi"
        );
      } else if (bulkDeleteType === "all-working") {
        camerasToDelete = cameras.filter(c => 
          c.result === "Sorunsuz Çalışıyor" || c.result === "Arıza Giderildi"
        );
      }

      for (const camera of camerasToDelete) {
        await storageService.deleteRecord(camera.id);
        totalDeleted++;
      }
    }

    toast.success(`${totalDeleted} kamera silindi`);
    setBulkDeleteType(null);
    await loadBuildings();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gradient-primary shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl backdrop-blur-sm">
                <Camera className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Kamera Takip Sistemi</h1>
                <p className="text-sm text-white/90">
                  Gençlik ve Spor Bakanlığı • {currentUser.name || "Kullanıcı"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
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
                    onClick={() => handleBulkDelete("all-working")}
                    className="gap-2 text-green-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Tüm Çalışanları Sil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleBulkDelete("all-faulty")}
                    className="gap-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Tüm Arızalıları Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2"
                  >
                    <Database className="h-4 w-4" />
                    <span className="hidden sm:inline">Yedek</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleBackupDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Yedek İndir
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      Yedek Yükle
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleBackupRestore}
                        className="hidden"
                      />
                    </label>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportAll} className="gap-2">
                    <Download className="h-4 w-4" />
                    Excel Raporu
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={handleAddNew}
                size="sm"
                variant="secondary"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Bina Ekle</span>
              </Button>
              <Button
                onClick={() => navigate("/change-password")}
                size="sm"
                variant="ghost"
                className="gap-2 text-white hover:bg-white/20"
              >
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">Şifre</span>
              </Button>
              <Button
                onClick={handleLogout}
                size="sm"
                variant="ghost"
                className="gap-2 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
                {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow">
            <p className="text-sm text-muted-foreground mb-1">Toplam Bina</p>
            <p className="text-3xl font-bold text-primary">{buildings.length}</p>
          </Card>
          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow">
            <p className="text-sm text-muted-foreground mb-1">Toplam Kamera</p>
            <p className="text-3xl font-bold text-blue-600">
              {buildings.reduce((sum, b) => sum + getBuildingCameraCount(b.id), 0)}
            </p>
          </Card>
          <Card 
            className="p-4 bg-white shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-red-500"
            onClick={() => navigate("/faulty")}
          >
            <p className="text-sm text-muted-foreground mb-1">Arızalı</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-red-600">
                {buildings.reduce((sum, b) => sum + getBuildingFaultCount(b.id), 0)}
              </p>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600">
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </Card>
          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow">
            <p className="text-sm text-muted-foreground mb-1">Çalışan</p>
            <p className="text-3xl font-bold text-green-600">
              {buildings.reduce((sum, b) => {
                const total = getBuildingCameraCount(b.id);
                const faulty = getBuildingFaultCount(b.id);
                return sum + (total - faulty);
              }, 0)}
            </p>
          </Card>
        </div>

        {/* Buildings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {buildings.map((building) => {
            const cameraCount = getBuildingCameraCount(building.id);
            const faultCount = getBuildingFaultCount(building.id);
            
            return (
              <Card
                key={building.id}
                className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/building/${building.id}`)}
              >
                {/* Color bar */}
                <div className={`h-2 ${building.color}`} />
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${building.color} p-3 rounded-xl text-white`}>
                      <Building2 className="h-6 w-6" />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditBuilding(building);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-4 line-clamp-2 min-h-[3.5rem]">
                    {building.name}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Toplam Kamera</span>
                      <Badge variant="outline" className="font-bold">
                        {cameraCount}
                      </Badge>
                    </div>
                    {faultCount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-600">Arızalı</span>
                        <Badge variant="destructive">
                          {faultCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            );
          })}
        </div>

        {buildings.length === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Henüz bina yok</h3>
            <p className="text-muted-foreground mb-6">
              Bina eklemek için yukarıdaki "Bina Ekle" butonuna tıklayın
            </p>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 border-t border-purple-700 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-400 to-purple-400 animate-pulse"></div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <p className="relative text-center text-base px-4 py-2 bg-gray-900/50 rounded-lg backdrop-blur-sm">
                  <span className="text-gray-300">Tasarlayan: </span>
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">
                    Yusuf DOLU
                  </span>
                </p>
              </div>
              <div className="h-px w-12 bg-gradient-to-r from-purple-400 to-transparent animate-pulse"></div>
            </div>
            <p className="text-xs text-purple-300/70">© 2025 Tüm hakları saklıdır</p>
          </div>
        </div>
      </footer>

      {/* Edit/Add Building Dialog */}
      <Dialog 
        key={editingBuilding?.id || 'new'}
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // Dialog kapanırken state temizle
            setEditingBuilding(null);
            setNewBuildingName("");
            setNewBuildingColor(colorOptions[0].value);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBuilding ? "Bina Düzenle" : "Yeni Bina Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buildingName">Bina Adı</Label>
              <Input
                id="buildingName"
                value={newBuildingName}
                onChange={(e) => setNewBuildingName(e.target.value)}
                placeholder="Örn: Abdurrahman Gazi Kız Yurdu"
              />
            </div>
            <div className="space-y-2">
              <Label>Renk</Label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewBuildingColor(color.value)}
                    className={`h-12 rounded-lg ${color.value} ${
                      newBuildingColor === color.value
                        ? "ring-4 ring-offset-2 ring-gray-400"
                        : "hover:scale-110"
                    } transition-all`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveBuilding} className="flex-1">
                {editingBuilding ? "Güncelle" : "Ekle"}
              </Button>
              {editingBuilding && (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (confirm("Bu binayı silmek istediğinizden emin misiniz? İçindeki tüm kameralar da silinecek!")) {
                      try {
                        await storageService.deleteBuilding(editingBuilding.id);
                        toast.success("Bina silindi");
                        
                        // State temizle
                        setEditingBuilding(null);
                        setNewBuildingName("");
                        setNewBuildingColor(colorOptions[0].value);
                        
                        // Dialog kapat
                        setIsEditDialogOpen(false);
                        
                        // Listeyi güncelle
                        await loadBuildings();
                      } catch (error: any) {
                        toast.error("Bina silinemedi: " + error.message);
                      }
                    }
                  }}
                >
                  Sil
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog 
        key={bulkDeleteType || 'none'}
        open={!!bulkDeleteType} 
        onOpenChange={() => setBulkDeleteType(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkDeleteType === "all-working" ? "Tüm Çalışan Kameraları" : "Tüm Arızalı Kameraları"} Silmek İstediğinize Emin Misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Tüm binalardaki 
              {bulkDeleteType === "all-working" && (
                <span className="block mt-2 font-semibold text-green-600">
                  çalışan kameralar
                </span>
              )}
              {bulkDeleteType === "all-faulty" && (
                <span className="block mt-2 font-semibold text-red-600">
                  arızalı kameralar
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

export default BuildingList;
