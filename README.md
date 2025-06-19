# JM Code Assistant

A **Visual Studio Code extension** to facilitate **JaCaMo** development, allowing users to create and run JaCaMo applications directly from the editor.

---

## **✨ Features**
✅ **Create a JaCaMo Application**  
→ Quickly generate a new JaCaMo project inside your workspace.

✅ **Run a JaCaMo Application**  
→ Execute `.jcm` applications from VSCode with output displayed in an integrated panel.

✅ **Stop MAS Execution**  
→ Instantly stop a running Multi-Agent System (MAS) from the sidebar.

✅ **Web View Buttons**  
→ One-click access to Organization, Agent, and Environment dimension web viewers (localhost:3271-3273).

✅ **Activity Bar Integration**  
→ Access commands via a dedicated **JaCaMo Sidebar** in VSCode.

✅ **Syntax Highlighting**  
→ Supports `.jcm`, `.asl`, and `.mas2j` files for **JaCaMo, Jason, and MAS2J** syntax.

---

## **📌 Requirements**
Before using this extension, ensure you have:  
1. **Command Line Interface (CLI) for JaCaMo** – Install the appropriate version for your operating system:
   - **Windows**: Download and install from the [JaCaMo for Windows](https://github.com/chon-group/win-jacamo)
   - **Linux**: Execute the following commands in your terminal:
     ```sh
     echo "deb [trusted=yes] http://packages.chon.group/ chonos main" | sudo tee /etc/apt/sources.list.d/chonos.list
     sudo apt update
     sudo apt install jacamo-cli
     ```
2. **Set the JaCaMo Path (Optional)** – Only needed if `jacamo` is not in your PATH or you want to use a custom executable:
    - Open **VSCode Settings** (`Ctrl + ,` or `Cmd + ,`).
    - Search for "JaCaMo Path".
    - Set it to the **full path of `jacamo.exe`** (e.g., `C:\Users\YourUser\jacamo\jacamo.exe`).
    - If left empty, the extension will use `jacamo` from your system PATH.

---

## **📂 Usage**
### **1 - Create a JaCaMo Application**
1. Click on the **JaCaMo Sidebar** icon in VSCode.
2. Click **"Create JaCaMo App"**.
3. Enter the project name.
4. The application is created in the **current workspace**.

### **2 - Run a JaCaMo Application**
1. Click on the **JaCaMo Sidebar** icon.
2. Click **"Run JaCaMo App"**.
3. All `.jcm` files in the opened folder will be executed.
4. The JaCaMo application runs, and the output appears in **JaCaMo Output**.

### **3 - Stop MAS Execution**
1. Click **"Stop MAS Execution"** in the sidebar to stop the currently running MAS.

### **4 - View MAOP Dimensions**
1. Use the sidebar buttons to open the Organization, Agent, or Environment dimension web viewers in your browser.

---

## **🐞 Known Issues**
- Ensure that the `jacamo` command is available in your PATH, or set the full path in **VSCode settings** if needed.
- If the extension doesn't execute, restart VSCode and try again.

---

## **📌 Release Notes**
### **2.1.0**
- Added buttons for Organization, Agent, and Environment dimension web viewers.
- Added Stop MAS Execution button.
- Improved JaCaMo path handling: now uses PATH by default, config is optional.
- Updated Linux install instructions.

### **1.0.1**
🚀 Initial release with:  
✅ **JaCaMo project creation**  
✅ **Application execution**  
✅ **Activity Bar integration**  
✅ **Syntax highlighting for `.jcm`, `.asl`, and `.mas2j`**  

---

## **📚 Additional Resources**
- [JaCaMo Documentation](http://jacamo.sourceforge.net/)  
- [JaCaMo4Code Extension](https://marketplace.visualstudio.com/items?itemName=tabajara-krausburg.jacamo4code) (For additional syntax support)  
- [Visual Studio Code Extensions Guide](https://code.visualstudio.com/api)  

---

🌟 **Enjoy coding with JaCaMo in VSCode!** 🚀

