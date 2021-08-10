import type * as lspTypes from "vscode-languageserver-protocol"
import { applyLSPEdits } from "../applyLSPEdits"
import { wrapCommand } from "../novaUtils"

export function registerHotReload(client: LanguageClient) {
  return nova.commands.register(
    "sciencefidelity.dart.commands.hotReload",
    wrapCommand(hotReload)
  )

  // eslint-disable-next-line no-unused-vars
  async function hotReload(editor: TextEditor): Promise<void>
  async function hotReload(
    // eslint-disable-next-line no-unused-vars
    workspace: Workspace,
    // eslint-disable-next-line no-unused-vars
    editor: TextEditor
  ): Promise<void>
  async function hotReload(
    editorOrWorkspace: TextEditor | Workspace,
    maybeEditor?: TextEditor
  ) {
    const editor: TextEditor = maybeEditor ?? (editorOrWorkspace as TextEditor)

    const changes = (await client.sendRequest(
      "flutter.hotReload"
    )) as null | Array<lspTypes.TextEdit>

    if (!changes) {
      return
    }

    applyLSPEdits(editor, changes)
  }
}
