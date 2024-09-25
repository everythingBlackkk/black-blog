const vulnerabilities = {
    'SQL Injection (SQLi)': [
        'inurl:".php?id=" AND intext:"mysql_fetch_array"',
        'inurl:index.php?id=',
        'inurl:".php?id=" AND intext:"You have an error in your SQL syntax"',
        'inurl:".php?id=" AND intext:"Warning: mysql_fetch_array()"',
        'inurl:".php?id=" AND intext:"Warning: mysql_fetch_assoc()"',
        'inurl:".php?id=" AND intext:"Warning: mysql_num_rows()"',
        'inurl:".php?id=" intext:"sqlite_fetch_array()"',
        'inurl:".aspx?id=" intext:"unclosed quotation mark after the character string"',
        'inurl:".asp?id=" intext:"Syntax error in string in query expression"',
        'inurl:".jsp?id=" intext:"SQLException"',
        'inurl:".php?id=" intext:"ORA-01756: quoted string not properly terminated"',
        'inurl:".cgi?id=" intext:"Error Occurred While Processing Request"'
    ],
    'Local File Inclusion (LFI)': [
        'inurl:include_path=',
        'inurl:"/index.php?path="',
        'inurl:".php?file="',
        'inurl:".php?cat="',
        'inurl:".php?include="',
        'inurl:".php?page="',
        'inurl:".asp?file="',
        'inurl:".jsp?page="',
        'inurl:".php?doc="',
        'inurl:".php?folder="',
        'inurl:".php?path="',
        'inurl:".php?pg="'
    ],
    'Remote File Inclusion (RFI)': [
        'inurl:".php?url="',
        'inurl:".php?link="',
        'inurl:".php?src="',
        'inurl:".php?source="',
        'inurl:".php?redir="',
        'inurl:".php?redirect="',
        'inurl:".php?go="',
        'inurl:".php?load="',
        'inurl:".php?iframe="',
        'inurl:".php?inc="',
        'inurl:".php?path="',
        'inurl:".php?pg="'
    ],
    'Cross-Site Scripting (XSS)': [
        'inurl:".php?search=" AND intext:"<script>"',
        'inurl:".php?q=" AND intext:"<script>"',
        'inurl:".asp?search=" AND intext:"<script>"',
        'inurl:".jsp?q=" AND intext:"<script>"',
        'inurl:".php?keyword=" AND intext:"<script>"',
        'inurl:".aspx?s=" AND intext:"<script>"',
        'inurl:".php?query=" AND intext:"alert("',
        'inurl:".php?s=" AND intext:"onclick="',
        'inurl:".php?input=" AND intext:"onerror="',
        'inurl:".php?p=" AND intext:"onload="'
    ],
    'Open Redirects': [
        'inurl:redir site:example.com',
        'inurl:redirect site:example.com',
        'inurl:return site:example.com',
        'inurl:next site:example.com',
        'inurl:url= intext:"http"',
        'inurl:link= intext:"http"',
        'inurl:goto= intext:"http"',
        'inurl:target= intext:"http"',
        'inurl:destination= intext:"http"',
        'inurl:rurl= intext:"http"',
        'inurl:redirect_uri= intext:"http"',
        'inurl:continue= intext:"http"'
    ],
    'Server-Side Request Forgery (SSRF)': [
        'inurl:".php?url=" intext:"curl"',
        'inurl:".php?site=" intext:"allow_url_include"',
        'inurl:".php?proxy=" intext:"file_get_contents"',
        'inurl:".php?request=" intext:"fsockopen"',
        'inurl:".php?fetch=" intext:"pfsockopen"',
        'inurl:".php?load=" intext:"stream_context_create"',
        'inurl:".php?page=" intext:"curl_exec"',
        'inurl:".php?url=" intext:"file_get_contents"',
        'inurl:".php?site=" intext:"curl_setopt"',
        'inurl:".php?proxy=" intext:"fopen"'
    ],
    'File Upload Vulnerabilities': [
        'inurl:upload.php',
        'intitle:"Index of" intext:upload',
        'inurl:upload intext:"choose file"',
        'inurl:upload.asp',
        'inurl:upload.jsp',
        'inurl:uploadfile.php',
        'inurl:fileupload.php',
        'inurl:upload.aspx',
        'intitle:"File Upload Results"',
        'inurl:upload intext:"upload file"',
        'inurl:upload intext:"file upload"',
        'inurl:uploader.php'
    ],
    'Information Disclosure': [
        'filetype:log username password',
        'ext:sql intext:password',
        'intitle:"Index of" password.txt',
        'filetype:env "DB_PASSWORD"',
        'filetype:ini "mysql_connect"',
        'filetype:config intext:password',
        'inurl:"/phpinfo.php" intext:"PHP Version"',
        'intitle:"Index of" intext:".htpasswd"',
        'filetype:bak intext:password',
        'intitle:"Index of" ".bash_history"',
        'filetype:txt intext:"password" intext:"username"',
        'intitle:"Apache Status" "Apache Server Status for"'
    ],
    'Admin Panels': [
        'inurl:admin intitle:login',
        'inurl:adminpanel',
        'inurl:wp-admin',
        'intitle:"Login to the Admin Panel"',
        'inurl:admin/login.php',
        'inurl:admin/dashboard',
        'inurl:administrator/index.php',
        'inurl:admin.aspx',
        'inurl:admin/admin-login.php',
        'inurl:cpanel',
        'inurl:webadmin',
        'intitle:"Admin Login" "admin login"'
    ],
    'API Endpoints': [
        'inurl:"/api/v1/" site:example.com',
        'inurl:"/api/v2/" site:example.com',
        'intitle:"API Documentation"',
        'inurl:swagger site:example.com',
        'inurl:api intext:"API Key"',
        'inurl:developers site:example.com',
        'inurl:api.php site:example.com',
        'inurl:api/ filetype:json',
        'inurl:api/ filetype:xml',
        'inurl:graphql site:example.com',
        'inurl:api intext:"authentication"',
        'inurl:api intext:"endpoint"'
    ]
};

