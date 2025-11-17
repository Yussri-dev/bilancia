const fs = require("fs");

const file = "app.json";
const raw = fs.readFileSync(file);
const app = JSON.parse(raw);

const versionParts = app.expo.version.split(".");
let [major, minor, patch] = versionParts.map(Number);
patch++;

const newVersion = `${major}.${minor}.${patch}`;
app.expo.version = newVersion;

if (!app.expo.android.versionCode) {
    app.expo.android.versionCode = 1;
}

app.expo.android.versionCode += 1;

if (!app.expo.ios.buildNumber) {
    app.expo.ios.buildNumber = "1";
}

app.expo.ios.buildNumber = (parseInt(app.expo.ios.buildNumber) + 1);


console.log("Version bumped")
console.log("New app version : ", newVersion)