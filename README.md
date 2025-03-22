# ChoiceScriptTools
Tools to help Choicescript authors with the development and debugging.

## Disclaimer
This tool is provided as-is, with no guarantees of maintenance or support. I take no responsibility for any loss or issues arising from its use. Read the license for more details. This tool is intended for developers and testers only. Do not use it for any nefarious purposes.

## StatEditor.js

### Features
- Allows changing stats (**both global and temp variables**) from the webpage itself.
- Enables freezing variable values.

### Installation
- Download and paste the [file](https://github.com/sid-the-sloth1/ChoiceScriptTools/blob/main/StatEditor/Stateditor.js "file") in "**web**" directory along with other js files of Choicescript.

- Open the "**mygame**" folder and open the **index.html** in a text editor/IDE.

- Paste the below snippet before the `<script src="mygame.js"></script>` line. If you change the name of file after downloading, make sure to change the below line accordingly.

```html
<script src="../Stateditor.js"></script>
```
- Search for `window.storeName`, if it equals to `null`, then replace `null` with any string of letters enclosed in quotes (eg: `"vdcgfsdgjbfjgvdsjgfhvjadctcacxddsjvldjg"`). The storeName serves as an identifier for saving data in browser storage, so ensure it is unique for each game you develop or test.

- Save the file.

### Usage

#### Editing variables

- Open the game in the browser.  You will see a button titled `Edit Stats` next to the other buttons. Click on it.
- If you wish to edit **global variables**, then click on `Edit Globals`. Iḟ you wish to edit **temp variables**, then click on `Edit temps`.
- It will show a search box, search for the stat you are looking for and change it.
- To freeze the stat, tick the checkbox next to it.
- Click on Save.




