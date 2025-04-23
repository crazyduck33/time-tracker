// Server-side extension (Module) for Auto Time Increment

console.log("Auto Time Increment (Server) module is loading..."); // Added for startup check
//You'll likely need to import extension_settings, getContext, and loadExtensionSettings from extensions.js
import { event_types, eventSource, getRequestHeaders } from '../../../../script.js';
import { AutoComplete } from '../../../autocomplete/AutoComplete.js';
import { extensionNames } from '../../../extensions.js';
import { Popup } from '../../../popup.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { renderTemplateAsync } from '../../../templates.js';
import { debounce, debounceAsync, delay, download, getSortableDelay, isTrueBoolean, uuidv4 } from '../../../utils.js';
// Keep track of where your extension is located, name should match repo name
const extensionName = "time Tracker";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {};
// Import the moment library (SillyTavern server environment usually provides it)
const moment = require('moment'); // Use require for Node.js modules

// --- Configuration ---
const timeIncrementMinutes = 10;
const timeFormat = "YYYY-MM-DD HH:mm A"; // Example: 2025-04-23 12:11 AM CEST
const timeMarker = "[TIME]"; // Use a clear marker

// Core logic function (mostly unchanged from the UI version)
function updateTimeInPrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
        console.warn("Auto Time Increment (Server): Received invalid prompt type.");
        return prompt;
    }

    const startIndex = prompt.indexOf(timeMarker);
    if (startIndex !== -1) {
        const timeStringStart = startIndex + timeMarker.length;
        let timeStringEnd = prompt.indexOf("\n", timeStringStart);
        if (timeStringEnd === -1) {
            timeStringEnd = prompt.length;
        }
        const currentTimeStr = prompt.substring(timeStringStart, timeStringEnd).trim();

        if (moment && moment(currentTimeStr, timeFormat, true).isValid()) {
            try {
                const currentTime = moment(currentTimeStr, timeFormat);
                currentTime.add(timeIncrementMinutes, 'minutes');
                const newTimeString = currentTime.format(timeFormat);
                const newPrompt = prompt.substring(0, timeStringStart) + " " + newTimeString + prompt.substring(timeStringEnd);
                console.log(`Auto Time Increment (Server): Updated time to ${newTimeString}`); // Log to server console
                return newPrompt;
            } catch (error) {
                console.error(`Auto Time Increment (Server): Error processing time: ${error.message}`);
                return prompt; // Return original on error
            }
        } else {
            console.error(`Auto Time Increment (Server) Error: Could not parse time string: '${currentTimeStr}'. Check format against '${timeFormat}'.`);
            return prompt; // Return original prompt on parsing error
        }
    } else {
        // Marker not found, insert initial time
        if (moment) {
            const now = moment();
            const startTimeStr = now.format(timeFormat);
            console.log(`Auto Time Increment (Server): Initializing time to ${startTimeStr}`); // Log to server console
            // Add marker and time at the beginning (adjust placement if needed)
            return `${timeMarker} ${startTimeStr}\n${prompt}`;
        } else {
            // This case is unlikely if require('moment') succeeded
            console.error("Auto Time Increment (Server) Error: Moment.js is not available.");
            return prompt;
        }
    }
}

// --- SillyTavern Module Integration ---
// Export a function that SillyTavern calls to modify input/prompts.
// The exact name and signature might vary slightly between ST versions,
// but 'inputModifier' or similar is common for modifying text before AI processing.
// It often receives the text directly or within a data object.
// Let's assume a common pattern where it receives the text and should return the modified text.

/**
 * Modifies the input prompt string before it's processed further or sent to the AI.
 * @param {string} text The incoming prompt string.
 * @param {object} data Additional data often passed (context, history etc. - may vary)
 * @returns {string} The modified prompt string.
 */
async function inputModifier(text, data) {
    // Call the core logic function to update the time within the text
    const modifiedText = updateTimeInPrompt(text);
    return modifiedText; // Return the potentially modified text
}

// Export the modifier function so SillyTavern can use it
module.exports = {
    inputModifier // Make the inputModifier function available to SillyTavern
};

console.log("Auto Time Increment (Server) module loaded."); // Confirmation in server console
