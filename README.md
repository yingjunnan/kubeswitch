# KubeSwitch

Remote Kubeconfig Management Tool.

## Architecture

- **Server**: Go (Gin, GORM, SQLite)
- **Web UI**: React (Ant Design)
- **CLI**: Go (Cobra, Bubble Tea)

## Getting Started

### 1. Start Server

```bash
cd server
go run main.go
```
Server runs on `http://localhost:8080`.
Default Admin User: `admin` / `admin123`

### 2. Start Web UI

```bash
cd web
npm install
npm run dev
```
Open `http://localhost:5173`.
Login with `admin` / `admin123`.
- Go to Dashboard.
- Add Clusters (Upload Kubeconfig content).
- Create Users.
- Assign Permissions.

### 3. Use CLI

Build the CLI:
```bash
cd cli
go build -o ks main.go
mv ks /usr/local/bin/ # Optional
```

Configure Server:
```bash
ks init
# Follow the prompt to enter Server URL (Default: http://localhost:8080)
```

Login:
```bash
ks login
# Enter username/password
```

Select Cluster:
```bash
ks select
```
This will open an interactive list. Select a cluster, and it downloads the config to `~/.kube/ks-cache/`.
It prints the path to the config file.

### Shell Integration

To automatically set `KUBECONFIG` environment variable, add this function to your `.bashrc` or `.zshrc`:

```bash
function kss() {
  local config_path
  config_path=$(ks select)
  if [ -n "$config_path" ]; then
    export KUBECONFIG="$config_path"
    echo "Switched to cluster config: $config_path"
  fi
}
```

Now use `kss` to select and switch context.
