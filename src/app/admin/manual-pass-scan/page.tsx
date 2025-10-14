
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VideoOff, QrCode } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import jsQR from "jsqr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ScannedData = {
    studentName: string;
    studentEmail: string;
    eventName: string;
    eventDate: string;
    eventVenue: string;
    [key: string]: any;
};

export default function ManualPassScanPage() {
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser to use the scanner.',
        });
      }
    };
    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  useEffect(() => {
    let animationFrameId: number;
    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if(context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data !== lastScannedCode) {
            setLastScannedCode(code.data);
            try {
                const jsonData = JSON.parse(code.data) as ScannedData;
                 if (jsonData.studentName && jsonData.studentEmail && jsonData.eventName) {
                    setScannedData(jsonData);
                    setError(null);
                } else {
                    setError("Invalid manual pass QR code. Missing required fields.");
                    setScannedData(null);
                }
            } catch(e) {
                setError("This QR code does not contain valid manual pass data.");
                setScannedData(null);
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(scan);
    };

    if (hasCameraPermission) {
      animationFrameId = requestAnimationFrame(scan);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasCameraPermission, lastScannedCode]);
  
  const clearScan = () => {
    setLastScannedCode(null);
    setScannedData(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
         <Card>
            <CardHeader>
                <CardTitle>Scan Manual Pass</CardTitle>
                <CardDescription>Scan a manually generated pass to view the details.</CardDescription>
            </CardHeader>
        </Card>
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>QR Code Scanner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="bg-muted rounded-md aspect-video w-full max-w-md mx-auto flex items-center justify-center overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                {hasCameraPermission === false && (
                    <Alert variant="destructive">
                    <VideoOff className="h-4 w-4" />
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access to use the QR scanner.
                    </AlertDescription>
                    </Alert>
                )}
                </CardContent>
            </Card>
      
            <Card>
                <CardHeader>
                <CardTitle>Scanned Details</CardTitle>
                <CardDescription>Attendee information will appear here after a successful scan.</CardDescription>
                </CardHeader>
                <CardContent>
                    {scannedData ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${scannedData.studentName}`} />
                                    <AvatarFallback>{scannedData.studentName.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-bold">{scannedData.studentName}</h3>
                                    <p className="text-muted-foreground text-sm break-all">{scannedData.studentEmail}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 text-sm">
                                <div><p className="font-medium">Event Name</p><p className="text-muted-foreground">{scannedData.eventName}</p></div>
                                <div><p className="font-medium">Event Date</p><p className="text-muted-foreground">{new Date(scannedData.eventDate).toLocaleString()}</p></div>
                                <div><p className="font-medium">Event Venue</p><p className="text-muted-foreground">{scannedData.eventVenue}</p></div>
                                {Object.entries(scannedData).map(([key, value]) => {
                                    if (['studentName', 'studentEmail', 'eventName', 'eventDate', 'eventVenue'].includes(key)) {
                                        return null;
                                    }
                                    return <div key={key}><p className="font-medium capitalize">{key.replace(/_/g, ' ')}</p><p className="text-muted-foreground">{String(value)}</p></div>
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-48 bg-muted/50 rounded-lg p-4">
                            <QrCode className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">
                                {error ? error : "Point the camera at a QR code to begin."}
                            </p>
                        </div>
                    )}
                </CardContent>
                {scannedData && (
                    <CardFooter>
                        <Button variant="ghost" onClick={clearScan}>Clear</Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    </div>
  );
}
