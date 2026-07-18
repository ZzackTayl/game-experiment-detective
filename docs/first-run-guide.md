# First-Run Owner Guide

This is the shortest safe path from "I have never worked on a game" to "I can
run, test, inspect, and make a small change to **The Vanishing Variable**."

Use the [Development Bible](development-bible.md) when you want to understand
why something works. Use the [Asset Bible](asset-bible.md) when you want to add
art, sound, fonts, video, or possible future 3D content.

## First, an important correction

This repository is **not a Godot project**. There is no GODAP or Godot editor
project in it, and there are no Godot scenes, nodes, scripts, or imported
resources.

The current game is a small website:

- HTML supplies the page shell.
- CSS supplies the appearance and layout.
- JavaScript supplies the screens, story data, and rules.
- A web browser displays and runs it.

If "GODAP editor" meant the Godot editor, do not import this folder into Godot.
Converting the game to Godot would be a separate rewrite. For the current game,
use a normal code editor, a terminal, and a browser.

## 1. What you need

| Tool | What it means | What you use it for |
| --- | --- | --- |
| Code editor | An app that edits text files | Open the repository and change HTML, CSS, JavaScript, or guides |
| Node.js | A program that can run JavaScript outside the browser | Start the local server and run tests |
| npm | A command tool installed with Node.js | Run the saved `start` and `test` commands |
| Modern browser | Chrome, Edge, Firefox, or Safari | Play the game and use browser developer tools |
| Terminal | A window where you type commands | Run the server and tests |

Install a current Node.js Long-Term Support release from the official Node.js
source if Node is not already available. This repository does not pin an exact
version. Choose a release that is currently supported rather than installing an
older end-of-life release merely because it can run the current JavaScript.

You do **not** need:

- Godot, Unity, or Unreal;
- a database;
- an account, API key, or `.env` file;
- `npm install`;
- a compiler or build step;
- paid software.

## 2. Open the project

Open the repository's top-level folder in your code editor. You are in the right
folder when you can see:

```text
README.md
index.html
styles.css
server.mjs
package.json
js/
docs/
test/
```

Open a terminal at that same folder. In this project's managed coding
environment the folder is `/workspace/repo`; on your own computer its location
depends on where you downloaded it.

Check that Node and npm are available:

```sh
node --version
npm --version
```

Each command should print a version number. If a command says it is unknown or
not found, install Node.js and reopen the terminal.

## 3. Check the unchanged project

Run the automated checks before making a change:

```sh
npm test
```

The command:

1. checks `js/main.js` for JavaScript syntax errors;
2. checks `js/engine.js` for JavaScript syntax errors;
3. runs the rule and case-data tests in `test/engine.test.js`.

A healthy run ends with all tests passing and no failures. If the unchanged
project fails, save the complete terminal output before editing anything.

## 4. Start the game

Run:

```sh
npm start
```

Keep that terminal open. A healthy start prints:

```text
Case files available at http://localhost:8080
```

Open `http://localhost:8080` in your browser.

Do not double-click `index.html` as the normal workflow. Its JavaScript uses
browser modules, and browsers may block those modules on a `file://` address.

**Use this server only for trusted local development.** It currently serves
files from the entire repository and does not explicitly limit itself to the
loopback interface. Do not open the port to the public internet, share the
address on an untrusted network, or use this command as production hosting. Stop
the server when you are done.

To stop the server, return to its terminal and press `Ctrl+C`.

### Use another port

Port `8080` is the default. If another program already uses it, macOS and Linux
users can start on another numeric port:

```sh
PORT=3000 npm start
```

Then open `http://localhost:3000`.

On Windows PowerShell:

```powershell
$env:PORT=3000; npm start
```

The port does not change game rules, but a browser treats each port as a
different origin. Progress saved at `localhost:8080` will not appear at
`localhost:3000`; it remains stored under the old address.

## 5. Play one complete test route

Use this checklist before changing code:

1. On the title screen, choose **Accept the case**.
2. Read the briefing and choose **Begin investigation**.
3. Search locations and interview suspects.
4. Watch one action disappear for each normal lead.
5. Confirm each collected clue appears in chronological order in the casebook.
6. Collect both sides of a contradiction.
7. Confirm the contradiction appears and a confrontation becomes available.
8. Confront the named suspect. This costs one action.
9. Choose **Make an accusation**.
10. Select one suspect, one motive, and exactly two collected clues.
11. Submit and inspect the result and deduction breakdown.
12. Start another variant and confirm the game can replay.

The randomly selected case may differ between runs. The current solution and
contradiction table is in
[Timeline, Contradiction, and Confrontation System](contradiction-system.md).
That document contains spoilers and is intended for development testing.

### Test the failure routes too

- Ask for a hint and confirm it costs two actions.
- Submit an incomplete accusation and confirm a clear error appears.
- Submit a valid but incorrect theory and confirm the game reaches a loss result
  without breaking.
- Navigate with `Tab`, `Shift+Tab`, `Enter`, and `Space` instead of a mouse.
- Narrow the browser window to a phone-like width and confirm there is no
  horizontal page scrolling.

The code contains an exhausted-result screen and synthetic engine tests for
zero actions without confrontation. That route is not currently reachable
through the legal player controls: five searches, four interviews, and one
two-action hint can spend only 11 of the 12 actions without confrontation. Do
not treat that dormant screen as a manual first-run check unless the action
economy changes.

## 6. Learn the three browser panels you need

Open browser developer tools, usually with `F12`, `Ctrl+Shift+I`, or
`Cmd+Option+I`.

### Console

The Console shows JavaScript and security-policy errors.

