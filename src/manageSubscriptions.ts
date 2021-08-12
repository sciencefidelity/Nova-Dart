import { preferences } from "nova-extension-utils"
import { keys, state, vars } from "./main"
import { registerFormatDocument } from "./commands/formatDocument"

export async function cancelSubscriptions() {
  if (state.subscriptions) {
    state.subscriptions.dispose()
    state.subscriptions = null
  }
}

export async function addLspSubscriptions() {
  // Register format on save command
  if (state.client && state.subscriptions) {
    state.subscriptions.add(
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
              nova.commands.invoke(keys.reloadLsp)
            }
          }
        )
      })
    )
    state.subscriptions.add(registerFormatDocument(state.client))
  }

  state.subscriptions?.add(
    nova.workspace.onDidAddTextEditor(editor => {
      const editorDisposable = new CompositeDisposable()
      state.subscriptions?.add(editorDisposable)
      state.subscriptions?.add(
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
      state.subscriptions?.add({
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

export async function removeLspSubscriptions() {
  // Register format on save command
  if (state.client && state.subscriptions) {
    state.subscriptions.remove(
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
              nova.commands.invoke(keys.reloadLsp)
            }
          }
        )
      })
    )
    state.subscriptions.remove(registerFormatDocument(state.client))
  }

  state.subscriptions?.remove(
    nova.workspace.onDidAddTextEditor(editor => {
      const editorDisposable = new CompositeDisposable()
      state.subscriptions?.remove(editorDisposable)
      state.subscriptions?.remove(
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
      state.subscriptions?.remove({
        dispose() {
          willSaveListener?.dispose()
        }
      })

      const refreshListener = () => {
        willSaveListener?.dispose()
        willSaveListener = setupListener()
      }

      // watch things that might change if this needs to happen or not
      editorDisposable.remove(editor.document.onDidChangeSyntax(refreshListener))
      editorDisposable.remove(
        nova.config.onDidChange(keys.formatDocumentOnSave, refreshListener)
      )
      editorDisposable.remove(
        nova.workspace.config.onDidChange(
          keys.formatDocumentOnSave,
          refreshListener
        )
      )
    })
  )
}
