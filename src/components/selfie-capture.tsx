"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import {
  Camera,
  RotateCcw,
  Upload,
  SwitchCamera,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SelfieCaptureProps {
  value: string | null | undefined;
  onChange: (dataUrl: string | null) => void;
}

export function SelfieCapture({ value, onChange }: SelfieCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    setIsFlashing(true);
    setTimeout(() => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        onChange(imageSrc);
        setIsCameraActive(false);
        setCameraError(null);
      }
      setIsFlashing(false);
    }, 150);
  }, [onChange]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCameraError("لطفاً یک فایل تصویری معتبر انتخاب کنید.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
        setIsCameraActive(false);
        setCameraError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  if (value) {
    return (
      <div className="flex flex-col items-center gap-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 backdrop-blur-md">
        <div className="relative h-44 w-44 overflow-hidden rounded-2xl border-2 border-emerald-500/50 shadow-lg shadow-emerald-950/50">
          <Image
            src={value}
            alt="تصویر سلفی ورزشکار"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute bottom-2 left-2">
            <Badge variant="default" className="shadow">
              <CheckCircle2 className="h-3 w-3" /> ثبت شد
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onChange(null);
              setIsCameraActive(true);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            عکس مجدد
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-rose-400 hover:text-rose-300"
            onClick={() => onChange(null)}
          >
            حذف تصویر
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-elevated)] p-4 transition-all">
      {isCameraActive ? (
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="relative h-56 w-56 max-w-full overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-black shadow-2xl">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode,
                width: 720,
                height: 720,
              }}
              className="h-full w-full object-cover"
              onUserMediaError={() => {
                setCameraError(
                  "دسترسی به دوربین توسط مرورگر مسدود شده است یا وب‌کم متصل نیست. می‌توانید عکس را آپلود کنید."
                );
                setIsCameraActive(false);
              }}
            />

            {/* Karate silhouette / Target viewfinder ring */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-36 rounded-full border border-dashed border-emerald-400/60 opacity-70" />
            </div>

            {/* Shutter flash effect */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white transition-opacity duration-150" />
            )}

            <div className="absolute top-2 right-2">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90 backdrop-blur-md cursor-pointer"
                title="تغییر دوربین"
              >
                <SwitchCamera className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={capture}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Camera className="h-4 w-4" />
              ثبت فریم
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCameraActive(false)}
            >
              انصراف
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2 text-center w-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] shadow-xs">
            <User className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[var(--text-primary)]">
              تصویر پرتره / سلفی ورزشکار
            </p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              جهت درج در شناسنامه ورزشی و خروجی گزارش PDF باشگاه
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCameraError(null);
                setIsCameraActive(true);
              }}
            >
              <Camera className="h-3.5 w-3.5 text-emerald-600" />
              باز کردن وب‌کم
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5 text-emerald-600" />
              آپلود فایل
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}

      {cameraError && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{cameraError}</span>
        </div>
      )}
    </div>
  );
}
