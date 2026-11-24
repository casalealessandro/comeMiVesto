import { routes } from './app-routing.module';

describe('App startup routing', () => {
  it('provides the standalone guest entry route', () => {
    const entry = routes.find(route => route.path === 'guestAuth');
    expect(entry?.loadComponent).toBeDefined();
    expect(entry?.canActivate).toBeUndefined();
  });

  it('routes the app root through login so intro persistence is checked before showing slides', () => {
    const rootRoute = routes.find((route) => route.path === '');

    expect(rootRoute?.redirectTo).toBe('login');
    expect(rootRoute?.pathMatch).toBe('full');
  });
});
