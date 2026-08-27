import { Gender, outfit } from './outfit-all-interface';

describe('Gender contract', () => {
  it('uses U and D directly as the outfit gender domain', () => {
    const genders: Gender[] = ['U', 'D'];
    const outfitGenders: Array<outfit['gender']> = genders;

    expect(outfitGenders).toEqual(['U', 'D']);
  });
});
