import type * as lspTypes from "vscode-languageserver-protocol"
import { wrapCommand } from "../novaUtils"

export const registerHotReload = (client: LanguageClient) => {
  return nova.commands.register(
    "sciencefidelity.dart.commands.hotReload",
    wrapCommand(hotReload)
  )

  async function hotReload(
    // eslint-disable-next-line no-unused-vars
    editor: TextEditor
  ): Promise<void> {

    const changes = (await client.sendRequest(
      "flutter.hotReload"
    )) as null | Array<lspTypes.TextEdit>

    if (!changes) {
      return
    }
  }
}
