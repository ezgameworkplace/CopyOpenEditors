import * as vscode from "vscode";

const DEFAULT_FILTER_REGEX = "\\.(cs|ts|vue)$";
const DEFAULT_LINE_PREFIX = "@";
const DEFAULT_PATH_MODE: PathMode = "relative";

type PathMode = "relative" | "absolute";

type ExtensionConfig = {
  filterRegex: string;
  linePrefix: string;
  lineSuffix: string;
  pathMode: PathMode;
};

export function activate(context: vscode.ExtensionContext): void {
  const copyOpenEditorsCommand = vscode.commands.registerCommand(
    "copyOpenEditors.copyList",
    async () => {
      const uris = collectOpenEditorUris();

      if (uris.length === 0) {
        vscode.window.showWarningMessage("No open file editors found.");
        return;
      }

      const config = readExtensionConfig();
      const paths = buildPaths(uris, config.pathMode);
      const filteredPaths = applyRegexFilter(paths, config.filterRegex);

      if (filteredPaths.length === 0) {
        vscode.window.showWarningMessage(
          "No files matched the configured regex filter."
        );
        return;
      }

      const formatted = formatPathList(filteredPaths, config);
      await vscode.env.clipboard.writeText(formatted);
      vscode.window.showInformationMessage(
        `Copied ${filteredPaths.length} file path(s) to clipboard.`
      );
    }
  );

  context.subscriptions.push(copyOpenEditorsCommand);
}

export function deactivate(): void {
  // No resources to dispose manually.
}

function collectOpenEditorUris(): vscode.Uri[] {
  const collected: vscode.Uri[] = [];
  const seen = new Set<string>();

  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      const uri = getTabUri(tab.input);
      if (!uri || seen.has(uri.toString())) {
        continue;
      }
      seen.add(uri.toString());
      collected.push(uri);
    }
  }

  return collected;
}

function readExtensionConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration("copyOpenEditors");
  const rawPathMode = config.get<string>("pathMode", DEFAULT_PATH_MODE);
  return {
    filterRegex: config.get<string>("filterRegex", DEFAULT_FILTER_REGEX).trim(),
    linePrefix: config.get<string>("linePrefix", DEFAULT_LINE_PREFIX),
    lineSuffix: config.get<string>("lineSuffix", ""),
    pathMode: parsePathMode(rawPathMode)
  };
}

function parsePathMode(pathMode: string): PathMode {
  return pathMode === "absolute" ? "absolute" : "relative";
}

function buildPaths(uris: vscode.Uri[], pathMode: PathMode): string[] {
  if (pathMode === "absolute") {
    return uris.map((uri) => uri.fsPath);
  }
  return uris.map((uri) => vscode.workspace.asRelativePath(uri, false));
}

function applyRegexFilter(paths: string[], filterRegex: string): string[] {
  if (!filterRegex) {
    return paths;
  }

  let pattern: RegExp;
  try {
    pattern = new RegExp(filterRegex);
  } catch {
    void vscode.window.showErrorMessage(
      `Invalid regex in copyOpenEditors.filterRegex: ${filterRegex}`
    );
    return paths;
  }

  return paths.filter((path) => pattern.test(path));
}

function getTabUri(input: unknown): vscode.Uri | undefined {
  if (input instanceof vscode.TabInputText) {
    return input.uri;
  }
  if (input instanceof vscode.TabInputTextDiff) {
    return input.modified;
  }
  if (input instanceof vscode.TabInputCustom) {
    return input.uri;
  }
  if (input instanceof vscode.TabInputNotebook) {
    return input.uri;
  }
  if (input instanceof vscode.TabInputNotebookDiff) {
    return input.modified;
  }
  return undefined;
}

function formatPathList(paths: string[], config: ExtensionConfig): string {
  return paths
    .map((path) => `${config.linePrefix}${path}${config.lineSuffix}`)
    .join("\n");
}
