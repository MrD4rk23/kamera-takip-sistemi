import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "yusuf23keban";

const USERS = [
  { username: "yusufdolu", password: "123456", name: "Yusuf DOLU" },
  { username: "arifçakır", password: "123456", name: "Arif ÇAKIR" },
  { username: "yakupbahtiyar", password: "123456", name: "Yakup BAHTİYAR" },
];

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Admin şifresi kontrolü - her zaman giriş yapabilir
    if (password === ADMIN_PASSWORD) {
      const adminUser = USERS.find(u => u.username === username);
      if (adminUser) {
        localStorage.setItem("currentUser", JSON.stringify(adminUser));
        toast.success(`Hoş geldiniz, ${adminUser.name}!`);
        setTimeout(() => navigate("/"), 500);
        return;
      }
    }

    // Özel şifre kontrolü (localStorage'dan)
    const savedPasswords = JSON.parse(localStorage.getItem("userPasswords") || "{}");
    const customPassword = savedPasswords[username];
    
    if (customPassword && password === customPassword) {
      const user = USERS.find(u => u.username === username);
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        toast.success(`Hoş geldiniz, ${user.name}!`);
        setTimeout(() => navigate("/"), 500);
        return;
      }
    }

    // Varsayılan şifre kontrolü
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast.success(`Hoş geldiniz, ${user.name}!`);
      setTimeout(() => navigate("/"), 500);
    } else {
      toast.error("Kullanıcı adı veya şifre hatalı!");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e510_1px,transparent_1px),linear-gradient(to_bottom,#4f46e510_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl border border-white/10 bg-white/10 backdrop-blur-2xl overflow-hidden">
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-xl"></div>
        
        <div className="relative bg-slate-900/90 backdrop-blur-xl">
          {/* Header */}
          <div className="p-10 text-center border-b border-white/10">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/50 mb-6 transform hover:scale-110 transition-transform duration-300">
              <Camera className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Kamera Takip Sistemi
            </h1>
            <p className="text-blue-200/70 text-sm font-medium">
              T.C. Gençlik ve Spor Bakanlığı
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-200 font-medium">
                Kullanıcı Adı
              </Label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity"></div>
                <div className="relative flex items-center">
                  <User className="absolute left-4 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adınızı girin"
                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-blue-500/50 transition-all rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200 font-medium">
                Şifre
              </Label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity"></div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifrenizi girin"
                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-purple-500/50 transition-all rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] rounded-xl group"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Giriş Yap</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="px-10 pb-10 border-t border-white/10 pt-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-blue-500/50 to-blue-500/50"></div>
              <div className="relative group cursor-default">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative px-4 py-2 bg-slate-900/90 rounded-lg border border-white/10">
                  <p className="text-sm">
                    <span className="text-gray-400">Tasarlayan: </span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                      Yusuf DOLU
                    </span>
                  </p>
                </div>
              </div>
              <div className="h-px w-12 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              © 2025 Tüm hakları saklıdır
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
