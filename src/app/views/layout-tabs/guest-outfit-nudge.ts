/**
 * Client-only eligibility rules for the guest outfit-save invitation.
 * No account identifiers, analytics, or data are persisted here.
 */
export const GUEST_NUDGE_AFTER_MS = 3 * 60 * 1000;
export const GUEST_NUDGE_MIN_DISTINCT_OUTFITS = 2;

export class GuestOutfitNudge {
  private readonly viewedOutfits = new Set<string>();
  private latestOutfitId: string | null = null;
  private foregroundMs = 0;
  private lastClockMs: number | null = null;
  private wasVisible = false;

  recordRoute(url: string): void {
    const match = /^\/tabs\/detail-outfit\/([^/?#]+)(?:[?#]|$)/.exec(url);
    if (!match) return;
    try {
      const id = decodeURIComponent(match[1]);
      if (!id || id.includes('/') || id.length > 128) return;
      this.viewedOutfits.add(id);
      this.latestOutfitId = id;
    } catch {
      // Ignore malformed URLs rather than using them as registration targets.
    }
  }

  updateVisibility(now: number, visible: boolean): void {
    if (this.lastClockMs !== null && this.wasVisible) {
      this.foregroundMs += Math.max(0, now - this.lastClockMs);
    }
    this.lastClockMs = now;
    this.wasVisible = visible;
  }

  outfitToSaveOnFeed(url: string): string | null {
    if (!/^\/tabs\/myoutfit(?:[?#]|$)/.test(url)) return null;
    if (this.foregroundMs < GUEST_NUDGE_AFTER_MS) return null;
    if (this.viewedOutfits.size < GUEST_NUDGE_MIN_DISTINCT_OUTFITS) return null;
    return this.latestOutfitId;
  }
}
