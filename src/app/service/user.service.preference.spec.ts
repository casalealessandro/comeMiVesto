import { UserService } from './user.service';

describe('UserService preference payload', () => {
  const service = Object.create(UserService.prototype) as UserService;

  it('maps the complete payload without uid and preserves brend/uIdBlocked', () => {
    expect(service.toOutfitPreferencePayload({
      uid: 'firebase-uid', color: ['N'], brend: ['BV'], style: ['C'], uIdBlocked: ['blocked']
    })).toEqual({ color: ['N'], brend: ['BV'], style: ['C'], uIdBlocked: ['blocked'] });
  });

  it('uses empty arrays when preferences are absent', () => {
    expect(service.toOutfitPreferencePayload(null)).toEqual({
      color: [], brend: [], style: [], uIdBlocked: []
    });
  });

  it('normalizes missing arrays', () => {
    expect(service.toOutfitPreferencePayload({ uid: 'uid' })).toEqual({
      color: [], brend: [], style: [], uIdBlocked: []
    });
  });
});
