import { supabase, type Lawyer, type LawyerInput } from '../src/Services/supabaseClient';

export type { Lawyer, LawyerInput };

export async function getLawyers(): Promise<Lawyer[]> {
  const { data, error } = await supabase
    .from('lawyers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createLawyer(input: LawyerInput): Promise<Lawyer> {
  const { data, error } = await supabase
    .from('lawyers')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLawyer(id: number, input: Partial<LawyerInput>): Promise<Lawyer> {
  const { data, error } = await supabase
    .from('lawyers')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLawyer(id: number): Promise<void> {
  const { error } = await supabase.from('lawyers').delete().eq('id', id);
  if (error) throw error;
}
