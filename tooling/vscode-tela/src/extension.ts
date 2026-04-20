import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  // The server is implemented in Rust
  const serverCommand = context.asAbsolutePath(
    path.join('..', '..', 'target', 'release', 'tela-analyzer')
  );

  const serverOptions: ServerOptions = {
    run: { command: serverCommand, transport: TransportKind.stdio },
    debug: { command: serverCommand, transport: TransportKind.stdio }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'tela' },
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'rust' }
    ],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
    }
  };

  client = new LanguageClient(
    'telaLanguageServer',
    'Tela Language Server',
    serverOptions,
    clientOptions
  );

  client.start();

  // Hover Provider for Vector Fingerprints
  const hoverProvider = vscode.languages.registerHoverProvider('tela', {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);
      
      if (word.match(/^[a-f0-9]{64}$/)) {
        return new vscode.Hover(new vscode.MarkdownString(`**Vector Fingerprint**\n\nGeometric DNA: \`${word}\``));
      }
      return undefined;
    }
  });

  context.subscriptions.push(hoverProvider);

  // Command to run parity check
  const checkCommand = vscode.commands.registerCommand('tela.checkParity', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'tela') {
      const terminal = vscode.window.createTerminal('Tela Parity Check');
      terminal.show();
      terminal.sendText(`npm run check ${editor.document.fileName}`);
    }
  });

  context.subscriptions.push(checkCommand);
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
