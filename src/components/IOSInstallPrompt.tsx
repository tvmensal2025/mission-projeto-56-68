import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  const iOSUA = /iphone|ipad|ipod/.test(userAgent);
  const iPadOS13Up =
    navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1;
  return iOSUA || iPadOS13Up;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mediaStandalone = window.matchMedia
    ? window.matchMedia("(display-mode: standalone)").matches
    : false;
  const navigatorStandalone = (window.navigator as any).standalone === true;
  return mediaStandalone || navigatorStandalone;
}

export const IOSInstallPrompt = () => {
  const [visible, setVisible] = useState(false);

  const shouldShow = useMemo(() => {
    if (!isIosDevice()) return false;
    if (isStandalone()) return false;
    try {
      const dismissedAt = localStorage.getItem("iosInstallPromptDismissedAt");
      if (!dismissedAt) return true;
      const elapsed = Date.now() - Number(dismissedAt);
      // show again after 7 days
      return elapsed > 7 * 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
    if (shouldShow) setVisible(true);
  }, [shouldShow]);

  const handleDismiss = () => {
    try {
      localStorage.setItem("iosInstallPromptDismissedAt", String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-primary/20 md:max-w-md md:left-auto md:right-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-foreground font-semibold text-sm">
              Instalar na tela inicial (iOS)
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              Toque em Compartilhar e depois em "Adicionar à Tela de Início" para
              instalar o app.
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Passos: Safari → ícone de Compartilhar → "Adicionar à Tela de Início".
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={handleDismiss} size="sm" variant="outline" className="h-8 text-xs">
                Entendi
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


