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
    let id = this.id;
    function parse(preferences: string = '') {
      preferences = preferences.replace(/\n*?(\n.*)\n*/m, '$1');
      const opener = preferences.split('\n').shift()?.trim();
      let lines = preferences.split('\n').slice(1, -2);
      preferences = lines.join('\n');

      switch (opener) {
        case '{':
          return lines.reduce((result, line): { [key: string]: any } => {
            const [key, value] = line.trim().split(/\s*=\s*/);
            lines.shift();

            return {
              ...result,
              [key]: parse(lines.join('\n').match(/^([{[]?$.*[\]}]?);$/m)?.[0]),
            };
          }, {});
        case '(':
          return lines.map((line): any => {
            lines.shift();

            return parse(line.trim().replace(/"?(.*?)"?;$/, '$1'));
          });

        default:
          return preferences?.replace(/;$/, '');
      }
    }

    this._settings = JSON.stringify(parse(value));

    // this._settings = value
    //   .split('\n')
    //   .map((line) => {
    //     return line
    //       .trim()
    //       .replace(/;$/, ',')
    //       .replace(/\($/, '[')
    //       .replace(/\),?$/, '],')
    //       .replace(/^\s*"?(.*?)"?\s*=\s*([[{])$/, '"$1": $2')
    //       .replace(/^\s*"?([^"].*?)"?\s*=\s*"?(.*?)"?,$/, '"$1": "$2",')
    //       .replace(/^\s*"?([^\d[\]{}]+?)"?,?$/, '"$1",');
    //   })
    //   .join('\n')
    //   .replace(/,$(\s*?[\]}])/gm, '$1');

    // try {
    //   this._settings = JSON.stringify(JSON.parse(this._settings), null, 2);
    // } catch (e) {
    //   console.error(this.id, e);
    // }
  }

  private _fetch?: Promise<void>;
  fetch(): Promise<void> {
    return this.settings
      ? Promise.resolve()
      : (this._fetch =
          this._fetch ??
          new Promise((resolve) => {
            exec(`defaults read '${this.id}'`, (error, stdout) => {
              this.settings = stdout;
              resolve();
            });
          }));
  }
}
