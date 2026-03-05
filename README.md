# Copy Open Editors

Copy the file list of all currently open editors in VS Code to the clipboard.

## What It Is For

Use this extension when you want to quickly export the current open-file context, such as sharing task scope, recording your working set, or generating a checklist.

## How To Use

1. Open files in VS Code editors.
2. Open Command Palette (`Ctrl+Shift+P`).
3. Run `Copy Open Editors: Copy File List`.
4. Paste from clipboard.

Output is one file path per line.

## Configurable Parameters

You can configure settings in VS Code Settings by searching `Copy Open Editors`, or in `settings.json`.

```json
{
  "copyOpenEditors.filterRegex": "\\.(cs|ts|vue)$",
  "copyOpenEditors.linePrefix": "@",
  "copyOpenEditors.lineSuffix": ""
}
```

- `copyOpenEditors.filterRegex`
  - Type: `string`
  - Default: `"\\.(cs|ts|vue)$"`
  - Filters file paths by regex before output.
  - Example: `^src/.*\\.ts$`

- `copyOpenEditors.linePrefix`
  - Type: `string`
  - Default: `"@"`
  - Adds text before each output line.
  - Example: `- `

- `copyOpenEditors.lineSuffix`
  - Type: `string`
  - Default: `""`
  - Adds text after each output line.
  - Example: ` #open`

## Notes

- If no file editors are open, the command shows a warning.
- If regex is invalid, the command shows an error and skips filtering.
- If filtering matches no files, the command shows a warning.
