import { supabase } from './supabaseClient';

export type Case = {
  id: any;
  case_number: string;
  title: string;
  client_id: any;
  court?: string | null;
  status: 'Open' | 'Closed' | 'Pending';
  created_at?: string;
};

export type CaseInput = Omit<Case, 'id' | 'created_at'>;

// جلب جميع القضايا
export async function getCases(): Promise<Case[]> {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('Error in getCases:', error);
    return [];
  }
}

// جلب القضايا الخاصة بعميل معين
export async function getCasesByClient(clientId: any): Promise<Case[]> {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('Error in getCasesByClient:', error);
    return [];
  }
}

// إضافة قضية جديدة
export async function createCase(input: CaseInput): Promise<Case | null> {
  try {
    const { data, error } = await supabase
      .from('cases')
      .insert([input])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in createCase:', error);
    throw error;
  }
}

// تحديث قضية
export async function updateCase(id: any, input: Partial<CaseInput>): Promise<Case | null> {
  try {
    const { data, error } = await supabase
      .from('cases')
      .update(input)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in updateCase:', error);
    throw error;
  }
}

// حذف قضية
export async function deleteCase(id: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error in deleteCase:', error);
    throw error;
  }
}