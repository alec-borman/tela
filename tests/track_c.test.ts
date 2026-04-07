import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { TrackCSandbox } from '../src/oracle/track_c';

describe('TDB 4: Track C Sandbox & Oracle Replay Tape', () => {
  const fixtureDir = path.join(__dirname, '../fixtures');
  const tapePath = path.join(fixtureDir, 'tapes.json');

  beforeAll(() => {
    if (!fs.existsSync(fixtureDir)) fs.mkdirSync(fixtureDir, { recursive: true });
    // Clean slate for the tape
    if (fs.existsSync(tapePath)) fs.rmSync(tapePath);
  });

  afterAll(() => {
    if (fs.existsSync(tapePath)) fs.rmSync(tapePath);
  });

  it('Must record a chaotic JSON payload and its SHA-256 hash deterministically', async () => {
    process.env.TELA_TAPE_MODE = 'record';
    const sandbox = new TrackCSandbox();
    
    const mockApiResponse = { data: "Unpredictable external string", timestamp: 1715000000 };
    
    await sandbox.freezePayload('mock_api_call', mockApiResponse);
    
    // Verify the tape was written to disk
    const tapeContent = JSON.parse(fs.readFileSync(tapePath, 'utf-8'));
    expect(tapeContent).toHaveProperty('mock_api_call');
    expect(tapeContent['mock_api_call']).toHaveProperty('hash');
    expect(tapeContent['mock_api_call']).toHaveProperty('payload');
    expect(tapeContent['mock_api_call'].payload.data).toBe("Unpredictable external string");
  });

  it('Must bypass the network and replay the exact payload by verifying the cryptographic hash', async () => {
    process.env.TELA_TAPE_MODE = 'replay';
    const sandbox = new TrackCSandbox();
    
    const replayed = await sandbox.replayPayload('mock_api_call');
    
    expect(replayed).toBeDefined();
    expect(replayed.data).toBe("Unpredictable external string");
  });
  
  it('Must throw a determinism error if the tape is corrupted or tampered with', async () => {
    // Manually corrupt the tape to simulate environmental degradation
    const tapeContent = JSON.parse(fs.readFileSync(tapePath, 'utf-8'));
    tapeContent['mock_api_call'].payload.data = "Malicious injection";
    fs.writeFileSync(tapePath, JSON.stringify(tapeContent));
    
    process.env.TELA_TAPE_MODE = 'replay';
    const sandbox = new TrackCSandbox();
    
    await expect(sandbox.replayPayload('mock_api_call')).rejects.toThrow(/Hash mismatch/i);
  });
});
