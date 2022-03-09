import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import {
  CloseAction,
  createConnection,
  ErrorAction,
  MessageConnection,
  MonacoLanguageClient,
  MonacoServices,
} from 'monaco-languageclient';
const ReconnectingWebSocket = require('reconnecting-websocket');
import { listen } from 'vscode-ws-jsonrpc';
import * as monaco from 'monaco-editor-core';
import languageMode from './language-mode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  EDITOR_CONTENT = `Hello Xtext!
Hello VSCode from Xtext!
Hello ThisFile from Other!
Hello you!`;

  LANGUAGE_ID = 'st';

  ngAfterViewInit(): void {
    this.initEditor();
  }

  initEditor() {
    const container = document.getElementById('container') as HTMLElement;
    monaco.languages.register({
      id: this.LANGUAGE_ID,
      aliases: [this.LANGUAGE_ID],
      extensions: [`.${this.LANGUAGE_ID}`],
      mimetypes: [`text/${this.LANGUAGE_ID}`],
    });
    monaco.languages.setMonarchTokensProvider(
      this.LANGUAGE_ID,
      languageMode as any
    );

    const editor = monaco.editor.create(container, {
      model: monaco.editor.createModel(
        this.EDITOR_CONTENT,
        this.LANGUAGE_ID,
        monaco.Uri.parse(`inmemory:/demo/${this.getGuid()}.${this.LANGUAGE_ID}`)
      ),
    });

    MonacoServices.install(editor as any);

    const url = this.createUrl('localhost', '4389', '/');
    const webSocket = this.createWebSocket(url);
    listen({
      webSocket,
      onConnection: (connection: any) => {
        //must cast to any
        // create and start the language client
        const languageClient = this.createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
      },
    });
  }

  createUrl(host: any, port: any, path: any): string {
    return `${
      location.protocol === 'https:' ? 'wss' : 'ws'
    }://${host}:${port}${path}`;
  }

  createWebSocket(url: string): WebSocket {
    const socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: Infinity,
      debug: false,
    };
    return new ReconnectingWebSocket(url, [], socketOptions);
  }

  createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
    return new MonacoLanguageClient({
      name: 'Sample Language Client',
      clientOptions: {
        // use a language id as a document selector
        documentSelector: ['json'],
        // disable the default error handler
        errorHandler: {
          error: () => ErrorAction.Continue,
          closed: () => CloseAction.DoNotRestart,
        },
      },
      // create a language client connection from the JSON RPC connection on demand
      connectionProvider: {
        get: (errorHandler, closeHandler) => {
          return Promise.resolve(
            createConnection(connection, errorHandler, closeHandler)
          );
        },
      },
    });
  }

  getGuid() {
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    return (
      s4() +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      s4() +
      s4()
    );
  }
}
