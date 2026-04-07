import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class TrackCSandbox {
  private mode: string;
  private tapePath: string;

  constructor() {
    this.mode = process.env.TELA_TAPE_MODE || 'replay';
    // Using process.cwd() ensures we resolve to the project root
    this.tapePath = path.join(process.cwd(), 'fixtures', 'tapes.json');
  }

  private computeHash(payload: any): string {
    const str = JSON.stringify(payload);
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  async freezePayload(key: string, payload: any): Promise<void> {
    if (this.mode !== 'record') {
      return;
    }

    const hash = this.computeHash(payload);
    const fixtureDir = path.dirname(this.tapePath);
    if (!fs.existsSync(fixtureDir)) {
      fs.mkdirSync(fixtureDir, { recursive: true });
    }

    let tapes: Record<string, any> = {};
    if (fs.existsSync(this.tapePath)) {
      tapes = JSON.parse(fs.readFileSync(this.tapePath, 'utf-8'));
    }

    tapes[key] = {
      hash,
      payload
    };

    fs.writeFileSync(this.tapePath, JSON.stringify(tapes, null, 2), 'utf-8');
  }

  async replayPayload(key: string): Promise<any> {
    if (this.mode !== 'replay') {
      throw new Error(`Cannot replay in mode: ${this.mode}`);
    }

    if (!fs.existsSync(this.tapePath)) {
      throw new Error(`Tape file not found at ${this.tapePath}`);
    }

    const tapes = JSON.parse(fs.readFileSync(this.tapePath, 'utf-8'));
    if (!tapes[key]) {
      throw new Error(`No tape found for key: ${key}`);
    }

    const { hash, payload } = tapes[key];
    const currentHash = this.computeHash(payload);

    if (currentHash !== hash) {
      throw new Error(`Hash mismatch for key: ${key}. Expected ${hash}, got ${currentHash}`);
    }

    return payload;
  }
}
