import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CameraRecord, Building } from "@/types/record";
import { storageService } from "@/lib/storage";
import { exportToExcelCapacitor } from "@/lib/capacitor-excel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, AlertTriangle, Download, Search, Calendar, MapPin, Wrench } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaultyCameraWithBuilding extends CameraRecord {
  buildingName: string;
  buildingColor: string;
}

const FaultyReport = () => {
  const navigate = useNavigate();
  const [faultyCameras, setFaultyCameras] = useState<FaultyCameraWithBuilding[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCameras, setFilteredCameras] = useState<FaultyCameraWithBuilding[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    loadFaultyCameras();
  }, []);

  useEffect(() => {
    filterCameras();
  }, [searchQuery, faultyCameras]);

  const loadFaultyCameras = async () => {
    const allBuildings = await storageService.getAllBuildings();
    setBuildings(allBuildings);

    const allFaulty: FaultyCameraWithBuilding[] = [];

    for (const building of allBuildings) {
      const cameras = await storageService.getRecordsByBuilding(building.id);
      const faultyCamerasInBuilding = cameras.filter(camera => 
        camera.result !== "Sorunsuz Çalışıyor" && camera.result !== "Arıza Giderildi" && camera.result !== "İade Edildi"
      );

      faultyCamerasInBuilding.forEach(camera => {
        allFaulty.push({
          ...camera,
          buildingName: building.name,
          buildingColor: building.color,
        });
      });
    }

    // Tarihe göre azalan sıralama
    allFaulty.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFaultyCameras(allFaulty);
  };

  const filterCameras = () => {
    if (!searchQuery.trim()) {
      setFilteredCameras(faultyCameras);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = faultyCameras.filter(camera => 
      camera.buildingName.toLowerCase().includes(query) ||
      camera.cameraName.toLowerCase().includes(query) ||
      camera.location.toLowerCase().includes(query) ||
      camera.faultReason.toLowerCase().includes(query) ||
      camera.performedAction.toLowerCase().includes(query)
    );
    setFilteredCameras(filtered);
  };

  const handleExport = async () => {
    if (filteredCameras.length === 0) {
      toast.error("Dışa aktarılacak kayıt yok");
      return;
    }
    try {
      await exportToExcelCapacitor(filteredCameras as any);
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
    return "destructive";
  };

  // Binaya göre grupla
  const groupedByBuilding = filteredCameras.reduce((acc, camera) => {
    if (!acc[camera.buildingName]) {
      acc[camera.buildingName] = [];
    }
    acc[camera.buildingName].push(camera);
    return acc;
  }, {} as Record<string, FaultyCameraWithBuilding[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-orange-600 shadow-elevated">
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
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-white" />
                  <h1 className="text-xl font-bold text-white">Arızalı Kameralar</h1>
                </div>
                <p className="text-sm text-white/80">
                  {faultyCameras.length} Arızalı Kamera • {buildings.length} Bina
                </p>
              </div>
            </div>
            <Button
              onClick={handleExport}
              size="sm"
              variant="secondary"
              className="gap-2 shrink-0"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Bina, kamera, konum veya arıza ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1">Toplam Arızalı</p>
            <p className="text-2xl font-bold text-red-600">{faultyCameras.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1">Parça Bekleniyor</p>
            <p className="text-2xl font-bold text-orange-600">
              {faultyCameras.filter(c => c.result === "Parça Bekleniyor").length}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1">Devam Ediyor</p>
            <p className="text-2xl font-bold text-blue-600">
              {faultyCameras.filter(c => c.result === "Onarım Devam Ediyor").length}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1">Onarılamaz</p>
            <p className="text-2xl font-bold text-gray-600">
              {faultyCameras.filter(c => c.result === "Onarılamaz").length}
            </p>
          </Card>
        </div>

        {/* Cameras List */}
        {filteredCameras.length === 0 ? (
          <Card className="p-12 text-center shadow-card">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "Kayıt bulunamadı" : "Arızalı kamera yok! 🎉"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Arama kriterlerinize uygun arızalı kamera bulunamadı"
                : "Tüm kameralar çalışıyor durumda"
              }
            </p>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {Object.entries(groupedByBuilding).map(([buildingName, cameras]) => {
              const building = buildings.find(b => b.name === buildingName);
              return (
                <AccordionItem 
                  key={buildingName} 
                  value={buildingName}
                  className="border rounded-lg bg-white shadow-md"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-1 h-12 rounded ${building?.color || 'bg-gray-500'}`} />
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-lg">{buildingName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cameras.length} arızalı kamera
                        </p>
                      </div>
                      <Badge variant="destructive" className="mr-2">
                        {cameras.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3 pt-2">
                      {cameras.map((camera) => (
                        <Card
                          key={camera.id}
                          onClick={() => navigate(`/camera/${camera.id}`)}
                          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4"
                          style={{ borderLeftColor: building?.color.replace('bg-', '#') || '#666' }}
                        >
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="font-mono shrink-0">
                                    #{camera.serialNumber}
                                  </Badge>
                                  <h4 className="font-semibold truncate">
                                    {camera.cameraName}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{camera.location}</span>
                                </div>
                              </div>
                              <Badge 
                                variant={getResultBadgeVariant(camera.result)}
                                className={camera.result === "Sorunsuz Çalışıyor" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                              >
                                {camera.result}
                              </Badge>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(camera.date).toLocaleDateString('tr-TR', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}</span>
                            </div>

                            {/* Fault Reason */}
                            {camera.faultReason && (
                              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-red-900 mb-1">
                                      Arıza Sebebi:
                                    </p>
                                    <p className="text-sm text-red-800">
                                      {camera.faultReason}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Performed Action */}
                            {camera.performedAction && (
                              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <Wrench className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-blue-900 mb-1">
                                      Yapılan İşlem:
                                    </p>
                                    <p className="text-sm text-blue-800">
                                      {camera.performedAction}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </main>
    </div>
  );
};

export default FaultyReport;
