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

function showResult(resultId, result) {
    const resultElement = document.getElementById(resultId);
    resultElement.textContent = result;
    resultElement.classList.remove('hidden');

    // Remove existing copy button if any
    const existingCopyButton = resultElement.nextElementSibling;
    if (existingCopyButton && existingCopyButton.classList.contains('btn-copy')) {
        existingCopyButton.remove();
    }

    // Add new copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'btn-copy';
    copyButton.innerHTML = `
        <span data-text-end="Copied!" data-text-initial="Copy to clipboard" class="cp-tooltip"></span>
        <span>
            <svg xml:space="preserve" style="enable-background:new 0 0 512 512" viewBox="0 0 6.35 6.35" y="0" x="0" height="20" width="20" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xmlns="http://www.w3.org/2000/svg" class="cp-clipboard">
                <g>
                    <path fill="currentColor" d="M2.43.265c-.3 0-.548.236-.573.53h-.328a.74.74 0 0 0-.735.734v3.822a.74.74 0 0 0 .735.734H4.82a.74.74 0 0 0 .735-.734V1.529a.74.74 0 0 0-.735-.735h-.328a.58.58 0 0 0-.573-.53zm0 .529h1.49c.032 0 .049.017.049.049v.431c0 .032-.017.049-.049.049H2.43c-.032 0-.05-.017-.05-.049V.843c0-.032.018-.05.05-.05zm-.901.53h.328c.026.292.274.528.573.528h1.49a.58.58 0 0 0 .573-.529h.328a.2.2 0 0 1 .206.206v3.822a.2.2 0 0 1-.206.205H1.53a.2.2 0 0 1-.206-.205V1.529a.2.2 0 0 1 .206-.206z"></path>
                </g>
            </svg>
            <svg xml:space="preserve" style="enable-background:new 0 0 512 512" viewBox="0 0 24 24" y="0" x="0" height="18" width="18" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xmlns="http://www.w3.org/2000/svg" class="cp-check-mark">
                <g>
                    <path data-original="#000000" fill="currentColor" d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"></path>
                </g>
            </svg>
        </span>
    `;
    copyButton.onclick = () => copyResult(resultId);
    resultElement.parentNode.insertBefore(copyButton, resultElement.nextSibling);
}

function copyResult(resultId) {
    const resultElement = document.getElementById(resultId);
    const text = resultElement.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const button = resultElement.nextElementSibling;
        const tooltip = button.querySelector('.cp-tooltip');
        tooltip.setAttribute('data-text-initial', 'Copied!');
        setTimeout(() => {
            tooltip.setAttribute('data-text-initial', 'Copy to clipboard');
        }, 2000);
    });
}

function encodeURL() {
    const input = document.getElementById('url-input').value;
    const encoded = encodeURIComponent(input);
    showResult('url-result', encoded);
}

function decodeURL() {
    const input = document.getElementById('url-input').value;
    const decoded = decodeURIComponent(input);
    showResult('url-result', decoded);
}

function encodeBase64() {
    const input = document.getElementById('base64-input').value;
    const encoded = btoa(unescape(encodeURIComponent(input)));
    showResult('base64-result', encoded);
}

function decodeBase64() {
    const input = document.getElementById('base64-input').value;
    try {
        const decoded = decodeURIComponent(escape(atob(input)));
        showResult('base64-result', decoded);
    } catch (e) {
        document.getElementById('base64-result').textContent = 'Error: Unable to decode the input text.';
    }
}

function encodeUTF8() {
    const input = document.getElementById('utf8-input').value;
    const encoder = new TextEncoder();
    const encoded = Array.from(encoder.encode(input))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ');
    showResult('utf8-result', encoded);
}

function decodeUTF8() {
    const input = document.getElementById('utf8-input').value;
    const bytes = input.split(' ').map(hex => parseInt(hex, 16));
    const decoder = new TextDecoder();
    const decoded = decoder.decode(new Uint8Array(bytes));
    showResult('utf8-result', decoded);
}

function encodeWTF8() {
    const input = document.getElementById('wtf8-input').value;
    const encoded = unescape(encodeURIComponent(input));
    const hexEncoded = Array.from(encoded)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');
    showResult('wtf8-result', hexEncoded);
}

function decodeWTF8() {
    const input = document.getElementById('wtf8-input').value;
    const bytes = input.split(' ').map(hex => parseInt(hex, 16));
    const decoded = decodeURIComponent(escape(String.fromCharCode.apply(null, bytes)));
    showResult('wtf8-result', decoded);
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
    showResult('bacon-result', result);
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
    showResult('bacon-result', result);
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
