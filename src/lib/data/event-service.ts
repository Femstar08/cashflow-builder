import * as supabaseService from "@/lib/supabase/service";
import type { Event, EventInsert, UUID } from "@/types/database";

export async function listEvents(profileId: UUID): Promise<Event[]> {
  return supabaseService.listEvents(profileId);
}

export async function createEvent(payload: EventInsert): Promise<Event> {
  return supabaseService.createEvent(payload);
}

export async function updateEvent(eventId: UUID, updates: Partial<Event>): Promise<Event> {
  return supabaseService.updateEvent(eventId, updates);
}

export async function deleteEvent(eventId: UUID): Promise<void> {
  return supabaseService.deleteEvent(eventId);
}

