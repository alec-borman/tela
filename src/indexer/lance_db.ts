import * as lancedb from '@lancedb/lancedb';
import * as arrow from 'apache-arrow';

export class LanceDBManager {
  private dbPath: string;
  private db: lancedb.Connection | null = null;
  public readonly tableName = 'code_chunks';

  constructor(dbPath: string = '.lancedb') {
    this.dbPath = dbPath;
  }

  async connect() {
    this.db = await lancedb.connect(this.dbPath);
  }

  getSchema() {
    return new arrow.Schema([
      new arrow.Field('vector', new arrow.FixedSizeList(1024, new arrow.Field('item', new arrow.Float64(), true)), false),
      new arrow.Field('filePath', new arrow.Utf8(), false),
      new arrow.Field('content', new arrow.Utf8(), false)
    ]);
  }

  async getOrCreateTable() {
    if (!this.db) await this.connect();
    
    const tableNames = await this.db!.tableNames();
    if (tableNames.includes(this.tableName)) {
      return await this.db!.openTable(this.tableName);
    } else {
      // Create empty table with schema
      const table = await this.db!.createEmptyTable(this.tableName, this.getSchema());
      try { await table.createIndex('content', { config: lancedb.Index.fts() }); } catch(err) { console.warn('FTS ignored'); }
      return table;
    }
  }

  async dropTable() {
    if (!this.db) await this.connect();
    const tableNames = await this.db!.tableNames();
    if (tableNames.includes(this.tableName)) {
      await this.db!.dropTable(this.tableName);
    }
  }
}
