export async function openFile(uri: string) {
  const newEditor = await nova.workspace.openFile(uri)
  if (newEditor) return newEditor
  console.warn("Failed to open, retrying once", uri)
  // try one more time, this doesn't resolve if the file isn't already open
  return await nova.workspace.openFile(uri)
}
