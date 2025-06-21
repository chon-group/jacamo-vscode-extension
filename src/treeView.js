const vscode = require("vscode");
const { COMMANDS } = require("./constants");

class JacamoViewProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    getTreeItem(element) {
        return element;
    }

    getChildren() {
        return [
            new JacamoTreeItem('Create JaCaMo App', COMMANDS.CREATE_APP),
            new JacamoTreeItem('Run JaCaMo App', COMMANDS.RUN_APP),
            new JacamoTreeItem('Organization Dimension View', COMMANDS.ORG_DIM_VIEW),
            new JacamoTreeItem('Agent Dimension View', COMMANDS.AGENT_DIM_VIEW),
            new JacamoTreeItem('Environment Dimension View', COMMANDS.ENV_DIM_VIEW),
            new JacamoTreeItem('Stop MAS Execution', COMMANDS.STOP_MAS),
        ];
    }
}

class JacamoTreeItem extends vscode.TreeItem {
    constructor(label, command) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.command = {
            command: command,
            title: label,
        };
    }
}

module.exports = {
    JacamoViewProvider
}; 