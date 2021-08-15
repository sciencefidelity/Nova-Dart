import { preferences } from "nova-extension-utils"
import { activateLsp } from "./activateLsp"
import { registerFormatDocument } from "./commands/formatDocument"
import { keys, state, vars } from "./globalVars"
import { showActionableError } from "./utils/utils"

export async function cancelSubs(subscriptions: CompositeDisposable | null) {
  if (subscriptions) {
    subscriptions.dispose()
    subscriptions = null
  }
}

export async function addLspSubs() {
  // Register format on save command
  if (state.client && state.lspSubs) {
    state.lspSubs.add(
      // show alert if LSP crashes
      state.client.onDidStop(err => {
        showActionableError(
          "analyzer-stopped",
          "Dart Language Server stopped unexpectedly",
          (err && err.toString()) ||
            "Please report this, along with any output in the console",
          ["Restart", "Ignore"],
          (r: number) => {
            switch (r) {
              case 0:
                activateLsp(true)
                break
            }
          }
        )
      })
    )
    state.lspSubs.add(registerFormatDocument(state.client))
  }
  startEditorSubs()
}

function startEditorSubs() {
  state.lspSubs?.add(
    nova.workspace.onDidAddTextEditor(editor => {
      state.editorSubs = new CompositeDisposable()
      state.lspSubs?.add(state.editorSubs)
      state.lspSubs?.add(
        editor.onDidDestroy(() => {
          state.editorSubs?.dispose()
          state.editorSubs = null
        })
      )
      //prettier-ignore
      const setupListener = () => {
        if (!(vars.syntaxes as Array<string | null>)
          .includes(editor.document.syntax)) return
        const formatOnSave = preferences.getOverridableBoolean(
          keys.formatDocumentOnSave
        )
        if (!formatOnSave) return
        return editor.onWillSave(async editor => {
          await nova.commands.invoke(keys.formatDocument, editor)
        })
      }

      let willSaveListener = setupListener()
      state.lspSubs?.add({
        dispose() {
          willSaveListener?.dispose()
        }
      })
      const refreshListener = () => {
        willSaveListener?.dispose()
        willSaveListener = setupListener()
      }
      state.editorSubs.add(editor.document.onDidChangeSyntax(refreshListener))
      state.editorSubs.add(
        nova.config.onDidChange(keys.formatDocumentOnSave, refreshListener)
      )
      //prettier-ignore
      state.editorSubs.add(
        nova.workspace.config.onDidChange(keys.formatDocumentOnSave, refreshListener)
      )
    })
  )
}
