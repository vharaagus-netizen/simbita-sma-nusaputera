import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface FeatureSettings {
  defense_scheduling: boolean
  defense_scoring: boolean
}

export async function getFeatureSettings(): Promise<FeatureSettings> {
  const defaults: FeatureSettings = {
    defense_scheduling: false,
    defense_scoring: false,
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')

    if (error || !data) {
      return defaults
    }

    const settings = { ...defaults }
    for (const item of data) {
      if (item.key === 'feature_defense_scheduling') {
        settings.defense_scheduling = Boolean(item.value)
      } else if (item.key === 'feature_defense_scoring') {
        settings.defense_scoring = Boolean(item.value)
      }
    }

    return settings
  } catch {
    return defaults
  }
}

export async function toggleFeatureSetting(key: 'feature_defense_scheduling' | 'feature_defense_scoring', value: boolean) {
  try {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('app_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      return { error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Gagal mengubah pengaturan fitur' }
  }
}

