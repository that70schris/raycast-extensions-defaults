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
    function parse(value: string = '') {
      value = value.replace(/\n*?(\n.*)\n*/m, '$1');
      const open = value.split('\n').shift()?.trim();
      value = value.split('\n').slice(1, -2).join('\n');
      value = value.replace(/\{(.*)\};?$/gm, parse);
      value = value.replace(/\((.*)\);?$/gm, parse);
      console.log(value);

      switch (open) {
        case '{':
          return JSON.stringify(
            value.split('\n').reduce((result, line) => {
              const [key, value] = line.trim().split(/\s*=\s*/);

              return {
                ...result,
                [key]: value.replace(/;$/, ''),
              };
            }, {}),
          );
        case '[':
          return JSON.stringify(
            value.split('\n').map((line) => {
              return line.trim().replace(/"?(.*?)"?;$/, '$1');
            }),
          );
        default:
          return value;
      }
    }

    this._settings = parse(value);

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
