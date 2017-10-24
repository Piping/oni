/**
 * SignatureHelp.ts
 *
 */

import * as types from "vscode-languageserver-types"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import * as UI from "./../../UI"

import { editorManager } from "./../EditorManager"
import { languageManager } from "./LanguageManager"

export const showSignatureHelp = async (language: string, filePath: string, line: number, column: number) => {
    if (languageManager.isLanguageServerAvailable(language)) {

        const buffer = editorManager.activeEditor.activeBuffer
        const currentLine = await buffer.getLines(line, line + 1)

        const requestColumn = getSignatureHelpTriggerColumn(currentLine[0], column, ["("])

        if (requestColumn < 0) {
            UI.Actions.hideSignatureHelp()
        }

        const args = {
            textDocument: {
                uri: Helpers.wrapPathInFileUri(filePath),
            },
            position: {
                line,
                character: column,
            },
        }

        let result: types.SignatureHelp
        try {
            result = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/signatureHelp", args)
        } catch (ex) { }

        if (result) {
            UI.Actions.showSignatureHelp(result)
        } else {
            UI.Actions.hideSignatureHelp()
        }
    }
}

export const hideSignatureHelp = () => {
    UI.Actions.hideSignatureHelp()
}

// TODO: `getSignatureHelpTriggerColumn` rename to `getNearestTriggerCharacter`
export const getSignatureHelpTriggerColumn = (line: string, character: number, triggerCharacters: string[]): number => {

    let idx = character
    while (idx >= 0) {
        if (line[idx] === triggerCharacters[0]) {
            break
        }

        idx--
    }

    return idx
}