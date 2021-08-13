import { wrapCommand } from "../utils/utils"
import { keys } from "../globalVars"

export function registerHotReload() {
  return nova.commands.register(keys.hotReload, wrapCommand(hotReload))
}

function hotReload() {
  // eslint-disable-next-line no-unused-vars
  return new Promise<void>((_resolve, _reject) => {
    console.log("Function not implemented")
  })
}
