"use client";

import type { Registration } from "@/lib/types";
import { markAttendance } from "@/lib/actions";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, UserCheck } from "lucide-react";

interface AttendanceTabProps {
  registrations: Registration[];
  eventId: string;
}

export default function AttendanceTab({ registrations, eventId }: AttendanceTabProps) {
  const [scannedId, setScannedId] = useState("");
  const { toast } = useToast();

  const bookedRegistrations = registrations.filter(r => r.status === 'booked');
  
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
          <CardDescription>Enter the scanned QR data to check in an attendee.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Paste QR code data here..."
              value={scannedId}
              onChange={(e) => setScannedId(e.target.value)}
            />
            <Button onClick={handleCheckIn}>Check In</Button>
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
