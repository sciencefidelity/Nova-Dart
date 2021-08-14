import { Element } from "./interfaces/interfaces"

export class InformationView implements TreeDataProvider<Element>, Disposable {
  constructor() {
    this._treeView = new TreeView("sciencefidelity.dart.sidebar.info", {
      dataProvider: this
    })

    this.getChildren = this.getChildren.bind(this)
    this.getTreeItem = this.getTreeItem.bind(this)
  }

  private _treeView: TreeView<{ title: string; value: string }>

  private readonly _statusElement: Element = {
    title: "LSP Status",
    value: "Inactive",
    identifier: "status"
  }
  public set status(value: string) {
    this._statusElement.value = value
    this._treeView.reload(this._statusElement);
  }

  private readonly _dartVersionElement: Element = {
    title: "Dart SDK",
    value: "",
    identifier: "dartVersion"
  };
  public set dartVersion(value: string) {
    this._dartVersionElement.value = value
    this._treeView.reload(this._dartVersionElement)
  }

  private readonly _flutterVersionElement: Element = {
    title: "Flutter SDK",
    value: "",
    identifier: "flutterVersion"
  };
  public set flutterVersion(value: string) {
    this._flutterVersionElement.value = value
    this._treeView.reload(this._flutterVersionElement)
  }

  reload() {
    this._treeView.reload()
  }

  getChildren(element: Element | null): Array<Element> {
    if (element === null) {
      return [
        this._statusElement,
        this._dartVersionElement,
        this._flutterVersionElement
      ];
    }
    return []
  }

  getTreeItem(element: Element) {
    const item = new TreeItem(element.title, TreeItemCollapsibleState.None)
    item.descriptiveText = element.value
    item.identifier = element.identifier
    return item
  }

  dispose() {
    this.status = "Disposed"
    this._treeView.dispose()
  }
}

export const Info = new InformationView()
