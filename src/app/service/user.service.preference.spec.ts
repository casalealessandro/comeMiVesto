import { UserService } from './user.service';

describe('UserService preference payload', () => {
  const service = Object.create(UserService.prototype) as UserService;

  it('maps the complete payload without uid', () => {
    expect(service.toOutfitPreferencePayload({
      uid: 'firebase-uid', color: ['N'], brend: ['BV'], style: ['C']
    })).toEqual({ color: ['N'], brend: ['BV'], style: ['C'] });
  });

  it('uses empty arrays when preferences are absent', () => {
    expect(service.toOutfitPreferencePayload(null)).toEqual({
      color: [], brend: [], style: []
    });
  });

  it('normalizes missing arrays', () => {
    expect(service.toOutfitPreferencePayload({ uid: 'uid' })).toEqual({
      color: [], brend: [], style: []
    });
  });
});
