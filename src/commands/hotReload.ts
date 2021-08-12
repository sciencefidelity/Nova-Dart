import { wrapCommand } from "../utils/utils"

export const registerHotReload = () => {
  return nova.commands.register(
    "sciencefidelity.dart.commands.hotReload",
    wrapCommand(hotReload)
  )
}

const hotReload = () => {
  // eslint-disable-next-line no-unused-vars
  return new Promise((_resolve, _reject) => {
    console.log("Function not implemented")
  }) as Promise<void>
}
