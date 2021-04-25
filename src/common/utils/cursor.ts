export class Cursor {
  public readonly encodedCursor: string;

  constructor(private lastId: any, private threshold: any) {
    const stringifiedJSON = JSON.stringify({
      lastId: this.lastId,
      threshold: this.threshold,
    });

    this.encodedCursor = Buffer.from(stringifiedJSON).toString('base64');
  }

  static decode(cursor: string): { lastId: any; threshold: any } {
    if (!cursor) return null;

    const stringifiedJSON = Buffer.from(cursor, 'base64').toString('utf-8');
    const json = JSON.parse(stringifiedJSON);

    return json;
  }
}
