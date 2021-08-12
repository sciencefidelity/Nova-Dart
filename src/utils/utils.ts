export const stopProcess = async (process: Process | null) => {
  if (process) {
    process.terminate()
    process = null
  }
}
