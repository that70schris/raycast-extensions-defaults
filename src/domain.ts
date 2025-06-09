import { parse } from '@plist/parse';
import { exec } from 'child_process';

export default class Default {
  protected _list?: any[];
  get list(): any[] {
    return this._list ?? [];
  }

  protected _detail?: any;
  get detail(): string {
    return '';
  }

  protected _fetch?: Promise<void>;
  fetch(): Promise<void> {
    return Promise.resolve();
  }
}

export class Domains extends Default {
  override fetch(): Promise<void> {
    return (this._fetch =
      this._fetch ??
      new Promise((resolve) => {
        exec('defaults domains', (error, stdout) => {
          this._list = stdout
            .toString()
            .split(', ')
            .map((id) => {
              return new Export(id);
            });

          resolve();
        });
      }));
  }
}

export class Export extends Default {
  static index: { [key: string]: Export } = {};

  constructor(public id: string) {
    return (Export.index[id] = Export.index[id] ?? super());
  }

  get path(): string[] {
    return this.id.split('.');
  }

  get key(): string | undefined {
    return this.path.pop();
  }

  get parent() {
    return new Export(this.path.slice(0, -1).join('.'));
  }

  override fetch(): Promise<void> {
    return this._detail
      ? Promise.resolve()
      : (this._fetch =
          this._fetch ??
          new Promise((resolve) => {
            exec(`defaults export '${this.id}' -`, (error, stdout) => {
              this._detail = parse(stdout);
              resolve();
            });
          }));
  }

  override get detail(): string {
    return this._detail
      ? `\`\`\`
${JSON.stringify(
  this._detail,
  (key, value) => {
    switch (typeof value) {
      case 'bigint':
        return value.toString();
      default:
        return value;
    }
  },
  2,
)}
\`\`\``
      : '';
  }
}