After a normal run, there should be no red errors. When asking for help, copy the
first error and its file/line location instead of only saying "it does not work."

### Network

The Network panel shows files requested by the page.

Reload the page with this panel open. `index.html`, `styles.css`, `js/main.js`,
`js/cases.js`, and `js/engine.js` should load successfully. Later, use this panel
to find missing asset files, wrong paths, wrong MIME types, and unexpectedly
large downloads.

### Application or Storage

The game stores solved variant IDs and best scores in browser `localStorage`
under:

```text
game-experiment-detective:v1
```

It does not save an active investigation. Reloading returns to the title. The
title's **Reset progress** button clears saved wins and scores after confirmation.

Different addresses have separate storage. For example, `localhost:8080` and
`127.0.0.1:8080` do not share progress.

## 7. Know which file to open

| You want to change | Start here | Usually also inspect |
| --- | --- | --- |
| Story, clues, suspects, motives, locations, or solutions | `js/cases.js` | `js/engine.js`, `test/engine.test.js`, `docs/contradiction-system.md` |
| Action costs, phases, hints, accusation rules, score, or rank | `js/engine.js` | `js/main.js`, `test/engine.test.js` |
| Screen text, buttons, forms, or visible screen order | `js/main.js` | `index.html`, `styles.css`, `js/engine.js` |
| Colors, spacing, fonts, cards, phone layout, or focus appearance | `styles.css` | `js/main.js`, `index.html` |
| Header, page title, metadata, favicon, or security policy | `index.html` | `server.mjs`, `styles.css` |
| Local serving, port, headers, file types, or MIME errors | `server.mjs` | `index.html`, `package.json` |
| Art, icons, audio, fonts, video, or possible future 3D | `docs/asset-bible.md` | `js/cases.js`, `js/main.js`, `styles.css`, `server.mjs` |
| Tests | `test/engine.test.js` | The source file being changed |

`js/engine.js` is a file containing game rules. It is not the Godot engine.

## 8. Make a first safe change

Change one small thing at a time. Save, reload, inspect, and test before making
another change.

### Example A: change the accent color

Open `styles.css`. Near the top, `:root` contains named color variables:

```css
--accent: #e8b45d;
```

Change only the color value, save, and reload the browser. Check buttons, focus
outlines, timeline markers, text contrast, and forced-colors behavior. Run:

```sh
npm test
```

The unit tests do not judge visual quality, so a passing test does not replace
browser inspection.

### Example B: change a suspect profile

Open `js/cases.js`. Find the suspect in the exported `suspects` array and edit
only the `profile` text. Save and reload into a new case.

Do not casually change the suspect's `id`. IDs connect case data, actions,
confrontations, tests, and saved progress.

### Example C: change home-screen wording

Open `js/main.js` and find `renderHome()`. Edit a visible text string without
changing element structure or actions. Save, reload, then test keyboard focus and
the phone-width layout.

### Example D: author a new case

Do not start by copying random clue fields. Follow the
`case-authoring` AI skill in `.agent/skills/case-authoring/SKILL.md` and the
[Development Bible](development-bible.md). A case must have complete location
and interview evidence, timeline data, one coherent contradiction, one
confrontation, and exactly three decisive evidence IDs.

## 9. Your normal edit loop

Repeat this short loop for every change:

1. Decide the smallest behavior or content you are changing.
2. Read the relevant guide and source-of-truth file.
3. Make one focused edit.
4. Run `npm test`.
5. Keep `npm start` running and reload the browser.
6. Check the Console and Network panels.
7. Play every screen affected by the change.
8. Test keyboard use and a 320-pixel-wide layout.
9. Check failure behavior, not only the successful path.
10. Review the final file changes and remove experiments that should not ship.

There is no build command. The files the browser reads are the files you edit.

## 10. Common first-run problems

### The page is blank

1. Confirm the address starts with `http://localhost`, not `file://`.
2. Confirm `npm start` is still running.
3. Open the Console and copy the first error.
4. Open Network and find requests marked red or 404.
5. Run `npm test` to find JavaScript syntax errors.

### `npm` or `node` is not found

Install Node.js, close and reopen your terminal and editor, then rerun the version
commands.

### Port 8080 is already in use

Stop the other local program or use another port as shown above.

### My change does not appear

Save the file, confirm you edited the correct repository, reload the page, and
make sure the browser is connected to the port printed by the server. For a
stubborn cached response, reload while developer tools are open and disable the
Network panel's cache temporarily.

### My new image, sound, or font does not load

Follow the [Asset Bible import workflow](asset-bible.md#8-import-and-test-workflow).
Check the exact path and filename casing, Network status, Console CSP message,
and MIME mapping in `server.mjs`.

### The game forgot my current case

That is current behavior. Only solved variants and best winning scores persist.
An active investigation is memory-only and is lost on reload.

### The tests pass but the page looks wrong

The current automated suite checks data and game rules, not browser layout or
pixels. Perform the browser, keyboard, console, and narrow-screen checks.

## 11. First-session completion checklist

- [ ] I know this is a browser game, not a Godot project.
- [ ] `node --version` and `npm --version` work.
- [ ] `npm test` passes before my edits.
- [ ] `npm start` serves `http://localhost:8080`.
- [ ] I completed a contradiction, confrontation, accusation, and result.
- [ ] I found the Console, Network, and Storage panels.
- [ ] I know which source file owns the change I want.
- [ ] I made one small change and checked it in the browser.
- [ ] `npm test` still passes.
- [ ] I checked keyboard use, a narrow window, and the affected failure path.

Next, read the [Development Bible](development-bible.md), or jump to the
[Asset Bible](asset-bible.md) if your next task is an art or audio plan.