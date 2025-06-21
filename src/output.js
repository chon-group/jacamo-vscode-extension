const vscode = require("vscode");
const { OUTPUT_CHANNEL_NAME } = require("./constants");

class OutputManager {
    static channel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);

    static show() {
        this.channel.show(true);
    }

    static appendLine(message) {
        this.channel.appendLine(message);
    }

    static clear() {
        this.channel.clear();
    }

    static formatOutput(data) {
        const lines = data.toString().split('\\n');
        for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.includes('Error:')) {
                if (line.includes('[Moise]') || line.includes('[Cartago]') || 
                    line.includes('focus on') || line.includes('join workspace')) {
                    this.appendLine(`ℹ️ ${line.replace('Error:', '').trim()}`);
                } else {
                    this.appendLine(`❌ ${line.replace('Error:', '').trim()}`);
                }
            } else if (line.includes('Output:')) {
                this.appendLine(`📝 ${line.replace('Output:', '').trim()}`);
            } else if (line.includes('BUILD SUCCESSFUL')) {
                this.appendLine(`✅ ${line.trim()}`);
            } else if (line.includes('Runtime Services') || line.includes('Agent mind inspector') || 
                      line.includes('CArtAgO Http Server') || line.includes('Moise Http Server')) {
                this.appendLine(`🌐 ${line.trim()}`);
            } else if (line.includes('parsed successfully')) {
                this.appendLine(`✨ ${line.trim()}`);
            } else if (line.includes('hello world')) {
                this.appendLine(`👋 ${line.trim()}`);
            } else {
                this.appendLine(line.trim());
            }
        }
    }

    static formatError(data) {
        const lines = data.toString().split('\\n');
        for (const line of lines) {
            if (line.trim() === '') continue;
            this.appendLine(`⚠️ ${line.trim()}`);
        }
    }
}

module.exports = {
    OutputManager
}; 