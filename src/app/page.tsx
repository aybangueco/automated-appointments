"use client";

import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { PopoverAnchor } from "@radix-ui/react-popover";
import { Bot, Calendar, Camera, Clock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type MessageType = "error" | "validation_error" | "success";

type Message = {
  type: MessageType;
  message: string;
};

type Appointment = {
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime: string;
};

export default function HomePage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [shootType, setShootType] = useState<string>("");
  const [preferredDate, setPreferredDate] = useState<string>("");
  const [preferredStartTime, setPreferredStartTime] = useState<string>("");
  const [preferredEndTime, setPreferredEndTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<Message | null>(
    null,
  );

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (
      !name ||
      !email ||
      !phone ||
      !shootType ||
      !preferredDate ||
      !preferredStartTime ||
      !preferredEndTime
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const data = {
      name,
      email,
      phone,
      shootType,
      preferredDate,
      preferredStartTime,
      preferredEndTime,
      notes,
    };

    setIsSubmitting(true);
    setSubmissionResult(null);

    const url = "http://localhost:5678/webhook-test/appointment";

    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error submitting appointment");
      }

      const webhookData: Message[] = await response.json();
      setSubmissionResult(webhookData[0]);
    } catch (error) {
      console.error(error);
      alert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const events = appointments.map((item) => ({
    title: "Appointment",
    start: `${item.preferredDate}T${item.preferredStartTime}:00`,
    end: `${item.preferredDate}T${item.preferredEndTime}:00`,
    extendedProps: {
      preferredDate: item.preferredDate,
      preferredStartTime: item.preferredStartTime,
      preferredEndTime: item.preferredEndTime,
    },
  }));

  const fetchAppointments = useCallback(async () => {
    const url = "http://localhost:5678/webhook/month-appointments";

    try {
      const response = await fetch(url, {
        method: "GET",
      });

      const data: Appointment[] = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (submissionResult !== null) {
      switch (submissionResult.type) {
        case "validation_error": {
          toast.error(submissionResult.message);
          break;
        }
      }
    }
  }, [submissionResult]);

  return (
    <div className="min-h-screen bg-background relative p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="pb-2">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "resourceTimelineWeek,dayGridMonth,timeGridWeek",
            }}
            events={events}
            eventClick={(info) => {
              info.jsEvent.preventDefault();

              console.log(info);

              setIsActive(true);
              setSelectedAppointment(info.event.extendedProps as Appointment);
            }}
          />
          <Popover open={isActive} onOpenChange={setIsActive}>
            {selectedAppointment !== null && (
              <>
                {/* REQUIRED invisible anchor */}
                <PopoverAnchor>
                  <div
                    style={{
                      position: "fixed",
                      top: 10,
                      left: 0,
                      width: 1,
                      height: 1,
                    }}
                  />
                </PopoverAnchor>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <h1>Appointment</h1>
                    <p>Date: {selectedAppointment.preferredDate}</p>
                    <p>Start Time: {selectedAppointment.preferredStartTime}</p>
                    <p>End Time: {selectedAppointment.preferredEndTime}</p>
                  </div>
                </PopoverContent>
              </>
            )}
          </Popover>
        </div>
        <Card className="border-border">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold">
                Book Your Photo Session
              </CardTitle>
            </div>
            <CardDescription>
              Fill out the form below to schedule your photography appointment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+63 000 0000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Shoot Type */}
              <div className="space-y-2">
                <Label htmlFor="shootType">Shoot Type *</Label>
                <Select value={shootType} onValueChange={setShootType}>
                  <SelectTrigger id="shootType" className="w-full">
                    <SelectValue placeholder="Select shoot type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time Grid */}
              <div className="grid grid-cols-1">
                {/* Preferred Date */}
                <div className="space-y-2">
                  <Label
                    htmlFor="preferredDate"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Preferred Date *
                  </Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Preferred Start Time */}
                <div className="space-y-2">
                  <Label
                    htmlFor="preferredStartTime"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Preferred Start Time *
                  </Label>
                  <Input
                    id="preferredStartTime"
                    type="time"
                    value={preferredStartTime}
                    onChange={(e) => setPreferredStartTime(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="preferredEndTime"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Preferred End Time *
                  </Label>
                  <Input
                    id="preferredEndTime"
                    type="time"
                    value={preferredEndTime}
                    onChange={(e) => setPreferredEndTime(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Notes Field */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Tell us more about your vision, location preferences, or any special requirements..."
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                disabled={isSubmitting}
                onClick={async () => await handleSubmit()}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <div className="flex items-center">
                    <Camera className="mr-2 h-4 w-4" />
                    Request Booking
                  </div>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                * Required fields
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {submissionResult !== null &&
        submissionResult.type !== "validation_error" &&
        !isSubmitting && (
          <div className="flex justify-center items-center pt-5">
            <div
              className={`max-w-2xl border p-3 rounded-md bg-secondary ${submissionResult.type === "error" ? "border-destructive" : "border-primary"}`}
            >
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Bot />
                Photography Studio Assistant
              </h1>

              <p>{submissionResult.message}</p>
            </div>
          </div>
        )}
    </div>
  );
}
