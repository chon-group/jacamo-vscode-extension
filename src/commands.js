const vscode = require("vscode");
const { JaCaMoAppManager } = require("./jacamo");
const { Configuration } = require("./config");
const { OutputManager } = require("./output");
const { ProcessManager } = require("./process");

async function createApp() {
    try {
        const appName = await vscode.window.showInputBox({
            prompt: 'Enter the name of your JaCaMo application',
            placeHolder: 'multiagentSystem',
        });

        if (appName) {
            await JaCaMoAppManager.createApp(appName);
        }
    } catch (error) {
        vscode.window.showErrorMessage(error.message);
    }
}

async function runApp() {
    try {
        await JaCaMoAppManager.runApp();
    } catch (error) {
        vscode.window.showErrorMessage(error.message);
    }
}

function openOrgDimView() {
    vscode.env.openExternal(vscode.Uri.parse('http://localhost:3271/'));
}

function openAgentDimView() {
    vscode.env.openExternal(vscode.Uri.parse('http://localhost:3272/'));
}

function openEnvDimView() {
    vscode.env.openExternal(vscode.Uri.parse('http://localhost:3273/'));
}

async function stopMas() {
    if (!await Configuration.validateJacamoPath()) {
        return;
    }
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const cwd = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : undefined;
    OutputManager.clear();
    OutputManager.show();
    OutputManager.appendLine('🔍 Listing running MAS...');
    try {
        const { stdout } = await ProcessManager.executeCommand('jacamo mas list', { cwd });
        OutputManager.appendLine(stdout);
        const match = stdout.match(/^\s*(\S+)@/m);
        if (!match) {
            OutputManager.appendLine('❌ No running MAS found.');
            vscode.window.showWarningMessage('No running MAS found.');
            return;
        }
        const masName = match[1];
        OutputManager.appendLine(`🛑 Stopping MAS: ${masName}`);
        const stopCmd = `jacamo mas stop ${masName} --exit`;
        const { stdout: stopOut, stderr: stopErr } = await ProcessManager.executeCommand(stopCmd, { cwd });
        OutputManager.appendLine(stopOut);
        if (stopErr) OutputManager.appendLine(stopErr);
        vscode.window.showInformationMessage(`MAS '${masName}' stopped.`);
    } catch (err) {
        OutputManager.appendLine(`❌ Error stopping MAS: ${err.message}`);
        vscode.window.showErrorMessage(`Error stopping MAS: ${err.message}`);
    }
}

module.exports = {
    createApp,
    runApp,
    openOrgDimView,
    openAgentDimView,
    openEnvDimView,
    stopMas
}; 