import { supabase, type EventItem, type EventInput } from './supabaseClient';

export type { EventItem, EventInput };

export async function getEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getEventsByCase(caseId: number): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('case_id', caseId)
    .order('event_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getEventsByDate(date: string): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_date', date)
    .order('event_time', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function createEvent(input: EventInput): Promise<EventItem> {
  const { data, error } = await supabase
    .from('events')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: number, input: Partial<EventInput>): Promise<EventItem> {
  const { data, error } = await supabase
    .from('events')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id: number): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
