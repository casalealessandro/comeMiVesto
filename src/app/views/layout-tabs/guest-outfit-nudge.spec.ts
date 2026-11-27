import {
  GUEST_NUDGE_AFTER_MS,
  GUEST_NUDGE_MIN_DISTINCT_OUTFITS,
  GuestOutfitNudge,
} from './guest-outfit-nudge';

describe('GuestOutfitNudge', () => {
  let nudge: GuestOutfitNudge;

  beforeEach(() => { nudge = new GuestOutfitNudge(); });

  function browseFor(ms: number): void {
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(ms, true);
  }

  it('requires three minutes in the foreground and at least two distinct outfit views', () => {
    expect(GUEST_NUDGE_AFTER_MS).toBe(180000);
    expect(GUEST_NUDGE_MIN_DISTINCT_OUTFITS).toBe(2);
    nudge.recordRoute('/tabs/detail-outfit/a');
    nudge.recordRoute('/tabs/detail-outfit/a');
    browseFor(180000);
    expect(nudge.outfitToSaveOnFeed('/tabs/myoutfit')).toBeNull();

    nudge.recordRoute('/tabs/detail-outfit/b?from=feed');
    expect(nudge.outfitToSaveOnFeed('/tabs/myoutfit')).toBe('b');
  });

  it('never interrupts the outfit detail page', () => {
    nudge.recordRoute('/tabs/detail-outfit/a');
    nudge.recordRoute('/tabs/detail-outfit/b');
    browseFor(190000);
    expect(nudge.outfitToSaveOnFeed('/tabs/detail-outfit/b')).toBeNull();
    expect(nudge.outfitToSaveOnFeed('/tabs/myoutfit')).toBe('b');
  });

  it('does not count time spent in a background tab', () => {
    nudge.recordRoute('/tabs/detail-outfit/a');
    nudge.recordRoute('/tabs/detail-outfit/b');
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(60000, false);
    nudge.updateVisibility(600000, false);
    nudge.updateVisibility(601000, true);
    nudge.updateVisibility(720000, true);
    expect(nudge.outfitToSaveOnFeed('/tabs/myoutfit')).toBeNull();
    nudge.updateVisibility(721000, true);
    expect(nudge.outfitToSaveOnFeed('/tabs/myoutfit')).toBe('b');
  });

  it('remains ineligible if the visitor has not actually browsed for three minutes', () => {
    nudge.recordRoute('/tabs/detail-outfit/a');
    nudge.recordRoute('/tabs/detail-outfit/b');
    browseFor(179999);
    expect(nudge.outfitToSaveOnFeed('/tabs/myoutfit')).toBeNull();
  });

  it('rejects malformed or unrelated detail URLs and does not invent outfit ids', () => {
    nudge.recordRoute('/tabs/detail-outfit/a%2Fb');
    nudge.recordRoute('/tabs/detail-outfit/%XX');
    nudge.recordRoute('/tabs/product/a');
    nudge.recordRoute('/tabs/detail-outfit/a');
    browseFor(180000);
    expect(nudge.outfitToSaveOnFeed('/tabs/myoutfit')).toBeNull();
  });
});

describe('GuestOutfitNudge feed engagement', () => {
  let nudge: GuestOutfitNudge;
  beforeEach(() => { nudge = new GuestOutfitNudge(); });

  it('invites an engaged guest after three minutes even without opening details', () => {
    nudge.recordFeedExploration();
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(180000, true);
    expect(nudge.canPromptOnFeed('/tabs/myoutfit')).toBeTrue();
    expect(nudge.outfitToSaveOnFeed('/tabs/myoutfit')).toBeNull();
  });

  it('does not prompt an idle visitor who has not explored outfits', () => {
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(180000, true);
    expect(nudge.canPromptOnFeed('/tabs/myoutfit')).toBeFalse();
  });

  it('accepts a trailing slash or query parameters on the outfit feed', () => {
    nudge.recordFeedExploration();
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(180000, true);
    expect(nudge.canPromptOnFeed('/tabs/myoutfit/')).toBeTrue();
    expect(nudge.canPromptOnFeed('/tabs/myoutfit?occasion=office')).toBeTrue();
    expect(nudge.canPromptOnFeed('/tabs/detail-outfit/abc')).toBeFalse();
  });

  it('resets prior guest interaction after the account becomes registered', () => {
    nudge.recordRoute('/tabs/detail-outfit/a');
    nudge.recordRoute('/tabs/detail-outfit/b');
    nudge.recordFeedExploration();
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(180000, true);
    expect(nudge.canPromptOnFeed('/tabs/myoutfit')).toBeTrue();
    nudge.reset();
    expect(nudge.canPromptOnFeed('/tabs/myoutfit')).toBeFalse();
  });
});

describe('GuestOutfitNudge centered modal eligibility', () => {
  let nudge: GuestOutfitNudge;
  beforeEach(() => { nudge = new GuestOutfitNudge(); });

  it('offers the CURRENT outfit detail after three minutes in the foreground', () => {
    nudge.recordRoute('/tabs/detail-outfit/look-a');
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(180000, true);
    expect(nudge.canPromptOnPage('/tabs/detail-outfit/look-a')).toBeTrue();
    expect(nudge.outfitToSaveOnPage('/tabs/detail-outfit/look-a')).toBe('look-a');
  });

  it('allows the modal on the feed after a genuine scroll without forcing two detail visits', () => {
    nudge.recordFeedExploration();
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(180000, true);
    expect(nudge.canPromptOnPage('/tabs/myoutfit')).toBeTrue();
    expect(nudge.outfitToSaveOnPage('/tabs/myoutfit')).toBeNull();
  });

  it('does not appear for idle guests or before three minutes', () => {
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(180000, true);
    expect(nudge.canPromptOnPage('/tabs/myoutfit')).toBeFalse();
    nudge.recordFeedExploration();
    nudge.reset();
    nudge.recordFeedExploration();
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(179999, true);
    expect(nudge.canPromptOnPage('/tabs/myoutfit')).toBeFalse();
  });

  it('excludes registration, store download, and unrelated routes', () => {
    nudge.recordRoute('/tabs/detail-outfit/look-a');
    nudge.updateVisibility(0, true);
    nudge.updateVisibility(180000, true);
    expect(nudge.canPromptOnPage('/guestQuickRegister?outfitId=look-a')).toBeFalse();
    expect(nudge.canPromptOnPage('/download')).toBeFalse();
    expect(nudge.canPromptOnPage('/tabs/my-profile')).toBeFalse();
  });
});
