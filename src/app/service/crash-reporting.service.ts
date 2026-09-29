import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { buildInfo } from 'src/environments/build-info';
import { environment } from 'src/environments/environment';

interface CrashReportingPlugin {
  log(options: { event: string }): Promise<void>;
  setContext(options: { key: string; value: string }): Promise<void>;
  recordError(options: { errorType: string; context: string }): Promise<void>;
}

const CrashReporting = registerPlugin<CrashReportingPlugin>('CrashReporting');

@Injectable({ providedIn: 'root' })
export class CrashReportingService {
  log(event: string): void {
    this.invokeSafely(() => CrashReporting.log({ event }));
  }

  setContext(key: string, value: string): void {
    this.invokeSafely(() => CrashReporting.setContext({ key, value }));
  }

  recordError(error: unknown, context = 'UNHANDLED_JS_ERROR'): void {
    const errorType = error instanceof Error
      ? this.safeIdentifier(error.name, 'Error')
      : 'NonErrorRejection';
    this.invokeSafely(() => CrashReporting.recordError({
      errorType,
      context: this.safeIdentifier(context, 'JS_ERROR'),
    }));
  }

  async initializeBuildContext(): Promise<void> {
    const platform = Capacitor.getPlatform();
    const environmentName = environment.production ? 'production' : 'dev';
    let version = 'web';
    let build = 'web';

    if (Capacitor.isNativePlatform()) {
      try {
        const appInfo = await App.getInfo();
        version = appInfo.version;
        build = appInfo.build;
      } catch {
        // Keep startup fail-safe when native app metadata is unavailable.
      }
    }

    const commit = this.safeIdentifier(buildInfo.gitCommit, 'unknown').slice(0, 12);
    this.setContext('app_version', version);
    this.setContext('version_code', build);
    this.setContext('platform', platform);
    this.setContext('environment', environmentName);
    this.setContext('git_commit', commit);
    this.log(`APP_START version=${version} build=${build} commit=${commit} environment=${environmentName}`);
  }

  private safeIdentifier(value: string, fallback: string): string {
    const sanitized = value.replace(/[^a-zA-Z0-9_.:-]/g, '_').slice(0, 80);
    return sanitized || fallback;
  }

  private invokeSafely(operation: () => Promise<void>): void {
    try {
      void operation().catch(() => undefined);
    } catch {
      // Diagnostics must never affect an application flow.
    }
  }
}
