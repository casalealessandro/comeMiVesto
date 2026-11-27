import { GUEST_NUDGE_AFTER_MS, GuestOutfitNudge } from './guest-outfit-nudge';

describe('GuestOutfitNudge deterministic timer', () => {
  let nudge: GuestOutfitNudge;
  beforeEach(() => { nudge = new GuestOutfitNudge(); });

  it('does not appear before the guest first enters the outfit area', () => {
    expect(nudge.canPromptOnPage('/tabs/myoutfit', 180_000)).toBeFalse();
  });

  it('appears after three minutes on the feed without requiring a scroll or multiple outfits', () => {
    nudge.start(1_000);
    expect(GUEST_NUDGE_AFTER_MS).toBe(180_000);
    expect(nudge.canPromptOnPage('/tabs/myoutfit', 180_999)).toBeFalse();
    expect(nudge.canPromptOnPage('/tabs/myoutfit', 181_000)).toBeTrue();
    expect(nudge.outfitToSaveOnPage('/tabs/myoutfit')).toBeNull();
  });

  it('does not reset the timer when navigating to another outfit', () => {
    nudge.start(1_000);
    nudge.recordRoute('/tabs/detail-outfit/look-a');
    nudge.start(60_000);
    expect(nudge.canPromptOnPage('/tabs/detail-outfit/look-b', 181_000)).toBeTrue();
    expect(nudge.outfitToSaveOnPage('/tabs/detail-outfit/look-b')).toBe('look-b');
  });

  it('retains the last real viewed outfit for the feed CTA', () => {
    nudge.start(0);
    nudge.recordRoute('/tabs/detail-outfit/look-a?source=feed');
    expect(nudge.outfitToSaveOnPage('/tabs/myoutfit')).toBe('look-a');
    expect(nudge.canPromptOnPage('/tabs/myoutfit/', 180_000)).toBeTrue();
  });

  it('does not offer the modal on registration, download, or unrelated routes', () => {
    nudge.start(0);
    const now = 180_000;
    expect(nudge.canPromptOnPage('/guestQuickRegister', now)).toBeFalse();
    expect(nudge.canPromptOnPage('/download', now)).toBeFalse();
    expect(nudge.canPromptOnPage('/tabs/my-profile', now)).toBeFalse();
  });

  it('ignores malformed or encoded-slash outfit IDs', () => {
    nudge.recordRoute('/tabs/detail-outfit/a%2Fb');
    nudge.recordRoute('/tabs/detail-outfit/%XX');
    expect(nudge.outfitToSaveOnPage('/tabs/myoutfit')).toBeNull();
    expect(nudge.outfitToSaveOnPage('/tabs/detail-outfit/a%2Fb')).toBeNull();
  });

  it('resets the timer and last outfit after the guest upgrades their account', () => {
    nudge.start(0);
    nudge.recordRoute('/tabs/detail-outfit/look-a');
    nudge.reset();
    expect(nudge.canPromptOnPage('/tabs/myoutfit', 180_000)).toBeFalse();
    expect(nudge.outfitToSaveOnPage('/tabs/myoutfit')).toBeNull();
  });
});
