const vscode = require("vscode");
const { COMMANDS } = require("./src/constants");
const { OutputManager } = require("./src/output");
const { JacamoViewProvider } = require("./src/treeView");
const {
    createApp,
    runApp,
    openOrgDimView,
    openAgentDimView,
    openEnvDimView,
    stopMas
} = require("./src/commands");

function activate(context) {
    const jacamoViewProvider = new JacamoViewProvider();

    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.CREATE_APP, createApp),
        vscode.commands.registerCommand(COMMANDS.RUN_APP, runApp),
        vscode.commands.registerCommand(COMMANDS.ORG_DIM_VIEW, openOrgDimView),
        vscode.commands.registerCommand(COMMANDS.AGENT_DIM_VIEW, openAgentDimView),
        vscode.commands.registerCommand(COMMANDS.ENV_DIM_VIEW, openEnvDimView),
        vscode.commands.registerCommand(COMMANDS.STOP_MAS, stopMas),
        vscode.window.registerTreeDataProvider('jacamoView', jacamoViewProvider)
    );
}

function deactivate() {
    OutputManager.channel.dispose();
}

module.exports = {
    activate,
    deactivate,
};
