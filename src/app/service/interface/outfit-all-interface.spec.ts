import { Gender, OutfitSeason, OutfitStatus, OutfitStyle, outfit } from './outfit-all-interface';

describe('Outfit domain contract', () => {
  it('uses the canonical gender values directly', () => {
    const genders: Gender[] = ['U', 'D'];
    const outfitGenders: Array<outfit['gender']> = genders;

    expect(outfitGenders).toEqual(['U', 'D']);
  });

  it('uses the real style IDs directly', () => {
    const styles: OutfitStyle[] = ['', 'C', 'B', 'SP', 'SC', 'E', 'AT', 'FES', 'CL', 'TR', 'SE'];
    const outfitStyles: Array<outfit['style']> = styles;

    expect(outfitStyles).toEqual(styles);
  });

  it('uses the real season IDs directly', () => {
    const seasons: OutfitSeason[] = ['', 'E', 'P', 'A', 'I'];
    const outfitSeasons: Array<outfit['season']> = seasons;

    expect(outfitSeasons).toEqual(seasons);
  });

  it('uses the backend outfit statuses directly', () => {
    const statuses: OutfitStatus[] = ['pending', 'approved', 'rifiutato'];
    const outfitStatuses: Array<outfit['status']> = statuses;

    expect(outfitStatuses).toEqual(statuses);
  });
});
