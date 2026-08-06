// ============================================================
// Mock data toggle and helpers
// Set VITE_USE_MOCK=true in .env.development to enable mock data
// ============================================================

export function useMockData(): boolean {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

/**
 * Simulate network latency with random variation
 */
export function mockDelay(baseMs = 300, variance = 200): Promise<void> {
  const ms = baseMs + Math.random() * variance
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a simple unique ID (for mock data only)
 */
export function mockId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
