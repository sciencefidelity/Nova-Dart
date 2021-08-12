export const openFile = async (uri: string) => {
  const newEditor = await nova.workspace.openFile(uri)
  if (newEditor) {
    return newEditor
  }
  console.warn("failed first open attempt, retrying once", uri)
  // try one more time, this doesn't resolve if the file isn't already open
  return await nova.workspace.openFile(uri)
}
