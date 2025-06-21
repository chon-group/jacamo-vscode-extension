const vscode = require("vscode");
const { EXTENSION_ID } = require("./constants");

class Configuration {
    static get jacamoPath() {
        const configured = vscode.workspace.getConfiguration(EXTENSION_ID).get('jacamoPath');
        return configured && configured.trim() !== '' ? configured : 'jacamo';
    }

    static async validateJacamoPath() {
        if (this.jacamoPath === 'jacamo') {
            return new Promise((resolve) => {
                const { exec } = require('child_process');
                exec('jacamo --version', (error) => {
                    if (error) {
                        vscode.window.showErrorMessage(
                            'JaCaMo path is not configured and the jacamo command is not available in your PATH. Please set it in VSCode settings.',
                            'Open Settings'
                        ).then(selection => {
                            if (selection === 'Open Settings') {
                                vscode.commands.executeCommand('workbench.action.openSettings', `${EXTENSION_ID}.jacamoPath`);
                            }
                        });
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        }
        return true;
    }
}

module.exports = {
    Configuration
}; 