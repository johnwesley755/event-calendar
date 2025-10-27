"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { Event } from "@/types";
import { motion, Reorder } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import {
  Bell,
  Bolt,
  Share2,
  Zap,
  Lock,
  Users,
  Calendar as CalendarIcon,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    color: "#3b82f6",
    reminderEnabled: false,
    reminderMinutes: 15,
    isShared: false,
    sharedWith: [] as string[],
  });
  const { user } = useAuth();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setIsDialogOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && isDialogOpen) {
        e.preventDefault();
        handleSaveEvent();
      }
      if (e.key === "Escape" && isDialogOpen) {
        resetEventForm();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isDialogOpen, newEvent]);

  // Load events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      if (user) {
        try {
          const eventsRef = collection(db, "events");
          const q = query(eventsRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);

          const fetchedEvents = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              date: data.date.toDate(),
            } as Event;
          });

          setEvents(fetchedEvents);
          checkReminders(fetchedEvents);
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      }
    };

    fetchEvents();
  }, [user]);

  // AI-powered time suggestions
  const generateAiSuggestions = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const suggestions: string[] = [];

    if (currentHour < 12) {
      suggestions.push(
        "Schedule in the morning (9:00 AM) for peak productivity"
      );
    }

    if (currentHour < 17) {
      suggestions.push("Afternoon slot (2:00 PM) after lunch for meetings");
    }

    const todayEvents = events
      .filter((e) => e.date.toDateString() === date?.toDateString())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todayEvents.length > 0) {
      suggestions.push(
        `You have ${todayEvents.length} events today. Consider spacing them out.`
      );
    } else {
      suggestions.push(
        "No events scheduled today - perfect time to plan ahead!"
      );
    }

    for (let i = 0; i < todayEvents.length - 1; i++) {
      if (todayEvents[i].endTime === todayEvents[i + 1].startTime) {
        suggestions.push("💡 Add buffer time between events to avoid burnout");
        break;
      }
    }

    setAiSuggestions(suggestions);
  }, [events, date]);

  useEffect(() => {
    if (isDialogOpen) {
      generateAiSuggestions();
    }
  }, [isDialogOpen, generateAiSuggestions]);

  // Smart reminders
  const checkReminders = (eventsList: Event[]) => {
    const now = new Date();

    eventsList.forEach((event) => {
      if (event.reminderEnabled && event.reminderMinutes) {
        const eventDate = new Date(event.date);
        const [hours, minutes] = event.startTime.split(":").map(Number);
        eventDate.setHours(hours, minutes, 0, 0);

        const reminderTime = new Date(
          eventDate.getTime() - event.reminderMinutes * 60000
        );

        if (reminderTime > now && reminderTime < addDays(now, 1)) {
          const timeUntilReminder = reminderTime.getTime() - now.getTime();

          setTimeout(() => {
            if (Notification.permission === "granted") {
              new Notification(`Reminder: ${event.title}`, {
                body: `Starting in ${event.reminderMinutes} minutes`,
                icon: "/calendar-icon.png",
              });
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  new Notification(`Reminder: ${event.title}`, {
                    body: `Starting in ${event.reminderMinutes} minutes`,
                  });
                }
              });
            }
          }, timeUntilReminder);
        }
      }
    });
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleSaveEvent = async () => {
    if (!date || !user || !newEvent.title.trim()) return;

    try {
      if (isEditMode && currentEventId) {
        const eventRef = doc(db, "events", currentEventId);
        const updatedEvent = {
          title: newEvent.title,
          description: newEvent.description,
          date: date,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          color: newEvent.color,
          reminderEnabled: newEvent.reminderEnabled,
          reminderMinutes: newEvent.reminderMinutes,
          isShared: newEvent.isShared,
          sharedWith: newEvent.sharedWith,
          updatedAt: new Date(),
        };

        await updateDoc(eventRef, updatedEvent);

        const updatedEvents = events.map((event) =>
          event.id === currentEventId ? { ...event, ...updatedEvent } : event
        );
        setEvents(updatedEvents);
      } else {
        const newEventObj = {
          title: newEvent.title,
          description: newEvent.description,
          date: date,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          userId: user.uid,
          color: newEvent.color,
          reminderEnabled: newEvent.reminderEnabled,
          reminderMinutes: newEvent.reminderMinutes,
          isShared: newEvent.isShared,
          sharedWith: newEvent.sharedWith,
          createdAt: new Date(),
        };

        const docRef = await addDoc(collection(db, "events"), newEventObj);
        const savedEvent = { ...newEventObj, id: docRef.id } as Event;
        setEvents([...events, savedEvent]);

        if (newEvent.reminderEnabled) {
          checkReminders([savedEvent]);
        }
      }

      resetEventForm();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleEditEvent = (eventId: string) => {
    const eventToEdit = events.find((event) => event.id === eventId);
    if (eventToEdit) {
      setNewEvent({
        title: eventToEdit.title,
        description: eventToEdit.description,
        startTime: eventToEdit.startTime,
        endTime: eventToEdit.endTime,
        color: eventToEdit.color || "#3b82f6",
        reminderEnabled: eventToEdit.reminderEnabled || false,
        reminderMinutes: eventToEdit.reminderMinutes || 15,
        isShared: eventToEdit.isShared || false,
        sharedWith: eventToEdit.sharedWith || [],
      });
      setCurrentEventId(eventId);
      setIsEditMode(true);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      const updatedEvents = events.filter((event) => event.id !== eventId);
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  const handleReorder = async (newOrder: Event[]) => {
    setEvents(newOrder);
    try {
      for (let i = 0; i < newOrder.length; i++) {
        const eventRef = doc(db, "events", newOrder[i].id);
        await updateDoc(eventRef, { order: i });
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleShareCalendar = async () => {
    if (!shareEmail.trim() || !currentEventId) return;

    try {
      const eventRef = doc(db, "events", currentEventId);
      const event = events.find((e) => e.id === currentEventId);

      if (event) {
        const updatedSharedWith = [...(event.sharedWith || []), shareEmail];
        await updateDoc(eventRef, {
          isShared: true,
          sharedWith: updatedSharedWith,
        });

        setEvents(
          events.map((e) =>
            e.id === currentEventId
              ? { ...e, isShared: true, sharedWith: updatedSharedWith }
              : e
          )
        );

        setShareEmail("");
        setShareDialogOpen(false);
        alert(`Calendar event shared with ${shareEmail}`);
      }
    } catch (error) {
      console.error("Error sharing event:", error);
      alert("Failed to share event. Please try again.");
    }
  };

  const resetEventForm = () => {
    setNewEvent({
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "10:00",
      color: "#3b82f6",
      reminderEnabled: false,
      reminderMinutes: 15,
      isShared: false,
      sharedWith: [],
    });
    setCurrentEventId(null);
    setIsEditMode(false);
    setIsDialogOpen(false);
    setAiSuggestions([]);
  };

  const eventsForSelectedDate = events
    .filter((event) => event.date.toDateString() === date?.toDateString())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-6 px-4 sm:py-8 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-medium mb-4 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-4 h-4" />
            <span>Smart Calendar</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            Smart Event Calendar
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-6">
            Intelligent scheduling with AI-powered suggestions, smart reminders,
            and seamless team collaboration
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Quick Actions
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-md">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Smart Reminders
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Team Collaboration
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Secure & Private
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Calendar Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    Select Date
                  </h3>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-lg border border-slate-200 bg-white shadow-sm"
                  />
                </div>

                <Dialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    if (!open) resetEventForm();
                    setIsDialogOpen(open);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] py-6">
                      <Zap className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Create Event</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {isEditMode ? "Edit Event" : "Create New Event"}
                      </DialogTitle>
                    </DialogHeader>

                    {/* AI Suggestions */}
                    {aiSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4"
                      >
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-blue-900">
                          <Sparkles className="w-4 h-4" />
                          AI-Powered Suggestions
                        </h4>
                        <ul className="text-sm space-y-2">
                          {aiSuggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              className="text-slate-700 flex items-start gap-2"
                            >
                              <span className="text-blue-600 mt-0.5">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    <div className="space-y-5 py-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="title"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Event Title *
                        </Label>
                        <Input
                          id="title"
                          value={newEvent.title}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                          }
                          placeholder="Team Meeting"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newEvent.description}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              description: e.target.value,
                            })
                          }
                          placeholder="Discuss Q4 goals and project timeline"
                          rows={3}
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="startTime"
                            className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            Start Time
                          </Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={newEvent.startTime}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                startTime: e.target.value,
                              })
                            }
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="endTime"
                            className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            End Time
                          </Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={newEvent.endTime}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                endTime: e.target.value,
                              })
                            }
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">
                          Event Color
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { color: "#3b82f6", name: "Blue" },
                            { color: "#ef4444", name: "Red" },
                            { color: "#10b981", name: "Green" },
                            { color: "#f59e0b", name: "Amber" },
                            { color: "#8b5cf6", name: "Purple" },
                            { color: "#ec4899", name: "Pink" },
                          ].map(({ color, name }) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-12 h-12 rounded-xl transition-all hover:scale-110 shadow-md ${
                                newEvent.color === color
                                  ? "ring-4 ring-offset-2 ring-slate-400 scale-110"
                                  : "hover:shadow-lg"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() =>
                                setNewEvent({ ...newEvent, color })
                              }
                              title={name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Smart Reminders */}
                      <div className="space-y-3 border-t border-slate-200 pt-5">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="reminder"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                          >
                            <Bell className="w-4 h-4 text-amber-600" />
                            Smart Reminder
                          </Label>
                          <Switch
                            id="reminder"
                            checked={newEvent.reminderEnabled}
                            onCheckedChange={(checked) =>
                              setNewEvent({
                                ...newEvent,
                                reminderEnabled: checked,
                              })
                            }
                          />
                        </div>

                        {newEvent.reminderEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="reminderTime"
                              className="text-sm font-medium text-slate-600"
                            >
                              Remind me before
                            </Label>
                            <select
                              id="reminderTime"
                              value={newEvent.reminderMinutes}
                              onChange={(e) =>
                                setNewEvent({
                                  ...newEvent,
                                  reminderMinutes: Number(e.target.value),
                                })
                              }
                              className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            >
                              <option value={5}>5 minutes</option>
                              <option value={15}>15 minutes</option>
                              <option value={30}>30 minutes</option>
                              <option value={60}>1 hour</option>
                              <option value={1440}>1 day</option>
                            </select>
                          </motion.div>
                        )}
                      </div>

                      {/* Team Collaboration */}
                      <div className="space-y-3 border-t border-slate-200 pt-5">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Users className="w-4 h-4 text-purple-600" />
                            Team Collaboration
                          </Label>
                          {isEditMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShareDialogOpen(true);
                              }}
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Event
                            </Button>
                          )}
                        </div>

                        {newEvent.sharedWith &&
                          newEvent.sharedWith.length > 0 && (
                            <div className="text-sm text-slate-600 bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <span className="font-medium">Shared with:</span>{" "}
                              {newEvent.sharedWith.join(", ")}
                            </div>
                          )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          onClick={handleSaveEvent}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg py-6"
                        >
                          <span className="font-semibold">
                            {isEditMode ? "Update Event" : "Save Event"}
                          </span>
                          <span className="ml-2 text-xs opacity-80">
                            (Ctrl+S)
                          </span>
                        </Button>
                        {isEditMode && (
                          <Button
                            variant="destructive"
                            onClick={() => {
                              if (currentEventId)
                                handleDeleteEvent(currentEventId);
                              resetEventForm();
                            }}
                            className="sm:w-auto py-6 shadow-lg"
                          >
                            Delete Event
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Security Badge */}
                <motion.div
                  className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 text-sm text-emerald-900 mb-2">
                    <Bolt className="w-5 h-5" />
                    <span className="font-semibold">Real-time updates</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Changes are synced instantly across all devices using
                    Firebase Realtime Database & Cloud Firestore
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Events List */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                      {date
                        ? format(date, "EEEE, MMMM d, yyyy")
                        : "Select a date"}
                    </h2>
                    {eventsForSelectedDate.length > 0 && (
                      <p className="text-sm text-slate-600 mt-1">
                        {eventsForSelectedDate.length} event
                        {eventsForSelectedDate.length !== 1 ? "s" : ""}{" "}
                        scheduled
                      </p>
                    )}
                  </div>
                </div>

                {eventsForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        Drag events to reorder them
                      </span>
                    </div>

                    <Reorder.Group
                      axis="y"
                      values={eventsForSelectedDate}
                      onReorder={handleReorder}
                      className="space-y-4"
                    >
                      {eventsForSelectedDate.map((event) => (
                        <Reorder.Item key={event.id} value={event}>
                          <motion.div
                            className="relative overflow-hidden group cursor-move bg-white border-2 border-slate-200 rounded-xl hover:shadow-lg transition-all duration-300"
                            style={{
                              borderLeftWidth: "6px",
                              borderLeftColor: event.color || "#3b82f6",
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Gradient Background Effect */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                              style={{
                                background: `linear-gradient(135deg, ${event.color}22 0%, transparent 100%)`,
                              }}
                            />

                            <div className="relative p-5">
                              {/* Action Buttons */}
                              <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 hover:bg-blue-100 hover:text-blue-700 rounded-lg"
                                  onClick={() => handleEditEvent(event.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 hover:bg-red-100 hover:text-red-700 rounded-lg"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
                                </Button>
                              </div>

                              <div className="pr-20">
                                <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight">
                                  {event.title}
                                </h3>
                                {event.description && (
                                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                    {event.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {event.startTime} - {event.endTime}
                                    </span>
                                  </div>

                                  {event.reminderEnabled && (
                                    <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                                      <Bell className="w-4 h-4" />
                                      <span className="font-medium">
                                        {event.reminderMinutes}min before
                                      </span>
                                    </div>
                                  )}

                                  {event.isShared && (
                                    <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                                      <Users className="w-4 h-4" />
                                      <span className="font-medium">
                                        Shared
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                ) : (
                  <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 mb-6">
                      <svg
                        className="w-10 h-10 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      No events scheduled for this day
                    </h3>
                    <p className="text-slate-500 mb-6">
                      Start planning your day by creating your first event
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-600">
                      <kbd className="px-2 py-1 bg-white rounded border border-slate-300 text-xs font-mono">
                        Ctrl
                      </kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-white rounded border border-slate-300 text-xs font-mono">
                        N
                      </kbd>
                      <span className="ml-2">to create an event</span>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              Share Event with Team
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="shareEmail"
                className="text-sm font-semibold text-slate-700"
              >
                Team Member Email
              </Label>
              <Input
                id="shareEmail"
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500">
                They will receive access to view and collaborate on this event
              </p>
            </div>
            <Button
              onClick={handleShareCalendar}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg py-6"
            >
              <Share2 className="w-4 h-4 mr-2" />
              <span className="font-semibold">Share Event</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
