import { Injectable } from '@angular/core';

/**
 * Minimal, deterministic guest prompt eligibility.
 * The clock starts when a guest first reaches the outfit area; it does not
 * depend on a scroll event, visited-card count or repeated visibility updates.
 */
export const GUEST_NUDGE_AFTER_MS = 3 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class GuestOutfitNudge {
  private startedAtMs: number | null = null;
  private latestOutfitId: string | null = null;

  start(now: number): void {
    this.startedAtMs ??= now;
  }

  recordRoute(url: string): void {
    const id = this.detailOutfitId(url);
    if (id) this.latestOutfitId = id;
  }

  canPromptOnPage(url: string, now: number): boolean {
    if (this.startedAtMs === null || now - this.startedAtMs < GUEST_NUDGE_AFTER_MS) {
      return false;
    }
    const path = url.split(/[?#]/, 1)[0].replace(/\/$/, '');
    return path === '/tabs/myoutfit' || this.detailOutfitId(url) !== null;
  }

  outfitToSaveOnPage(url: string): string | null {
    return this.detailOutfitId(url) ?? this.latestOutfitId;
  }

  reset(): void {
    this.startedAtMs = null;
    this.latestOutfitId = null;
  }

  private detailOutfitId(url: string): string | null {
    const match = /^\/tabs\/detail-outfit\/([^/?#]+)(?:[/?#]|$)/.exec(url);
    if (!match) return null;
    try {
      const id = decodeURIComponent(match[1]);
      return id && !id.includes('/') && id.length <= 128 ? id : null;
    } catch {
      return null;
    }
  }
}
