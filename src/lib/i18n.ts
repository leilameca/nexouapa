import type { Lang } from '@/types'
import es from '@/i18n/es.json'
import en from '@/i18n/en.json'

const dicts = { es, en } as const

type DeepValue<T> = T extends string
  ? string
  : T extends Record<string, unknown>
  ? { [K in keyof T]: DeepValue<T[K]> }
  : never

export type Dict = DeepValue<typeof es>

export function getDict(lang: Lang): Dict {
  return dicts[lang] as Dict
}

export function t(dict: Dict, key: string): string {
  const parts = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let val: any = dict
  for (const p of parts) {
    val = val?.[p]
  }
  return typeof val === 'string' ? val : key
}
