// Server-side extension (Module) for Auto Time Increment

console.log("Auto Time Increment (Server) module is loading..."); // Added for startup check



const moment = require('moment'); // Use require for Node.js modules

// --- Configuration ---
const timeIncrementMinutes = 10;
const timeFormat = "YYYY-MM-DD HH:mm A"; // 
const timeMarker = "[TIME]"; // 


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
            console.error("Auto Time Increment (Server) Error: Moment.js is not available.");
            return prompt;
        }
    }
}



/**
 * Modifies the input prompt string before it's processed further or sent to the AI.
 * @param {string} text The incoming prompt string.
 * @param {object} data Additional data often passed (context, history etc. - may vary)
 * @returns {string} The modified prompt string.
 */
async function inputModifier(text, data) {

    const modifiedText = updateTimeInPrompt(text);
    return modifiedText; 
}


module.exports = {
    inputModifier 
};

console.log("Auto Time Increment (Server) module loaded."); // Confirmation in server console
