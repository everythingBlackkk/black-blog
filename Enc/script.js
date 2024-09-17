function showDetails(id) {
    const details = document.querySelectorAll('.details');
    const buttons = document.querySelectorAll('.cipher-button');
    const selectedCipherElement = document.getElementById('selected-cipher');

    details.forEach(detail => detail.style.display = 'none');
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(id).style.display = 'block';
    document.getElementById(`${id}-button`).classList.add('active');

    selectedCipherElement.textContent = document.getElementById(`${id}-button`).textContent;

    // Hide all result divs
    document.querySelectorAll('.result').forEach(result => result.classList.add('hidden'));
}

function showResult(id) {
    const resultElement = document.getElementById(`${id}-result`);
    resultElement.classList.remove('hidden');
}

function encodeURL() {
    const input = document.getElementById('url-input').value;
    const encoded = encodeURIComponent(input);
    document.getElementById('url-result').textContent = `Encoded: ${encoded}`;
    showResult('url');
}

function decodeURL() {
    const input = document.getElementById('url-input').value;
    const decoded = decodeURIComponent(input);
    document.getElementById('url-result').textContent = `Decoded: ${decoded}`;
    showResult('url');
}

function encodeBase64() {
    const input = document.getElementById('base64-input').value;
    const encoded = btoa(unescape(encodeURIComponent(input)));
    document.getElementById('base64-result').textContent = `Encoded: ${encoded}`;
    showResult('base64');
}

function decodeBase64() {
    const input = document.getElementById('base64-input').value;
    try {
        const decoded = decodeURIComponent(escape(atob(input)));
        document.getElementById('base64-result').textContent = `Decoded: ${decoded}`;
    } catch (e) {
        document.getElementById('base64-result').textContent = 'Error: Unable to decode the input text.';
    }
    showResult('base64');
}

function encodeUTF8() {
    const input = document.getElementById('utf8-input').value;
    const encoder = new TextEncoder();
    const encoded = Array.from(encoder.encode(input))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ');
    document.getElementById('utf8-result').textContent = `Encoded: ${encoded}`;
    showResult('utf8');
}

function decodeUTF8() {
    const input = document.getElementById('utf8-input').value;
    const bytes = input.split(' ').map(hex => parseInt(hex, 16));
    const decoder = new TextDecoder();
    const decoded = decoder.decode(new Uint8Array(bytes));
    document.getElementById('utf8-result').textContent = `Decoded: ${decoded}`;
    showResult('utf8');
}

function encodeWTF8() {
    const input = document.getElementById('wtf8-input').value;
    const encoded = unescape(encodeURIComponent(input));
    const hexEncoded = Array.from(encoded)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');
    document.getElementById('wtf8-result').textContent = `Encoded: ${hexEncoded}`;
    showResult('wtf8');
}

function decodeWTF8() {
    const input = document.getElementById('wtf8-input').value;
    const bytes = input.split(' ').map(hex => parseInt(hex, 16));
    const decoded = decodeURIComponent(escape(String.fromCharCode.apply(null, bytes)));
    document.getElementById('wtf8-result').textContent = `Decoded: ${decoded}`;
    showResult('wtf8');
}

function encodeBacon() {
    const input = document.getElementById('bacon-input').value.toUpperCase();
    const shift = parseInt(document.getElementById('shift').value) || 0;
    let result = '';
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        if (char >= 65 && char <= 90) {
            const encodedChar = String.fromCharCode(((char - 65 + shift) % 26) + 65);
            result += encodedChar;
        } else {
            result += input[i];
        }
    }
    document.getElementById('bacon-result').textContent = `Encoded: ${result}`;
    showResult('bacon');
}

function decodeBacon() {
    const input = document.getElementById('bacon-input').value.toUpperCase();
    const shift = parseInt(document.getElementById('shift').value) || 0;
    let result = '';
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        if (char >= 65 && char <= 90) {
            const decodedChar = String.fromCharCode(((char - 65 - shift + 26) % 26) + 65);
            result += decodedChar;
        } else {
            result += input[i];
        }
    }
    document.getElementById('bacon-result').textContent = `Decoded: ${result}`;
    showResult('bacon');
}

// Remove white space after Shift input
function removeShiftWhitespace() {
    const shiftInput = document.getElementById('shift');
    shiftInput.value = shiftInput.value.trim();
}

// Add event listener to Shift input
document.getElementById('shift').addEventListener('blur', removeShiftWhitespace);

// Crack Text effect
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let interval = null;
const element = document.getElementById("code-text");
const originalText = element.innerText;

let index = 0;

function codeCrackEffect() {
    const randomText = originalText
        .split("")
        .map((char, i) => {
            if (i < index) {
                return originalText[i];
            }
            return letters[Math.floor(Math.random() * 26)];
        })
        .join("");

    element.innerText = randomText;

    if (index >= originalText.length) {
        clearInterval(interval);
    }

    index += 1 / 3;
}

interval = setInterval(codeCrackEffect, 50);

// Call showDetails('url') on page load to set the initial state
window.addEventListener('load', () => showDetails('url'));