import { toProductGender } from './outfit-all-interface';

describe('toProductGender', () => {
  it('normalizes outfit and product gender values', () => {
    expect(toProductGender('man')).toBe('U');
    expect(toProductGender('woman')).toBe('D');
    expect(toProductGender('U')).toBe('U');
    expect(toProductGender('D')).toBe('D');
    expect(toProductGender('unknown')).toBe('');
  });
});
