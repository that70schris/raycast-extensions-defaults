import { parse } from '@plist/parse';
import { exec } from 'child_process';

export default class Domain {
  static index: { [key: string]: Domain } = {};

  constructor(public id: string) {
    return (Domain.index[id] = Domain.index[id] ?? this);
  }

  private _settings?: string;
  get settings(): string {
    return this._settings ?? '';
  }

  set settings(value: string) {
    this._settings = JSON.stringify(
      parse(value),
      (key, value) => {
        switch (typeof value) {
          case 'bigint':
            return value.toString();
          default:
            return value;
        }
      },
      2,
    );
  }

  private _fetch?: Promise<void>;
  fetch(): Promise<void> {
    return this.settings
      ? Promise.resolve()
      : (this._fetch =
          this._fetch ??
          new Promise((resolve) => {
            exec(`defaults export '${this.id}' -`, (error, stdout) => {
              this.settings = stdout;
              resolve();
            });
          }));
  }
}
