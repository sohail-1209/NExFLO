"use client";

import type { Registration } from "@/lib/types";
import { markAttendance } from "@/lib/actions";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, UserCheck, Video, VideoOff } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import jsQR from "jsqr";

interface AttendanceTabProps {
  registrations: Registration[];
  eventId: string;
}

export default function AttendanceTab({ registrations, eventId }: AttendanceTabProps) {
  const [scannedId, setScannedId] = useState("");
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bookedRegistrations = registrations.filter(r => r.status === 'booked');

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

    // Cleanup function to stop the video stream
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

          if (code) {
            setScannedId(code.data);
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
  }, [hasCameraPermission]);
  
  const handleCheckIn = async () => {
    if (!scannedId) return;
    
    let registrationId = scannedId;
    try {
        const jsonData = JSON.parse(scannedId);
        if (jsonData.registrationId) {
            registrationId = jsonData.registrationId;
        }
    } catch(e) {
        // Not a JSON string, assume it's the raw ID
    }

    const result = await markAttendance(registrationId, eventId);

    if (result.success) {
      toast({
        title: "Check-in Successful",
        description: result.message,
      });
      setScannedId("");
    } else {
      toast({
        title: "Check-in Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>Scan a pass to check in an attendee, or enter the ID manually.</CardDescription>
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
                Please allow camera access to use the QR scanner. You can still check in attendees manually.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="QR code data will appear here..."
              value={scannedId}
              onChange={(e) => setScannedId(e.target.value)}
            />
            <Button onClick={handleCheckIn} disabled={!scannedId}>Check In</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Sheet</CardTitle>
           <CardDescription>List of all booked attendees for this event.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Attendance Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookedRegistrations.map(reg => (
                    <TableRow key={reg.id}>
                        <TableCell>
                            <div className="font-medium">{reg.studentName}</div>
                            <div className="text-sm text-muted-foreground">{reg.studentEmail}</div>
                        </TableCell>
                        <TableCell className="text-right">
                            {reg.attended ? (
                                <Badge variant="default" className="bg-green-500">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Checked In
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Not present</Badge>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
                 {bookedRegistrations.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center h-24">
                            No booked registrations for this event.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}
