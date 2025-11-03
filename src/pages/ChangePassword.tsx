import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "yusuf23keban";

const users = [
  { username: "yusufdolu", name: "Yusuf DOLU" },
  { username: "arifçakır", name: "Arif ÇAKIR" },
  { username: "yakupbahtiyar", name: "Yakup BAHTİYAR" },
];

export default function ChangePassword() {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error("Lütfen kullanıcı seçin");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Lütfen yeni şifre girin");
      return;
    }

    if (!adminPassword.trim()) {
      toast.error("Lütfen admin şifresi girin");
      return;
    }

    if (adminPassword !== ADMIN_PASSWORD) {
      toast.error("Hatalı admin şifresi!");
      return;
    }

    // Mevcut şifreleri al
    const passwords = JSON.parse(localStorage.getItem("userPasswords") || "{}");
    
    // Yeni şifreyi kaydet
    passwords[selectedUser] = newPassword;
    localStorage.setItem("userPasswords", JSON.stringify(passwords));

    toast.success(`${users.find(u => u.username === selectedUser)?.name} kullanıcısının şifresi değiştirildi`);
    
    // Formu temizle
    setSelectedUser("");
    setNewPassword("");
    setAdminPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>

      <Card className="w-full max-w-md relative z-10 bg-slate-900/90 backdrop-blur-2xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Şifre Değiştir</CardTitle>
          <p className="text-sm text-gray-400">
            Kullanıcı şifresini değiştirmek için admin şifresi gereklidir
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user" className="text-white">Kullanıcı</Label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="" className="bg-slate-800">Kullanıcı seçin...</option>
                {users.map((user) => (
                  <option key={user.username} value={user.username} className="bg-slate-800">
                    {user.name} ({user.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white">Yeni Şifre</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Yeni şifreyi girin"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-yellow-500" />
                Admin Şifresi
              </Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Admin şifresini girin"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-yellow-500"
              />
              <p className="text-xs text-gray-500">
                Şifre değişikliği için admin yetkilendirmesi gereklidir
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1 border-white/10 text-white hover:bg-white/10"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Şifreyi Değiştir
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
