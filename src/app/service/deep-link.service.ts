import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DeepLinkService {
  constructor(private readonly router: Router) {}

  handle(url: string | null | undefined): boolean {
    const outfitId = this.getOutfitId(url);
    if (!outfitId) {
      return false;
    }

    void this.router.navigate(['/detail-outfit', outfitId]);
    return true;
  }

  getOutfitId(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }

    try {
      const parsed = new URL(url);

      if (parsed.protocol === 'comemivesto:' && parsed.hostname === 'outfit') {
        return this.firstPathSegment(parsed.pathname);
      }

      if (parsed.protocol !== 'https:' || parsed.hostname !== 'comemivesto.app') {
        return null;
      }

      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length < 2 || !['detail-outfit', 'outfit'].includes(segments[0])) {
        return null;
      }

      return decodeURIComponent(segments[1]);
    } catch {
      return null;
    }
  }

  private firstPathSegment(pathname: string): string | null {
    const value = pathname.split('/').filter(Boolean)[0];
    return value ? decodeURIComponent(value) : null;
  }
}
