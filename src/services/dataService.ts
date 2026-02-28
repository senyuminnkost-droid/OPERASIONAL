
import { getSupabase } from './supabaseClient';
import { Room, Complaint, Tenant, Staff, FinanceTransaction, OperationalReminder } from '../types';

export const dataService = {
  // Rooms
  async getRooms() {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('rooms').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data as Room[];
  },
  async updateRoom(roomId: number, updates: Partial<Room>) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('rooms').update(updates).eq('id', roomId);
    if (error) throw error;
  },

  // Complaints
  async getComplaints() {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('complaints').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data as Complaint[];
  },
  async addComplaint(complaint: Complaint) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('complaints').insert([complaint]);
    if (error) throw error;
  },
  async updateComplaint(id: string, updates: Partial<Complaint>) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('complaints').update(updates).eq('id', id);
    if (error) throw error;
  },

  // Tenants
  async getTenants() {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('tenants').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data as Tenant[];
  },
  async addTenant(tenant: Tenant) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('tenants').insert([tenant]);
    if (error) throw error;
  },
  async updateTenant(id: string, updates: Partial<Tenant>) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('tenants').update(updates).eq('id', id);
    if (error) throw error;
  },

  // Staff
  async getStaff() {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('staff').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data as Staff[];
  },
  async addStaff(staff: Staff) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('staff').insert([staff]);
    if (error) throw error;
  },
  async updateStaff(id: string, updates: Partial<Staff>) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('staff').update(updates).eq('id', id);
    if (error) throw error;
  },

  // Finance
  async getFinance() {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('finance').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data as FinanceTransaction[];
  },
  async addFinance(transaction: FinanceTransaction) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('finance').insert([transaction]);
    if (error) throw error;
  },

  // Reminders
  async getReminders() {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('reminders').select('*').order('date', { ascending: true });
    if (error) throw error;
    return data as OperationalReminder[];
  },
  async addReminder(reminder: OperationalReminder) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('reminders').insert([reminder]);
    if (error) throw error;
  },
  async updateReminder(id: string, updates: Partial<OperationalReminder>) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('reminders').update(updates).eq('id', id);
    if (error) throw error;
  }
};
