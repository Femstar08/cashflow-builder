"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Event, EventType, UUID } from "@/types/database";
import * as eventService from "@/lib/data/event-service";

type EventTreeProps = {
  profileId: UUID;
  events: Event[];
  onEventsChange: () => void;
};

export function EventTree({ profileId, events, onEventsChange }: EventTreeProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<UUID | null>(null);

  const handleCreate = async (eventData: Omit<Event, "id" | "profile_id" | "created_at">) => {
    try {
      await eventService.createEvent({
        profile_id: profileId,
        ...eventData,
      });
      setIsCreating(false);
      onEventsChange();
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const handleUpdate = async (eventId: UUID, updates: Partial<Event>) => {
    try {
      await eventService.updateEvent(eventId, updates);
      setEditingId(null);
      onEventsChange();
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const handleDelete = async (eventId: UUID) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventService.deleteEvent(eventId);
      onEventsChange();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <Card
      title="Event Timeline"
      description="Add events to modify your forecast (funding, hires, client wins, price changes)."
      actions={
        !isCreating && (
          <Button onClick={() => setIsCreating(true)} size="sm">
            + Add Event
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {isCreating && (
          <EventForm
            onSave={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        )}
        {events
          .sort((a, b) => a.event_month - b.event_month)
          .map((event) =>
            editingId === event.id ? (
              <EventForm
                key={event.id}
                event={event}
                onSave={(data) => handleUpdate(event.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => setEditingId(event.id)}
                onDelete={() => handleDelete(event.id)}
              />
            )
          )}
        {events.length === 0 && !isCreating && (
          <p className="text-sm text-slate-500 text-center py-8">
            No events yet. Click "Add Event" to create one.
          </p>
        )}
      </div>
    </Card>
  );
}

type EventFormProps = {
  event?: Event;
  onSave: (data: Omit<Event, "id" | "profile_id" | "created_at">) => void;
  onCancel: () => void;
};

function EventForm({ event, onSave, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    event_name: event?.event_name ?? "",
    event_month: event?.event_month ?? 1,
    event_type: (event?.event_type ?? "funding") as EventType,
    amount: event?.amount ?? null,
    percent_change: event?.percent_change ?? null,
    target: event?.target ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      event_name: formData.event_name,
      event_month: formData.event_month,
      event_type: formData.event_type,
      amount: formData.amount,
      percent_change: formData.percent_change,
      target: formData.target || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-slate-200 rounded-lg space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Event Name</label>
          <input
            type="text"
            required
            value={formData.event_name}
            onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#53E9C5]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Event Month</label>
          <input
            type="number"
            min="1"
            max="120"
            required
            value={formData.event_month}
            onChange={(e) => setFormData({ ...formData, event_month: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#53E9C5]"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Event Type</label>
        <select
          value={formData.event_type}
          onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#53E9C5]"
        >
          <option value="funding">Funding</option>
          <option value="hire">Hire</option>
          <option value="client_win">Client Win</option>
          <option value="price_increase">Price Increase</option>
        </select>
      </div>
      {formData.event_type === "funding" || formData.event_type === "hire" || formData.event_type === "client_win" ? (
        <div>
          <label className="text-sm font-medium text-slate-700">Amount (£)</label>
          <input
            type="number"
            min="0"
            value={formData.amount ?? ""}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || null })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#53E9C5]"
          />
        </div>
      ) : null}
      {formData.event_type === "price_increase" ? (
        <div>
          <label className="text-sm font-medium text-slate-700">Percent Change (%)</label>
          <input
            type="number"
            value={formData.percent_change ?? ""}
            onChange={(e) => setFormData({ ...formData, percent_change: parseFloat(e.target.value) || null })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#53E9C5]"
          />
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm">
          {event ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

type EventCardProps = {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
};

function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const getEventIcon = (type: EventType) => {
    // Return empty string - no emojis for clean, professional look
    return "";
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case "funding":
        return "bg-[#53E9C5]/10 border-[#53E9C5]/30";
      case "hire":
        return "bg-slate-100 border-slate-300";
      case "client_win":
        return "bg-green-50 border-green-200";
      case "price_increase":
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-slate-100 border-slate-300";
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getEventColor(event.event_type)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div>
            <h4 className="font-semibold text-slate-900">{event.event_name}</h4>
            <p className="text-sm text-slate-600">
              Month {event.event_month} · {event.event_type.replace("_", " ")}
            </p>
            {event.amount && <p className="text-sm font-medium text-slate-700">£{event.amount.toLocaleString()}</p>}
            {event.percent_change && (
              <p className="text-sm font-medium text-slate-700">+{event.percent_change}%</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

