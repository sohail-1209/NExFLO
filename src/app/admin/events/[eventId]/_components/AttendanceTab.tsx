"use client";

import type { Registration } from "@/lib/types";
import { markAttendance } from "@/lib/actions";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, UserCheck, VideoOff, XCircle, Clock, List, QrCode } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import jsQR from "jsqr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AttendanceTabProps {
  registrations: Registration[];
  eventId: string;
}

const statusConfig = {
    booked: { label: 'Booked', color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
    waitlisted: { label: 'Waitlisted', color: 'bg-yellow-500', icon: <List className="h-3 w-3" /> },
    pending: { label: 'Pending', color: 'bg-gray-500', icon: <Clock className="h-3 w-3" /> },
};


export default function AttendanceTab({ registrations, eventId }: AttendanceTabProps) {
  const [scannedId, setScannedId] = useState("");
  const [scannedRegistration, setScannedRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current && !scannedRegistration) {
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

          if (code && code.data !== scannedId) {
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
  }, [hasCameraPermission, scannedId, scannedRegistration]);

   useEffect(() => {
    if (!scannedId) {
        setScannedRegistration(null);
        setError(null);
        return;
    };
    
    let registrationId = scannedId;
    try {
        const jsonData = JSON.parse(scannedId);
        if (jsonData.registrationId) {
            registrationId = jsonData.registrationId;
        }
    } catch(e) {
        // Not a JSON string, assume it's the raw ID
    }

    const registration = registrations.find(r => r.id === registrationId);

    if (registration) {
      setScannedRegistration(registration);
      setError(null);
    } else {
      setScannedRegistration(null);
      setError("No matching registration found for this event.");
    }
  }, [scannedId, registrations]);
  
  const handleCheckIn = async () => {
    if (!scannedRegistration) return;
    
    const result = await markAttendance(scannedRegistration.id, eventId);

    if (result.success) {
      toast({
        title: "Check-in Successful",
        description: result.message,
      });
      // Update local state to reflect check-in
       setScannedRegistration(prev => prev ? {...prev, attended: true} : null);
    } else {
      toast({
        title: "Check-in Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };
  
  const clearScan = () => {
    setScannedId("");
    setScannedRegistration(null);
    setError(null);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
       <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>Scan a pass to retrieve attendee details and check them in.</CardDescription>
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
            {scannedRegistration ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${scannedRegistration.studentName}`} />
                            <AvatarFallback>{scannedRegistration.studentName.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-bold">{scannedRegistration.studentName}</h3>
                            <p className="text-muted-foreground">{scannedRegistration.studentEmail}</p>
                            <p className="text-sm text-muted-foreground">{scannedRegistration.rollNumber} &bull; {scannedRegistration.branch}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-medium">Status</p>
                            <Badge className="flex items-center gap-1.5 w-fit" style={{ backgroundColor: statusConfig[scannedRegistration.status].color }}>
                                {statusConfig[scannedRegistration.status].icon}
                                {statusConfig[scannedRegistration.status].label}
                            </Badge>
                        </div>
                        <div>
                            <p className="font-medium">Checked In?</p>
                            <Badge variant={scannedRegistration.attended ? 'default' : 'secondary'} className={scannedRegistration.attended ? "bg-green-500" : ""}>
                                {scannedRegistration.attended ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                                {scannedRegistration.attended ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                    </div>
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center text-center h-48 bg-muted/50 rounded-lg">
                    <QrCode className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                        {error ? error : "Point the camera at a QR code to begin."}
                    </p>
                </div>
            )}
        </CardContent>
        {scannedRegistration && (
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={clearScan}>Clear</Button>
                {scannedRegistration.status === 'booked' ? (
                     <Button onClick={handleCheckIn} disabled={scannedRegistration.attended}>
                        <UserCheck className="mr-2 h-4 w-4"/>
                        {scannedRegistration.attended ? 'Already Checked In' : 'Confirm Check-in'}
                    </Button>
                ) : (
                    <Button variant="secondary" disabled>Cannot Check-in</Button>
                )}
            </CardFooter>
        )}
      </Card>


       <div className="md:col-span-2">
        <Card>
            <CardHeader>
            <CardTitle>Attendance Sheet</CardTitle>
            <CardDescription>List of all booked and checked-in attendees for this event.</CardDescription>
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
    </div>
  );
}
