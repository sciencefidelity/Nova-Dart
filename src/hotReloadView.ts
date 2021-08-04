type Element = {
  title: string;
  value: string;
  readonly identifier: string;
};

export class HotReloadView implements TreeDataProvider<Element>, Disposable {
  constructor() {
    this._treeView = new TreeView("sciencefidelity.dart.sidebar.reload", {
      dataProvider: this,
    });

    this.getChildren = this.getChildren.bind(this);
    this.getTreeItem = this.getTreeItem.bind(this);
  }

  private _treeView: TreeView<{ title: string; value: string }>;

  reload() {
    this._treeView.reload();
  }

  getChildren(element: Element | null): Array<Element> {
    if (element === null) {
      return [];
    }
    return [];
  }

  getTreeItem(element: Element) {
    const item = new TreeItem(element.title, TreeItemCollapsibleState.None);
    item.descriptiveText = element.value;
    item.identifier = element.identifier;
    return item;
  }

  dispose() {
    this._treeView.dispose();
  }
}
