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

    const data = chunks.map(chunk => ({
      vector: Array.from(chunk.vector),
      filePath: chunk.filePath,
      content: chunk.content
    }));

    if (data.length > 0) {
      await table.add(data);
    }
  }

  // Parse chunk with tree-sitter or regex to extract dependencies
  private extractDependencies(content: string): string[] {
    const deps = new Set<string>();
    
    // Check for TS imports
    const importRegex = /import\s+\{([^}]+)\}\s+from/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      match[1].split(',').forEach(d => deps.add(d.trim()));
    }
    
    // Check for Rust impls
    const implRegex = /impl(?:<[^>]*>)?\s+(?:(?:[\w_:]+)\s+for\s+)?([A-Z][\w_]+)/g;
    while ((match = implRegex.exec(content)) !== null) {
       deps.add(match[1].trim());
    }

    // Also look for generic TypeScript type usages like calculate(v: TeleportationVector)
    const typeUsageRegex = /:\s*([A-Z][A-Za-z0-9_]+)/g;
    while ((match = typeUsageRegex.exec(content)) !== null) {
       deps.add(match[1].trim());
    }

    return Array.from(deps).filter(d => d.length > 0);
  }

  async retrieve(targetVector: Float64Array, threshold: number, limit: number = 5, intent?: string) {
    const table = await this.dbManager.getOrCreateTable();
    
    // 1. Vector Search
    const vecResults = await table.search(Array.from(targetVector))
      .distanceType('cosine')
      .limit(limit)
      .toArray();
    console.log('vecResults:', vecResults.map(r => ({ ...r, vector: '[snip]', _distance: r._distance })));

    // 2. FTS Search (if intent provided)
    let ftsResults: any[] = [];
    if (intent && intent.trim().length > 0) {
      try {
        ftsResults = await table.search(intent, 'fts').limit(limit).toArray();
      } catch (e) {}
    }

    // Create a unified list and blend scores
    const resultMap = new Map<string, any>();

    for (const r of vecResults) {
      const distance = (r as any)._distance || 0;
      const sim = 1 - distance;
      if (sim >= threshold) {
        resultMap.set(r.content as string, {
           filePath: r.filePath as string,
           content: r.content as string,
           similarity: sim,
           _score: sim
        });
      }
    }

    for (const r of ftsResults) {
      const score = (r as any)._score || 0;
      const content = r.content as string;
      if (resultMap.has(content)) {
         resultMap.get(content).similarity += 0.1; // boost
      } else {
         resultMap.set(content, {
           filePath: r.filePath as string,
           content: content,
           similarity: Math.min(1.0, threshold + 0.1), // push above threshold
           _score: score
         });
      }
    }

    let topChunks = Array.from(resultMap.values()).sort((a,b) => b.similarity - a.similarity).slice(0, limit);

    // 3. Dependency Graph Expansion
    const expandedContents = new Set<string>(topChunks.map(c => c.content));
    const finalResults = [...topChunks];

    for (const chunk of topChunks) {
      const deps = this.extractDependencies(chunk.content);
      for (const dep of deps) {
         try {
            const depResults = await table.search(dep, 'fts').limit(2).toArray();
            for (const dr of depResults) {
               const dContent = dr.content as string;
               if (!expandedContents.has(dContent)) {
                  expandedContents.add(dContent);
                  finalResults.push({
                     filePath: dr.filePath as string,
                     content: dContent,
                     similarity: 1.0 // Appended via expansion
                  });
               }
            }
         } catch(e) {}
      }
    }

    return finalResults;
  }
}