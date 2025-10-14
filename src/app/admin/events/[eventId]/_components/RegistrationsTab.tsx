
"use client";

import type { Registration, Event } from "@/lib/types";
import { updateRegistrationStatus, updateEventPassDetails } from "@/lib/actions";
import { useTransition, useState, useActionState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Clock, ExternalLink, List, MoreVertical, BookImage, Pin, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface RegistrationsTabProps {
  registrations: Registration[];
  event: Event;
}

const statusConfig = {
    booked: { label: 'Booked', color: 'bg-green-500', icon: <Check className="h-3 w-3" /> },
    waitlisted: { label: 'Waitlisted', color: 'bg-yellow-500', icon: <List className="h-3 w-3" /> },
    pending: { label: 'Pending', color: 'bg-gray-500', icon: <Clock className="h-3 w-3" /> },
};

const passInitialState = {
  message: "",
  errors: {},
};


export default function RegistrationsTab({ registrations, event }: RegistrationsTabProps) {
  let [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const updatePassDetailsWithId = updateEventPassDetails.bind(null, event.id);
  const [passState, passFormAction] = useActionState(updatePassDetailsWithId, passInitialState);

  const handleStatusChange = (registrationId: string, status: Registration['status']) => {
    startTransition(() => {
      updateRegistrationStatus(registrationId, event.id, status);
    });
  };

  useEffect(() => {
    if (passState.message) {
      if (passState.message.startsWith("Error")) {
        toast({ title: "Error", description: passState.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: passState.message });
        setOpen(false);
      }
    }
  }, [passState, toast]);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Registrations</CardTitle>
          <CardDescription>Review submissions and manage attendee status.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Configure Pass</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form action={passFormAction}>
                <DialogHeader>
                    <DialogTitle>Configure Event Pass</DialogTitle>
                    <DialogDescription>Set up the details for the automated event pass generation.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2"><BookImage className="w-5 h-5" /> Event Pass Details</h3>
                        <div className="space-y-2">
                            <Label htmlFor="passSubject">Pass Email Subject</Label>
                            <Input id="passSubject" name="passSubject" placeholder="e.g., Your Pass for {eventName} is Here!" defaultValue={event.passSubject} />
                            {passState?.errors?.passSubject && <p className="text-destructive text-sm">{passState.errors.passSubject[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="passBody">Pass Email Body</Label>
                            <Textarea id="passBody" name="passBody" placeholder="e.g., Hi {studentName}, here is your pass!" defaultValue={event.passBody} />
                            {passState?.errors?.passBody && <p className="text-destructive text-sm">{passState.errors.passBody[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="passLayoutUrl">Pass Layout Image</Label>
                            <Input id="passLayoutUrl" name="passLayoutUrl" type="file" accept="image/*" />
                            {event.passLayoutUrl && <p className="text-xs text-muted-foreground mt-1">Current: <Link href={event.passLayoutUrl} target="_blank" className="text-primary hover:underline">View Image</Link>. Upload a new file to replace.</p>}
                            {passState?.errors?.passLayoutUrl && <p className="text-destructive text-sm">{passState.errors.passLayoutUrl[0]}</p>}
                        </div>

                        <div>
                            <Label className="flex items-center gap-2 mb-2"><Pin className="w-4 h-4"/> Text Coordinates</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nameX">Name X</Label>
                                    <Input id="nameX" name="nameX" type="number" placeholder="100" defaultValue={event.nameX}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nameY">Name Y</Label>
                                    <Input id="nameY" name="nameY" type="number" placeholder="100" defaultValue={event.nameY}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rollNumberX">Roll No. X</Label>
                                    <Input id="rollNumberX" name="rollNumberX" type="number" placeholder="100" defaultValue={event.rollNumberX}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rollNumberY">Roll No. Y</Label>
                                    <Input id="rollNumberY" name="rollNumberY" type="number" placeholder="120" defaultValue={event.rollNumberY}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="branchX">Branch X</Label>
                                    <Input id="branchX" name="branchX" type="number" placeholder="100" defaultValue={event.branchX}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="branchY">Branch Y</Label>
                                    <Input id="branchY" name="branchY" type="number" placeholder="140" defaultValue={event.branchY}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="statusX">Status X</Label>
                                    <Input id="statusX" name="statusX" type="number" placeholder="100" defaultValue={event.statusX}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="statusY">Status Y</Label>
                                    <Input id="statusY" name="statusY" type="number" placeholder="160" defaultValue={event.statusY}/>
                                </div>
                            </div>
                            {(passState?.errors as any)?.nameX && <p className="text-destructive text-sm mt-2">All coordinates must be provided.</p>}
                        </div>

                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Configuration</Button>
                </DialogFooter>
              </form>
            </DialogContent>
        </Dialog>

      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>
                  <div className="font-medium">{reg.studentName}</div>
                  <div className="text-sm text-muted-foreground">{reg.studentEmail}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {reg.rollNumber} &bull; {reg.branch} &bull; Year {reg.yearOfStudy}
                  </div>
                   <div className="text-sm text-muted-foreground">
                    {reg.mobileNumber} &bull; {reg.gender} &bull; Laptop: {reg.laptop ? "Yes" : "No"}
                  </div>
                </TableCell>
                <TableCell>
                  {reg.taskSubmission ? (
                    <Dialog>
                      <DialogTrigger asChild>
                         <Button variant="outline" size="sm">
                          View Task <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Task Submission for {reg.studentName}</DialogTitle>
                          <DialogDescription>
                            The following URL was submitted for the task. You can copy it or open it in a new tab.
                          </DialogDescription>
                        </DialogHeader>
                         <div className="p-4 bg-muted rounded-md text-sm break-all">
                            <Link href={reg.taskSubmission} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {reg.taskSubmission}
                            </Link>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not submitted</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                    <Badge className="flex items-center gap-1.5 w-fit mx-auto" style={{ backgroundColor: statusConfig[reg.status].color }}>
                        {statusConfig[reg.status].icon}
                        {statusConfig[reg.status].label}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isPending}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        disabled={!reg.taskSubmission || reg.status === "booked"}
                        onClick={() => handleStatusChange(reg.id, "booked")}
                      >
                        <Check className="mr-2 h-4 w-4" /> Approve (Book)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!reg.taskSubmission || reg.status === "waitlisted"}
                        onClick={() => handleStatusChange(reg.id, "waitlisted")}
                      >
                        <List className="mr-2 h-4 w-4" /> Waitlist
                      </DropdownMenuItem>
                       {reg.status === 'booked' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/mypass/${reg.id}`} target="_blank">
                           <ExternalLink className="mr-2 h-4 w-4" /> View Pass
                          </Link>
                        </DropdownMenuItem>
                       )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {registrations.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No registrations yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
