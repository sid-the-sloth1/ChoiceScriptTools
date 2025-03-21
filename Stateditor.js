(function () {
    'use strict';

    let stats = {};
    let arrayOfMainStats = [];
    let arrayOfTempStats = [];

    //let createdDiv = false;

    const createBox = function () {
        return new Promise((resolve, reject) => {
            const box = createElement("div", { class: "hardy" });
            box.innerHTML = `
            <div class="hardy_buttons_div">    
            <button id="editStats">Edit Stats</button>
            <button id="editTemps">Edit Temps</button>
            <button id="closeEditorDiv" onclick="hardyWindowInjectedFuncCloseBox()">Close</button>
            <button id="unfreezeAll" >Unfreeze All</button>
            </div>
                <div id="statsMainDiv" class="hide placeholder">
                    <div id="searchMainStats">
                        <input type="text" placeholder="Search Main Stats..." id="mainStatsInput">
                        <button id="statSaveMain">Save</button>
                        <button id="closeMainStats">Close</button>
                    </div>
                    <div id="resultDisplayMain"></div>
                </div>
                <div id="statsTempDiv" class="hide placeholder">
                    <div id="searchTempStats">
                        <input type="text" placeholder="Search Temp Stats..." id="tempStatsInput">
                        <button id="statSaveTemp">Save</button>
                        <button id="closeTempStats">Close</button>
                    </div>
                    <div id="resultDisplayTemp"></div>
                </div>
            `;
            const store = initStore();
            getFrozenStats(store).then(frozenStatsAll => {
                const frozenStats = frozenStatsAll.mainStats;
                let frozenTemps = [];
                if (frozenStatsAll.temps[window.stats.scene.name]) {
                    frozenTemps = frozenStatsAll.temps[window.stats.scene.name];
                }
                //console.log("Frozen Stats:", frozenStats);
                waitForElement("#buttons", 1000, 40).then(mainC => {
                    mainC.appendChild(box);

                    const mainStatBtn = box.querySelector("#editStats");
                    const tempStatsBtn = box.querySelector("#editTemps");
                    const resultDivMain = box.querySelector("#resultDisplayMain");
                    const resultDivTemp = box.querySelector("#resultDisplayTemp");
                    const inputMain = box.querySelector("#mainStatsInput");
                    const inputTemp = box.querySelector("#tempStatsInput");
                    const statsMainDiv = box.querySelector("#statsMainDiv");
                    const statsTempDiv = box.querySelector("#statsTempDiv");
                    const unfreezeAllBtn = box.querySelector("#unfreezeAll");

                    mainStatBtn.addEventListener("click", () => {
                        stats = window.stats;
                        statsMainDiv.classList.toggle("hide");
                        resultDivMain.innerHTML = "";
                        arrayOfMainStats = [];
                        arrayOfTempStats = [];
                    });

                    tempStatsBtn.addEventListener("click", () => {
                        stats = window.stats;
                        statsTempDiv.classList.toggle("hide");
                        resultDivTemp.innerHTML = "";
                        arrayOfMainStats = [];
                        arrayOfTempStats = [];
                    });

                    box.querySelector("#statSaveMain").addEventListener("click", () => {
                        saveStatsMain(resultDivMain, store, frozenStats, frozenStatsAll);
                    });
                    box.querySelector("#closeMainStats").addEventListener("click", () =>
                        closeBox(box)
                    );

                    inputMain.addEventListener("input", () => searchMainStats(inputMain.value, resultDivMain, frozenStats));

                    box.querySelector("#statSaveTemp").addEventListener("click", ()=> {
                        saveStatsTemp(resultDivTemp, store, frozenTemps, frozenStatsAll);
                    });
                    inputTemp.addEventListener("input", () => searchTempStats(inputTemp.value, resultDivTemp, frozenTemps));
                    box.querySelector("#closeTempStats").addEventListener("click", () =>
                        closeBox(box)
                    );

                    unfreezeAllBtn.addEventListener("click", () => {
                        deleteFrozenStats(store);
                    });
                    resolve(); // Signal completion
                }).catch(reject); // Handle element not found
            })
            /////

        });
    };


    function saveStatsMain(resultDivMain, store, frozenStats, frozenStatsAll) {
        stats = window.stats ?? {};
        arrayOfMainStats.forEach(prop => {
            const input = resultDivMain.querySelector(`div[name="${prop}"] input[type="text"]`);
            if (!input) return;

            const value = input.value.trim();
            if (!value || value === "[object Object]") return;
            stats[prop] = {
                string: value || "",
                number: Number(value) || 0,
                boolean: value.toLowerCase() === "true",
            }[typeof stats[prop]];
            const checkboxes = resultDivMain.querySelectorAll(`div[name="${prop}"] input[type="checkbox"]`);
            for (const checkbox of checkboxes) {
                const statName = checkbox.getAttribute("data-name");
                const isChecked = checkbox.checked;
                if (isChecked) {
                    if (!frozenStats.includes(statName)) {
                        frozenStats.push(statName);
                    }
                } else {
                    const index = frozenStats.indexOf(statName);
                    if (index !== -1) {
                        frozenStats.splice(index, 1);
                    }
                }
            }
            frozenStatsAll.mainStats = frozenStats;
            setFrozenStats(store, frozenStatsAll);
        });
        window.stats = stats;
        arrayOfMainStats = [];
        alertify.success("Stats saved successfully. Go to next page for the changes to take effect.");
    };

    function saveStatsTemp(resultDivTemp, store, frozenTemps, frozenStatsAll) {
        stats = window.stats ?? {};
        arrayOfTempStats.forEach(prop => {
            const input = resultDivTemp.querySelector(`div[name="${prop}_temp"] input`);
            if (!input) return;

            const value = input.value.trim();
            if (!value || value === "[object Object]") return;
            stats.scene.temps[prop] = {
                string: value || "",
                number: Number(value) || 0,
                boolean: value.toLowerCase() === "true",
            }[typeof stats.scene.temps[prop]];
            const checkboxes = resultDivTemp.querySelectorAll(`div[name="${prop}_temp"] input[type="checkbox"]`);
           
            for (const checkbox of checkboxes) {
                //console.log(checkbox)
                const statName = checkbox.getAttribute("data-name");
                const isChecked = checkbox.checked;
                if (isChecked) {
                    if (!frozenTemps.includes(statName)) {
                        frozenTemps.push(statName);
                    }
                } else {
                    const index = frozenTemps.indexOf(statName);
                    if (index !== -1) {
                        frozenTemps.splice(index, 1);
                    }
                }
            }
            frozenStatsAll.temps[window.stats.scene.name] = frozenTemps;
            setFrozenStats(store, frozenStatsAll);
        });
        window.stats = stats;
        arrayOfTempStats = [];
        alertify.success("Stats saved successfully. Go to next page for the changes to take effect.");
    };

    function closeBox(box) {
        arrayOfMainStats = [];
        arrayOfTempStats = [];
        box.remove();
    };

    function searchMainStats(val, resDiv, frozenStats) {

        if (!val) return (resDiv.innerHTML = "");

        arrayOfMainStats = Object.keys(stats).filter(prop => prop.toUpperCase().includes(val.toUpperCase()));
        resDiv.innerHTML = arrayOfMainStats.map(prop =>
            `<div name="${prop}"><label>${prop}: </label><input type="text" value="${stats[prop]}"><input type="checkbox" data-name="${prop.toLowerCase()}"${frozenStats.includes(prop.toLowerCase()) ? " checked" : ""}></div>`
        ).join("");
    };

    function searchTempStats(value, resultDiv, frozenStatsTemp) {
        if (!value) return (resultDiv.innerHTML = "");
        arrayOfTempStats = Object.keys(stats.scene.temps).filter(prop => prop.toUpperCase().includes(value.toUpperCase()));

        resultDiv.innerHTML = arrayOfTempStats.map(prop =>
            `<div name="${prop}_temp"><label>${prop}: </label><input type="text" value="${stats.scene.temps[prop]}"><input type="checkbox" data-name="${prop.toLowerCase()}"${frozenStatsTemp.includes(prop.toLowerCase()) ? " checked" : ""}></div>`
        ).join("");

    }

    function createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
        return element;
    }
    function ensureDocumentAccessible() {
        return new Promise((resolve) => {
            const checkHead = setInterval(() => {
                if (document && document.head) {
                    clearInterval(checkHead);
                    resolve();
                }
            }, 50);
        });
    }

    async function waitForElement(selector, duration = 800, maxTries = 20, multiple = false) {
        await ensureDocumentAccessible(); // Ensure document is ready
        return new Promise((resolve, reject) => {
            let attempts = 0;

            const intervalId = setInterval(() => {
                const elements = multiple ? document.querySelectorAll(selector) : document.querySelector(selector);

                if ((multiple && elements.length > 0) || (!multiple && elements)) {
                    clearInterval(intervalId);
                    resolve(elements);
                } else if (++attempts > maxTries) {
                    clearInterval(intervalId);
                    reject(`Timeout: Unable to find element(s) for selector "${selector}" after ${maxTries} tries.`);
                }
            }, duration);
        });
    }
    function addStyle(css, retries = 9, delay = 900) {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            function tryInject() {
                try {
                    const style = document.createElement('style');
                    style.textContent = css;
                    document.head.appendChild(style);

                    if (document.head.contains(style)) {
                        resolve(`Style injected successfully on attempt ${attempts + 1}`);
                    } else {
                        throw new Error("Failed to attach style element");
                    }
                } catch (error) {
                    attempts++;
                    console.error(`Style injection attempt ${attempts} failed:`, error);

                    if (attempts < retries) {
                        setTimeout(tryInject, delay); // Retry after delay
                    } else {
                        reject(`Failed to inject style after ${retries} attempts.`);
                    }
                }
            }

            tryInject();
        });
    }
    function readFromStore(store, key, isJSON = true) {
        return new Promise((resolve, reject) => {
            if (!store || typeof store.get !== "function") {
                console.error("Store is not initialized or invalid.");
                return resolve(null);
            }

            store.get(key, function (success, info) {
                if (!success || !info) {
                    console.error(`Failed to read key ${key} from store.`);
                    return resolve(null);
                }
                if (isJSON) {
                    try {
                        return resolve(JSON.parse(info));
                    } catch (error) {
                        console.error(`Unable to parse JSON for key ${key}:`, error);
                        //console.log(info)
                        return resolve(null);
                    }
                } else {
                    return resolve(info);
                }
            });
        });
    }

    function writeToStore(store, key, value, isJSON = true) {
        if (!store || typeof store.set !== "function") {
            console.error("Store is not initialized or invalid.");
            return;
        }

        const data = isJSON ? JSON.stringify(value) : value;

        store.set(key, data, function (success) {
            if (!success) {
                console.error(`Failed to write key ${key} to store.`);
            }
        });
    }

    async function getFrozenStats(store) {
        const info = await readFromStore(store, "hardy_frozen_stats", true);
        const toBeReturned = info ? info : { "mainStats": [], "temps": {} };
        window.frozenStats = toBeReturned.mainStats;
        const frozenTemps = toBeReturned.temps[window.stats.scene.name];
        if (frozenTemps) {
            window.frozenTemps = frozenTemps;
        } else {
            window.frozenTemps = [];
        }
        window.frozenScene = window.stats.scene.name;
        return toBeReturned;
    }

    async function setFrozenStats(store, value) {
        await writeToStore(store, "hardy_frozen_stats", value, true);
        window.frozenStats = value.mainStats;
        window.frozenScene = window.stats.scene.name;
        const frozenTemps = value.temps[window.stats.scene.name];
        if (frozenTemps) {
            window.frozenTemps = frozenTemps;
        } else {
            window.frozenTemps = [];
        }
        console.log("Frozen stats saved successfully.");
    }


    async function deleteFrozenStats(store) {
        const exists = await readFromStore(store, "hardy_frozen_stats", true);

        if (!exists) {
            console.log("No frozen stats found.");
            return;
        }

        store.remove("hardy_frozen_stats", function (success) {
            if (!success) {
                console.error("Failed to delete frozen stats.");
            } else {
                window.frozenStats = [];
                window.frozenTemps = [];
                console.log("Frozen stats deleted successfully.");
                alertify.success("All stats unfrozen successfully.");
            }
        });
    }


    

    window.hardyCOGButtonClickHandle = async function () {
        const button = document.querySelector("#hardyButton");
        button.disabled = true;
        arrayOfMainStats = [];
        arrayOfTempStats = [];
        const box = document.querySelector(".hardy");

        try {
            if (box) {
                console.log("Box already exists, not creating again.");
            } else {
                console.log("Creating box...");
                //createdDiv = true;
                await createBox();  // Ensure createBox completes before continuing
                console.log("Box created, createdDiv set to true.");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        } finally {
            console.log("Enabling button...");
            button.disabled = false;
            console.log("Button enabled.");
        }
    }
    window.hardyWindowInjectedFuncCloseBox = function () {
        const box = document.querySelector(".hardy");
        if (box) {
            box.remove();
        }
    };
    waitForElement("p#buttons").then((element) => {
        const frozen = getFrozenStats(initStore());
        const button = createElement("button", { "class": "spacedLink", "id": "hardyButton", "onclick": "hardyCOGButtonClickHandle()" });
        button.innerText = "Edit Stats";
        element.appendChild(button);
    });



    addStyle(`
        /* Sepia Mode Styles */
body .hardy { 
    color: #5b4636 !important; 
    background-color: #f4ecd8 !important; 
    border: 1px solid #c4a484; 
    border-radius: 10px; 
    padding: 12px; 
    margin-top: 12px; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); 
}

body #editStats:hover,
body #editTemps:hover,
body #statSaveMain,
body #statSaveTemp { 
    background-color: #c4a484; 
    color: #3e2c20; 
}

body .hide { display: none !important; }
body .disabled { pointer-events: none !important; opacity: 0.5; }

body .hardy_buttons_div { display: flex; gap: 8px; margin-bottom: 12px; }

body #editStats,
body #editTemps { 
    background-color: #e3d2b8; 
    color: #5b4636; 
    border: 1px solid #c4a484; 
    border-radius: 4px; 
    padding: 6px 14px; 
    cursor: pointer; 
    transition: background 0.3s, color 0.3s; 
}

body #searchMainStats,
body #searchTempStats { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }

body #mainStatsInput,
body #tempStatsInput { 
    background-color: #f4ecd8; 
    border: 1px solid #c4a484; 
    color: #5b4636; 
    padding: 8px; 
    border-radius: 4px; 
    width: 100%; 
    box-sizing: border-box; 
}

body #resultDisplayMain div,
body #resultDisplayTemp div { 
    background-color: #f4ecd8; 
    border: 1px solid #c4a484; 
    padding: 8px; 
    border-radius: 4px; 
    margin-bottom: 4px; 
}

body #statSaveMain,
body #statSaveTemp { 
    padding: 6px 14px; 
    border-radius: 5px; 
    border: none; 
    cursor: pointer; 
    transition: background 0.3s; 
}

body #statSaveMain:hover,
body #statSaveTemp:hover { background-color: #a07b56; }

body #closeMainStats,
body #closeTempStats,
body #closeEditorDiv { 
    background-color: #b35a45; 
    color: #f5f5f5; 
    padding: 6px 14px; 
    border-radius: 5px; 
    border: none; 
    cursor: pointer; 
    transition: background 0.3s; 
}

body #closeMainStats:hover,
body #closeTempStats:hover,
body #closeEditorDiv:hover { background-color: #914530; }

body #resultDisplayMain input,
body #resultDisplayTemp input { 
    background-color: #f4ecd8; 
    border: 1px solid #c4a484; 
    color: #5b4636; 
    padding: 6px; 
    border-radius: 4px; 
    width: 60%; 
    box-sizing: border-box; 
    margin-left: 7px; 
}

body button:focus,
body input:focus { 
    outline: 0; 
    box-shadow: 0 0 8px rgba(196, 164, 132, 0.8); 
}

body .alertify-message { color: #5b4636 !important; }

body #resultDisplayMain input[type=checkbox],
body #resultDisplayTemp input[type=checkbox] { 
    width: 18px; 
    height: 18px; 
    cursor: pointer; 
    accent-color: #c4a484; 
    margin-left: 8px; 
    vertical-align: middle; 
    border-radius: 3px; 
}

body #resultDisplayMain input[type=checkbox]:hover,
body #resultDisplayTemp input[type=checkbox]:hover { filter: brightness(1.1); }

body #resultDisplayMain input[type=checkbox]:focus,
body #resultDisplayTemp input[type=checkbox]:focus { 
    outline: rgba(196, 164, 132, 0.8) solid 2px; 
    box-shadow: 0 0 6px rgba(196, 164, 132, 0.8); 
}

body #unfreezeAll { 
    background-color: #e7dfc8; 
    color: #5b4636; 
    border: 1px solid #c4a484; 
    border-radius: 4px; 
    padding: 6px 14px; 
    cursor: pointer; 
    transition: background 0.3s, color 0.3s; 
}

body #unfreezeAll:hover { background-color: #d6c4a2; }

        body.nightmode .hardy { color: #e0e0e0 !important; }
 body.nightmode #editStats:hover,
 body.nightmode #editTemps:hover,
 body.nightmode #statSaveMain,
 body.nightmode #statSaveTemp { background-color: #4a90e2; color: #121212; }
 body.nightmode .hide { display: none !important; }
 body.nightmode .disabled { pointer-events: none !important; opacity: 0.5; }
 body.nightmode .hardy { 
     display: block; 
     background-color: #1e1e1e !important; 
     border: 1px solid #4a90e2; 
     border-radius: 10px; 
     padding: 12px; 
     margin-top: 12px; 
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7); 
 }
 body.nightmode .hardy_buttons_div { display: flex; gap: 8px; margin-bottom: 12px; }
 body.nightmode #editStats,
 body.nightmode #editTemps { 
     background-color: #252525; 
     color: #4a90e2; 
     border: 1px solid #4a90e2; 
     border-radius: 4px; 
     padding: 6px 14px; 
     cursor: pointer; 
     transition: background 0.3s, color 0.3s; 
 }
 body.nightmode #searchMainStats,
 body.nightmode #searchTempStats { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
 body.nightmode #mainStatsInput,
 body.nightmode #tempStatsInput { 
     background-color: #252525; 
     border: 1px solid #4a90e2; 
     color: #e0e0e0; 
     padding: 8px; 
     border-radius: 4px; 
     width: 100%; 
     box-sizing: border-box; 
 }
 body.nightmode #resultDisplayMain div,
 body.nightmode #resultDisplayTemp div { 
     background-color: #252525; 
     border: 1px solid #4a90e2; 
     padding: 8px; 
     border-radius: 4px; 
     margin-bottom: 4px; 
 }
 body.nightmode #statSaveMain,
 body.nightmode #statSaveTemp { 
     padding: 6px 14px; 
     border-radius: 5px; 
     border: none; 
     cursor: pointer; 
     transition: background 0.3s; 
 }
 body.nightmode #statSaveMain:hover,
 body.nightmode #statSaveTemp:hover { background-color: #3a7cc7; }
 body.nightmode #closeMainStats,
 body.nightmode #closeTempStats,
 body.nightmode #closeEditorDiv { 
     background-color: #d9534f; 
     color: #f5f5f5; 
     padding: 6px 14px; 
     border-radius: 5px; 
     border: none; 
     cursor: pointer; 
     transition: background 0.3s; 
 }
 body.nightmode #closeMainStats:hover,
 body.nightmode #closeTempStats:hover,
 body.nightmode #closeEditorDiv:hover { background-color: #b9413b; }
 body.nightmode #resultDisplayMain input,
 body.nightmode #resultDisplayTemp input { 
     background-color: #1a1a1a; 
     border: 1px solid #4a90e2; 
     color: #e0e0e0; 
     padding: 6px; 
     border-radius: 4px; 
     width: 60%; 
     box-sizing: border-box; 
     margin-left: 7px; 
 }
 body.nightmode button:focus,
 body.nightmode input:focus { outline: 0; box-shadow: 0 0 8px rgba(74, 144, 226, 0.8); }
 body.nightmode .alertify-message { color: #352d2d !important; }
 body.nightmode #resultDisplayMain input[type=checkbox],
 body.nightmode #resultDisplayTemp input[type=checkbox] { 
     width: 18px; 
     height: 18px; 
     cursor: pointer; 
     accent-color: #4a90e2; 
     margin-left: 8px; 
     vertical-align: middle; 
     border-radius: 3px; 
 }
 body.nightmode #resultDisplayMain input[type=checkbox]:hover,
 body.nightmode #resultDisplayTemp input[type=checkbox]:hover { filter: brightness(1.2); }
 body.nightmode #resultDisplayMain input[type=checkbox]:focus,
 body.nightmode #resultDisplayTemp input[type=checkbox]:focus { 
     outline: rgba(74, 144, 226, 0.8) solid 2px; 
     box-shadow: 0 0 6px rgba(74, 144, 226, 0.8); 
 }
 body.nightmode #unfreezeAll { 
     background-color: #d1d8b8; 
     color: #121212; 
     border: 1px solid #ccc0ae; 
     border-radius: 4px; 
     padding: 6px 14px; 
     cursor: pointer; 
     transition: background 0.3s, color 0.3s; 
 }
 body.nightmode #unfreezeAll:hover { background-color: #c6e466; }
 
 
 body.whitemode .hardy { color: #121212 !important; }
 body.whitemode #editStats:hover,
 body.whitemode #editTemps:hover,
 body.whitemode #statSaveMain,
 body.whitemode #statSaveTemp { background-color: #4a90e2; color: #ffffff; }
 body.whitemode .hide { display: none !important; }
 body.whitemode .disabled { pointer-events: none !important; opacity: 0.5; }
 body.whitemode .hardy { 
     display: block; 
     background-color: #f5f5f5 !important; 
     border: 1px solid #4a90e2; 
     border-radius: 10px; 
     padding: 12px; 
     margin-top: 12px; 
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); 
 }
 body.whitemode .hardy_buttons_div { display: flex; gap: 8px; margin-bottom: 12px; }
 body.whitemode #editStats,
 body.whitemode #editTemps { 
     background-color: #e0e0e0; 
     color: #4a90e2; 
     border: 1px solid #4a90e2; 
     border-radius: 4px; 
     padding: 6px 14px; 
     cursor: pointer; 
     transition: background 0.3s, color 0.3s; 
 }
 body.whitemode #searchMainStats,
 body.whitemode #searchTempStats { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
 body.whitemode #mainStatsInput,
 body.whitemode #tempStatsInput { 
     background-color: #ffffff; 
     border: 1px solid #4a90e2; 
     color: #121212; 
     padding: 8px; 
     border-radius: 4px; 
     width: 100%; 
     box-sizing: border-box; 
 }
 body.whitemode #resultDisplayMain div,
 body.whitemode #resultDisplayTemp div { 
     background-color: #ffffff; 
     border: 1px solid #4a90e2; 
     padding: 8px; 
     border-radius: 4px; 
     margin-bottom: 4px; 
 }
 body.whitemode #statSaveMain,
 body.whitemode #statSaveTemp { 
     padding: 6px 14px; 
     border-radius: 5px; 
     border: none; 
     cursor: pointer; 
     transition: background 0.3s; 
 }
 body.whitemode #statSaveMain:hover,
 body.whitemode #statSaveTemp:hover { background-color: #3a7cc7; }
 body.whitemode #closeMainStats,
 body.whitemode #closeTempStats,
 body.whitemode #closeEditorDiv { 
     background-color: #d9534f; 
     color: #ffffff; 
     padding: 6px 14px; 
     border-radius: 5px; 
     border: none; 
     cursor: pointer; 
     transition: background 0.3s; 
 }
 body.whitemode #closeMainStats:hover,
 body.whitemode #closeTempStats:hover,
 body.whitemode #closeEditorDiv:hover { background-color: #b9413b; }
 body.whitemode #resultDisplayMain input,
 body.whitemode #resultDisplayTemp input { 
     background-color: #ffffff; 
     border: 1px solid #4a90e2; 
     color: #121212; 
     padding: 6px; 
     border-radius: 4px; 
     width: 60%; 
     box-sizing: border-box; 
     margin-left: 7px; 
 }
 body.whitemode button:focus,
 body.whitemode input:focus { outline: 0; box-shadow: 0 0 8px rgba(74, 144, 226, 0.8); }
 body.whitemode .alertify-message { color: #121212 !important; }
 body.whitemode #resultDisplayMain input[type=checkbox],
 body.whitemode #resultDisplayTemp input[type=checkbox] { 
     width: 18px; 
     height: 18px; 
     cursor: pointer; 
     accent-color: #4a90e2; 
     margin-left: 8px; 
     vertical-align: middle; 
     border-radius: 3px; 
 }
 body.whitemode #resultDisplayMain input[type=checkbox]:hover,
 body.whitemode #resultDisplayTemp input[type=checkbox]:hover { filter: brightness(0.9); }
 body.whitemode #resultDisplayMain input[type=checkbox]:focus,
 body.whitemode #resultDisplayTemp input[type=checkbox]:focus { 
     outline: rgba(74, 144, 226, 0.8) solid 2px; 
     box-shadow: 0 0 6px rgba(74, 144, 226, 0.8); 
 }
 body.whitemode #unfreezeAll { 
     background-color: #f0f4e3; 
     color: #121212; 
     border: 1px solid #ccc0ae; 
     border-radius: 4px; 
     padding: 6px 14px; 
     cursor: pointer; 
     transition: background 0.3s, color 0.3s; 
 }
 body.whitemode #unfreezeAll:hover { background-color: #c6e466; }
 
        `);    

//size changing 
//addStyle(`body{background-color:#121212!important}#main{font-size:20px!important} body{color:#e0e0e0!important}`)

})();