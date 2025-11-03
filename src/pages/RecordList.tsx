import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceRecord } from "@/types/record";
import { storageService } from "@/lib/storage";
import { exportToExcelCapacitor } from "@/lib/capacitor-excel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Search, Wrench } from "lucide-react";
import { toast } from "sonner";

const RecordList = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [searchQuery, records]);

  const loadRecords = () => {
    const allRecords = storageService.getAllRecords();
    // Tarihe göre azalan sıralama (en yeni önce)
    const sortedRecords = allRecords.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setRecords(sortedRecords);
  };

  const filterRecords = () => {
    if (!searchQuery.trim()) {
      setFilteredRecords(records);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = records.filter(record => 
      record.deviceName.toLowerCase().includes(query) ||
      record.brand.toLowerCase().includes(query) ||
      record.model.toLowerCase().includes(query) ||
      record.department.toLowerCase().includes(query) ||
      record.serialNumber.toString().includes(query)
    );
    setFilteredRecords(filtered);
  };

  const handleExport = async () => {
    if (records.length === 0) {
      toast.error("Dışa aktarılacak kayıt yok");
      return;
    }
    try {
      await exportToExcelCapacitor(records);
      toast.success("Excel dosyası hazırlandı");
    } catch (error) {
      toast.error("Dışa aktarma başarısız");
      console.error(error);
    }
  };

  const getResultBadgeVariant = (result: string) => {
    if (result === "Arıza Giderildi") return "default";
    if (result === "Parça Bekleniyor") return "secondary";
    if (result === "Onarım Devam Ediyor") return "secondary";
    if (result === "İade Edildi") return "outline";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gradient-primary shadow-elevated">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Teknik Servis</h1>
                <p className="text-sm text-white/80">Arıza Kayıt Defteri</p>
              </div>
            </div>
            <Button
              onClick={handleExport}
              size="sm"
              variant="secondary"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Excel'e Aktar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cihaz, marka, model veya birim ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-gradient-card shadow-card">
            <p className="text-sm text-muted-foreground mb-1">Toplam Kayıt</p>
            <p className="text-2xl font-bold text-primary">{records.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-card shadow-card">
            <p className="text-sm text-muted-foreground mb-1">Bu Ayki Kayıt</p>
            <p className="text-2xl font-bold text-accent">
              {records.filter(r => {
                const recordDate = new Date(r.date);
                const now = new Date();
                return recordDate.getMonth() === now.getMonth() && 
                       recordDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </Card>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <Card className="p-12 text-center shadow-card">
            <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "Kayıt bulunamadı" : "Henüz kayıt yok"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Arama kriterlerinize uygun kayıt bulunamadı"
                : "Yeni bir arıza kaydı eklemek için + butonuna tıklayın"
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <Card
                key={record.id}
                onClick={() => navigate(`/record/${record.id}`)}
                className="p-4 cursor-pointer hover:shadow-elevated transition-all active:scale-[0.98] bg-gradient-card shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono shrink-0">
                        #{record.serialNumber}
                      </Badge>
                      <h3 className="font-semibold text-foreground truncate">
                        {record.deviceName}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {record.brand} {record.model && `- ${record.model}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {record.department}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={getResultBadgeVariant(record.result)} className="mb-2 whitespace-nowrap">
                      {record.result}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.date).toLocaleDateString('tr-TR')}
                    </p>
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
          onClick={() => navigate("/new")}
          size="lg"
          className="h-14 w-14 rounded-full shadow-elevated hover:scale-110 transition-transform bg-gradient-primary"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default RecordList;
