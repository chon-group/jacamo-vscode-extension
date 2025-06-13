# JM Code Assistant

A **Visual Studio Code extension** to facilitate **JaCaMo** development, allowing users to create and run JaCaMo applications directly from the editor.

---

## **✨ Features**
✅ **Create a JaCaMo Application**  
→ Quickly generate a new JaCaMo project inside your workspace.

✅ **Run a JaCaMo Application**  
→ Execute `.jcm` applications from VSCode with output displayed in an integrated panel.

✅ **Activity Bar Integration**  
→ Access commands via a dedicated **JaCaMo Sidebar** in VSCode.

✅ **Syntax Highlighting**  
→ Supports `.jcm`, `.asl`, and `.mas2j` files for **JaCaMo, Jason, and MAS2J** syntax.

---

## **📌 Requirements**
Before using this extension, ensure you have:  
1. **Command Line Interface (CLI) for JaCaMo** – Install the appropriate version for your operating system:
   - **Windows**: Download and install from [JaCaMo for Windows](https://github.com/chon-group/win-jacamo)
   - **Linux**: Install using the package from [JaCaMo for Linux](https://github.com/chon-group/dpkg-jacamo)
2. **Set the JaCaMo Path** – Configure the `jacamoPath` setting in VSCode:
    - Open **VSCode Settings** (`Ctrl + ,` or `Cmd + ,`).
    - Search for `"JaCaMo Path"`.
    - Set it to the **full path of `jacamo.exe`** (e.g., `C:\Users\YourUser\jacamo\jacamo.exe`).


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
3. Enter the application name (must match the `.jcm` file).
4. The JaCaMo application runs, and the output appears in **JaCaMo Output**.

---

## **🐞 Known Issues**
- Ensure that the `jacamoPath` is set correctly in **VSCode settings**.
- If the extension doesn't execute, restart VSCode and try again.

---

## **📌 Release Notes**
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

