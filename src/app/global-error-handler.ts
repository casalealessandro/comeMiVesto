import { ErrorHandler, Injectable } from '@angular/core';
import { CrashReportingService } from './service/crash-reporting.service';

@Injectable()
export class GlobalErrorHandler extends ErrorHandler {
  constructor(private readonly crashReporting: CrashReportingService) {
    super();
  }

  override handleError(error: unknown): void {
    super.handleError(error);
    this.crashReporting.recordError(error, 'ANGULAR_UNHANDLED_ERROR');
  }
}
