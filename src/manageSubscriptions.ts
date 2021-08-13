import { preferences } from "nova-extension-utils"
import { keys, state, vars } from "./main"
import { registerFormatDocument } from "./commands/formatDocument"
import { activateLsp } from "./activateLsp"

export async function cancelSubscriptions(subscriptions: CompositeDisposable | null) {
  if (subscriptions) {
    subscriptions.dispose()
    subscriptions = null
  }
}

export async function addLspSubscriptions() {
  // Register format on save command
  if (state.client && state.lspSubscriptions) {
    state.lspSubscriptions.add(
      state.client.onDidStop(err => {
        let message = "Dart Language Server stopped unexpectedly"
        if (err) {
          message += `:\n\n${err.toString()}`
        } else {
          message += "."
        }
        nova.workspace.showActionPanel(
          message,
          { buttons: ["Restart", "Ignore"] },
          index => {
            if (index == 0) {
              activateLsp()
            }
          }
        )
      })
    )
    state.lspSubscriptions.add(registerFormatDocument(state.client))
  }

  state.lspSubscriptions?.add(
    nova.workspace.onDidAddTextEditor(editor => {
      const editorDisposable = new CompositeDisposable()
      state.lspSubscriptions?.add(editorDisposable)
      state.lspSubscriptions?.add(
        editor.onDidDestroy(() => {
          editorDisposable.dispose()
          state.daemon?.kill()
        })
      )

      const setupListener = () => {
        if (
          !(vars.syntaxes as Array<string | null>).includes(
            editor.document.syntax
          )
        ) {
          return
        }
        const formatDocumentOnSave = preferences.getOverridableBoolean(
          keys.formatDocumentOnSave
        )
        if (!formatDocumentOnSave) {
          return
        }
        return editor.onWillSave(async editor => {
          if (formatDocumentOnSave) {
            await nova.commands.invoke(keys.formatDocument, editor)
          }
        })
      }

      let willSaveListener = setupListener()
      state.lspSubscriptions?.add({
        dispose() {
          willSaveListener?.dispose()
        }
      })

      const refreshListener = () => {
        willSaveListener?.dispose()
        willSaveListener = setupListener()
      }

      // watch things that might change if this needs to happen or not
      editorDisposable.add(editor.document.onDidChangeSyntax(refreshListener))
      editorDisposable.add(
        nova.config.onDidChange(keys.formatDocumentOnSave, refreshListener)
      )
      editorDisposable.add(
        nova.workspace.config.onDidChange(
          keys.formatDocumentOnSave,
          refreshListener
        )
      )
    })
  )
}
