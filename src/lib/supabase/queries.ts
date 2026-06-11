/**
 * Centralized data-access helpers.
 * Import createClient() from the appropriate module (client or server)
 * and pass it in, or call these from Server Actions / Route Handlers.
 */
import { createClient } from './client'

type SupabaseClient = ReturnType<typeof createClient>

// ── Households ───────────────────────────────────────────────────────────

export async function getHouseholds(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getHouseholdById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createHousehold(
  supabase: SupabaseClient,
  payload: Parameters<SupabaseClient['from']> extends never
    ? never
    : Awaited<ReturnType<SupabaseClient['from']>> extends never
    ? never
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : any
) {
  const { data, error } = await supabase
    .from('households')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Maternal Records ─────────────────────────────────────────────────────

export async function getMaternalRecords(supabase: SupabaseClient, householdId?: string) {
  let query = supabase.from('maternal_records').select('*').order('created_at', { ascending: false })
  if (householdId) query = query.eq('household_id', householdId)
  const { data, error } = await query
  if (error) throw error
  return data
}

// ── Child Records ────────────────────────────────────────────────────────

export async function getChildRecords(supabase: SupabaseClient, householdId?: string) {
  let query = supabase.from('child_records').select('*').order('created_at', { ascending: false })
  if (householdId) query = query.eq('household_id', householdId)
  const { data, error } = await query
  if (error) throw error
  return data
}

// ── Visit Reports ────────────────────────────────────────────────────────

export async function getVisitReports(supabase: SupabaseClient, filters?: { householdId?: string; hewId?: string; status?: string }) {
  let query = supabase.from('visit_reports').select('*').order('visit_date', { ascending: false })
  if (filters?.householdId) query = query.eq('household_id', filters.householdId)
  if (filters?.hewId)       query = query.eq('hew_id', filters.hewId)
  if (filters?.status)      query = query.eq('status', filters.status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getVisitReportById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('visit_reports')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ── Referrals ────────────────────────────────────────────────────────────

export async function getReferrals(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .order('referral_date', { ascending: false })
  if (error) throw error
  return data
}

// ── Appointments ─────────────────────────────────────────────────────────

export async function getAppointments(supabase: SupabaseClient, status?: string) {
  let query = supabase.from('appointments').select('*').order('date', { ascending: true })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

// ── Notifications ────────────────────────────────────────────────────────

export async function getNotifications(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}

export async function markNotificationRead(supabase: SupabaseClient, id: string) {
  // Cast needed due to @supabase/supabase-js v2 inference limitation on all-optional Update types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { error } = await sb
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
  if (error) throw error
}

// ── Dashboard stats ──────────────────────────────────────────────────────

export async function getDashboardStats(supabase: SupabaseClient) {
  // Avoid Promise.all destructuring — Supabase v2 types collapse to never in tuple inference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const [h, m, c, v, r, a] = await Promise.all([
    sb.from('households').select('*', { count: 'exact', head: true }),
    sb.from('maternal_records').select('*'),
    sb.from('child_records').select('*'),
    sb.from('visit_reports').select('id, risk_flags'),
    sb.from('referrals').select('id, status').eq('status', 'pending'),
    sb.from('appointments').select('id, status').in('status', ['scheduled', 'missed']),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pregnantCount   = (m.data as any[])?.filter((x: any) => x.status === 'pregnant' || x.status === 'both').length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lactatingCount  = (m.data as any[])?.filter((x: any) => x.status === 'lactating' || x.status === 'both').length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const under5Count     = (c.data as any[])?.filter((x: any) => x.age_months < 60).length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const highRiskCount   = (v.data as any[])?.filter((x: any) =>
    (x.risk_flags as Array<{ priority: string }>)?.some((f: { priority: string }) => f.priority === 'high')
  ).length ?? 0

  return {
    totalHouseholds:      (h.count as number) ?? 0,
    pregnantWomen:        pregnantCount,
    lactatingMothers:     lactatingCount,
    childrenUnder5:       under5Count,
    highRiskCases:        highRiskCount,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingReferrals:     (r.data as any[])?.length ?? 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upcomingAppointments: (a.data as any[])?.filter((x: any) => x.status === 'scheduled').length ?? 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    missedAppointments:   (a.data as any[])?.filter((x: any) => x.status === 'missed').length ?? 0,
  }
}
