"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export default function QRCodeDisplay({ url, size = 250 }: QRCodeDisplayProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;

  return (
    <Card className="p-4 inline-block bg-white">
      <Image
        src={qrCodeUrl}
        alt="QR Code"
        width={size}
        height={size}
        priority
      />
    </Card>
  );
}
