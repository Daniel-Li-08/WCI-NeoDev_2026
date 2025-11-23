console.log("opened")

const getKey = async (key) => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0]; 

    // Execute script in the current tab
    const fromPageLocalStore = await chrome.scripting.executeScript({ 
      target: { tabId: tab.id }, 
      function: (key) => localStorage[key], 
      args : [ key],
    });
    return fromPageLocalStore[0].result;
}


const loadnames = async () => {
        // Store the result  
//   const nm = await getKey("name");
//   let pw = await getKey("pw");
//   let prime = await getKey("prime");
    // check if stored in extension storage first
    const nm = await localStorage.getItem("name");
    const pw = await localStorage.getItem("name");
    const prime = await localStorage.getItem("name");

    if (nm == null || pw == null || prime == null){

        // get from page
        const nm = await getKey("name");
        const pw = await getKey("pw");
        const prime = await getKey("prime");

        if (nm == null || pw == null || prime == null){
            // Move to other page if not currently on our site
            chrome.tabs.create({ url: "https://wci-neo-dev-2025.vercel.app/login"});
        } else {

            localStorage.setItem("name",nm)
            localStorage.setItem("pw",pw)
            localStorage.setItem("prime",prime)
        }
    }

    

}


loadnames()