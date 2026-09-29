import { TestBed } from '@angular/core/testing';
import { CrashReportingService } from './crash-reporting.service';

describe('CrashReportingService', () => {
  let service: CrashReportingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrashReportingService);
  });

  it('does not throw when the native Crashlytics bridge is unavailable', async () => {
    expect(() => service.log('TEST_EVENT')).not.toThrow();
    expect(() => service.setContext('test_key', 'test_value')).not.toThrow();
    expect(() => service.recordError(new Error('sensitive token value'), 'TEST_ERROR')).not.toThrow();
    await Promise.resolve();
  });

  it('initializes build context without requiring a native platform', async () => {
    await expectAsync(service.initializeBuildContext()).toBeResolved();
  });
});
