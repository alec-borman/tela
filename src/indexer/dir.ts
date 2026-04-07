import { LanceDBManager } from './lance_db';
import { Scanner } from '../compiler/scanner';

export class DIREngine {
  private dbManager: LanceDBManager;

  constructor() {
    this.dbManager = new LanceDBManager();
  }

  async indexDirectory(dirPath: string) {
    const scanner = new Scanner(dirPath);
    const chunks = scanner.scanDirectory();

    await this.dbManager.dropTable(); // Re-index everything
    const table = await this.dbManager.getOrCreateTable();

    // Prepare data for LanceDB
    const data = chunks.map(chunk => ({
      vector: Array.from(chunk.vector),
      filePath: chunk.filePath,
      content: chunk.content
    }));

    if (data.length > 0) {
      await table.add(data);
    }
  }

  async retrieve(targetVector: Float64Array, threshold: number, limit: number = 5) {
    const table = await this.dbManager.getOrCreateTable();
    
    // Query LanceDB
    const results = await table.search(Array.from(targetVector))
      .distanceType('cosine')
      .limit(limit)
      .toArray();

    // Filter by threshold. LanceDB cosine distance is 1 - cosine_similarity.
    // So similarity = 1 - distance.
    const filtered = results.filter(r => {
      const distance = (r as any)._distance;
      const similarity = 1 - distance;
      return similarity > threshold;
    });

    return filtered.map(r => ({
      filePath: r.filePath as string,
      content: r.content as string,
      similarity: 1 - (r as any)._distance
    }));
  }
}
