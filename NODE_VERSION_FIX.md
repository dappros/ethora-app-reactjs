# Node.js Version Update - dev-tf Branch

## Changes Made

### 1. Node.js Version Upgrade
- **Installed Node.js 20.19.6** (via nvm)
- **Previous version:** Node.js 18.19.1
- **Reason:** `react-router-dom@7.x` (pulled in by `@ethora/ai-chat-widget` and `@ethora/chat-component`) requires Node >=20.0.0

### 2. Configuration Files Added
- **`.nvmrc`** - Specifies Node.js 20 for automatic version switching with nvm
- **`package.json`** - Added `engines` field to enforce Node >=20.0.0 and npm >=10.0.0

### 3. Results
- ✅ **EBADENGINE warnings resolved** - All Node version mismatch warnings are gone
- ✅ **Dependencies installed successfully** - 992 packages installed
- ⚠️ **15 moderate vulnerabilities remain** - These are in transitive dependencies and require breaking changes to fix:
  - `esbuild` (via `vite`) - Would require upgrading to vite 7.2.7 (breaking change)
  - `prismjs` (via `react-syntax-highlighter`) - Would require upgrading to react-syntax-highlighter 16.1.0 (breaking change)
  - `undici` (via `firebase`) - Would require upgrading to firebase 12.6.0 (breaking change)

### 4. Deprecated Packages (Non-Critical)
These are transitive dependencies and don't affect functionality:
- `inflight@1.0.6` - Used by older dependencies
- `glob@7.2.3` - Used by older dependencies
- `node-domexception@1.0.0` - Used by older dependencies
- `@mui/base@5.0.0-beta.42` - Replaced by `@base-ui-components/react` (but still works)

## Usage

### Automatic Node Version Switching
If you have nvm installed, simply run:
```bash
cd ethora-app-reactjs
nvm use  # Automatically uses Node 20 from .nvmrc
```

### Manual Setup
If nvm is not installed or you want to use a different Node version manager:
```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node 20
nvm install 20
nvm use 20
nvm alias default 20
```

## Remaining Issues

### Vulnerabilities
The remaining 15 moderate vulnerabilities are in transitive dependencies. To fix them would require:
1. **Upgrading vite** to 7.x (breaking change - may require code updates)
2. **Upgrading react-syntax-highlighter** to 16.x (breaking change - may require code updates)
3. **Upgrading firebase** to 12.x (breaking change - may require code updates)

These can be addressed in future updates when ready to handle breaking changes.

### Deprecated Packages
The deprecated packages are transitive dependencies and don't pose immediate risks. They will be updated automatically when their parent packages are updated.

## Testing

After switching to Node 20:
1. Verify Node version: `node --version` (should show v20.x.x)
2. Reinstall dependencies: `npm install` (should have no EBADENGINE warnings)
3. Test the app: `npm run dev` (should start without issues)

