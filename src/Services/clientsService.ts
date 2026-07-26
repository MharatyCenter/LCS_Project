import { supabase } from './supabaseClient';

export type Client = {
  id: any;
  name: string;
  phone?: string | null;
  email?: string | null;
  national_id?: string | null;
  client_type?: string;
  company?: string | null;
  address?: string | null;
  status?: string;
  notes?: string | null;
  created_at?: string;
};

export type ClientInput = Omit<Client, 'id' | 'created_at'>;

// جلب جميع العملاء مباشرة بدون فلترة بمعرّف المحامي
export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getClients service:', error);
    return [];
  }
}

// إضافة عميل جديد
export async function createClient(client: ClientInput): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in createClient service:', error);
    throw error;
  }
}

export const addClient = createClient;

// تحديث بيانات العميل
export async function updateClient(id: any, client: Partial<ClientInput>): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in updateClient service:', error);
    throw error;
  }
}

// حذف العميل
export async function deleteClient(id: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error in deleteClient service:', error);
    throw error;
  }
}