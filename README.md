# 👻 GhostSync
**Instant, invisible directory synchronization over SSH.**

Stop manually dragging files to FileZilla or running heavy CI/CD for tiny config changes. GhostSync watches your local folder and pushes updates via SFTP the millisecond you hit `Ctrl+S`.

## 📦 Installation
```bash
npm install -g ghostsync
```
# 🚀 Usage
```bash
node index.js -h 1.2.3.4 -u root -w MySecretPassword -p /home/projects/test
```
# 🔥 Why GhostSync?
* Fast: Built on Node.js streams.
* Secure: Uses your native SSH-agent.
* Smart: Ignores .git, node_modules, and hidden files by default.