const vulnerabilitySelect = document.getElementById('vulnerabilitySelect');
const dorksContainer = document.getElementById('dorksContainer');
const targetSiteInput = document.getElementById('targetSite');
const subdomainCheckbox = document.getElementById('subdomainSearch');

// Populate vulnerability types
for (const vuln in vulnerabilities) {
    const option = document.createElement('option');
    option.value = vuln;
    option.textContent = vuln;
    vulnerabilitySelect.appendChild(option);
}

function generateDorks() {
    const selectedVuln = vulnerabilitySelect.value;
    const targetSite = targetSiteInput.value.trim();
    const includeSubdomains = subdomainCheckbox.checked;

    dorksContainer.innerHTML = '';

    if (selectedVuln && vulnerabilities[selectedVuln]) {
        vulnerabilities[selectedVuln].forEach(dork => {
            const dorkItem = document.createElement('div');
            dorkItem.className = 'dork-item';

            let finalDork = dork;
            if (targetSite) {
                finalDork = includeSubdomains ? 
                    `site:*.${targetSite} ${dork}` : 
                    `site:${targetSite} ${dork}`;
            }

            const dorkText = document.createElement('span');
            dorkText.className = 'dork-text';
            dorkText.textContent = finalDork;
            dorkItem.appendChild(dorkText);

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.className = 'copy-btn';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(finalDork).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                    }, 2000);
                });
            };
            buttonContainer.appendChild(copyButton);

            const searchButton = document.createElement('button');
            searchButton.textContent = 'Search';
            searchButton.className = 'search-btn';
            searchButton.onclick = () => {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(finalDork)}`;
                window.open(searchUrl, '_blank');
            };
            buttonContainer.appendChild(searchButton);

            dorkItem.appendChild(buttonContainer);

            dorksContainer.appendChild(dorkItem);
        });
    }
}

vulnerabilitySelect.addEventListener('change', generateDorks);
targetSiteInput.addEventListener('input', generateDorks);
subdomainCheckbox.addEventListener('change', generateDorks);

// Tricks 
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let interval = null;
const element = document.getElementById("title");
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