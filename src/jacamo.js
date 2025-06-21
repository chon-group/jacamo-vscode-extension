const vscode = require("vscode");
const fs = require("fs");
const { Configuration } = require("./config");
const { ProcessManager } = require("./process");
const { OutputManager } = require("./output");

class JaCaMoAppManager {
    static async createApp(appName) {
        if (!appName) {
            throw new Error('Application name is required.');
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workingDirectory = workspaceFolders
            ? workspaceFolders[0].uri.fsPath
            : require('os').homedir();

        try {
            await ProcessManager.executeCommand(
                `jacamo app create ${appName} --console`,
                { cwd: workingDirectory }
            );
            
            vscode.window.showInformationMessage(
                `JaCaMo application '${appName}' created successfully in ${workingDirectory}`
            );
        } catch (error) {
            vscode.window.showErrorMessage(
                `Error creating application: ${error.message}`
            );
            throw error;
        }
    }

    static async getRunningMas(cwd) {
        try {
            const { stdout } = await ProcessManager.executeCommand('jacamo mas list', { cwd });
            const runningMas = [];
            // Example output line: "  aprenda@hostname"
            const regex = /^\s*(\S+)@/gm;
            let match;
            while ((match = regex.exec(stdout)) !== null) {
                runningMas.push(match[1]);
            }
            return runningMas;
        } catch (err) {
            // 'jacamo mas list' can fail if jacamo-rest is not running (which is fine)
            if (err.message && err.message.toLowerCase().includes('not running')) {
                return [];
            }
            OutputManager.appendLine(`⚠️ Error listing MAS: ${err.message}`);
            // Do not show error popup, it's not critical for this flow
            return [];
        }
    }

    static async runApp() {
        if (!await Configuration.validateJacamoPath()) {
            return;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder is open.');
            return;
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;

        let jcmFiles;
        try {
            jcmFiles = fs.readdirSync(workspacePath).filter(file => file.endsWith('.jcm'));
        } catch (err) {
            vscode.window.showErrorMessage('Error reading workspace directory: ' + err.message);
            return;
        }

        if (jcmFiles.length === 0) {
            vscode.window.showErrorMessage('No .jcm files found in the opened folder.');
            return;
        }

        OutputManager.clear();
        OutputManager.show();
        OutputManager.appendLine('🚀 Verifying JaCaMo Application(s) before running...');

        const runningMas = await this.getRunningMas(workspacePath);
        if (runningMas.length > 0) {
            OutputManager.appendLine(`ℹ️ Found running MAS: ${runningMas.join(', ')}`);
        }
        
        OutputManager.appendLine(`📂 Running .jcm files in: ${workspacePath}`);
        OutputManager.appendLine('─'.repeat(50));

        for (const appFileName of jcmFiles) {
            const appName = appFileName.replace(/\.jcm$/, '');

            if (runningMas.includes(appName)) {
                const selection = await vscode.window.showWarningMessage(
                    `Application '${appName}' is already running.`,
                    { modal: true },
                    'Stop and Rerun'
                );

                if (selection === 'Stop and Rerun') {
                    OutputManager.appendLine(`⏳ Stopping existing MAS: ${appName}`);
                    try {
                        const stopCmd = `jacamo mas stop ${appName} --exit`;
                        await ProcessManager.executeCommand(stopCmd, { cwd: workspacePath });
                        OutputManager.appendLine(`✅ MAS '${appName}' stopped successfully.`);
                    } catch (err) {
                        OutputManager.appendLine(`❌ Error stopping MAS '${appName}': ${err.message}`);
                        vscode.window.showErrorMessage(`Error stopping MAS '${appName}': ${err.message}`);
                        OutputManager.appendLine(`⏩ Skipping launch of: ${appName}`);
                        continue; // Skip running this app if stop fails
                    }
                } else {
                    OutputManager.appendLine(`⏩ Skipping already running application: ${appName}`);
                    continue; // Skip to next app if user cancels
                }
            }
            
            OutputManager.appendLine(`▶️ Running: ${appFileName}`);
            const spawnedProcess = ProcessManager.spawnProcess(
                Configuration.jacamoPath,
                [appFileName],
                { cwd: workspacePath }
            );

            await new Promise((resolve) => {
                spawnedProcess.on('error', (error) => {
                    OutputManager.appendLine(`❌ Execution Error: ${error.message}`);
                    vscode.window.showErrorMessage(
                        `Error running application: ${error.message}`
                    );
                    resolve();
                });
                spawnedProcess.on('close', (code) => {
                    OutputManager.appendLine('─'.repeat(50));
                    if (code === 0) {
                        OutputManager.appendLine(`✅ Application '${appFileName}' completed successfully.`);
                    } else if (code !== null) {
                        OutputManager.appendLine(`⚠️ Application '${appFileName}' exited with code ${code}.`);
                    }
                    vscode.window.showInformationMessage(
                        `JaCaMo application '${appFileName}' ${code === 0 ? 'completed successfully' : `exited with code ${code}`}.`
                    );
                    resolve();
                });
            });
        }
    }
}

module.exports = {
    JaCaMoAppManager
}; 