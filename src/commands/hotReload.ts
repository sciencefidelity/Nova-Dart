import { keys } from "../globalVars"
import { wrapCommand } from "../utils/utils"

export function registerHotReload() {
  return nova.commands.register(keys.hotReload, wrapCommand(hotReload))
}

function hotReload() {
  // eslint-disable-next-line no-unused-vars
  return new Promise<void>((_resolve, _reject) => {
    console.log("Function not implemented")
  })
}
