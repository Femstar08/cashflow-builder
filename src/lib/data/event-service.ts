import * as instantService from "@/lib/instantdb/service";
import type { Event, EventInsert, UUID } from "@/types/database";

export async function listEvents(profileId: UUID): Promise<Event[]> {
  return instantService.listEvents(profileId);
}

export async function createEvent(payload: EventInsert): Promise<Event> {
  return instantService.createEvent(payload);
}

export async function updateEvent(eventId: UUID, updates: Partial<Event>): Promise<Event> {
  return instantService.updateEvent(eventId, updates);
}

export async function deleteEvent(eventId: UUID): Promise<void> {
  return instantService.deleteEvent(eventId);
}

