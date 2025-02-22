const socket = io();

// 📌 Open Tabs Function
function openTabs() {
    const url = document.getElementById("url").value;
    const count = parseInt(document.getElementById("count").value);

    if (!url || count <= 0) {
        alert("Please enter a valid URL and number of tabs.");
        return;
    }

    fetch("/open-tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, count })
    }).then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error("Error:", error));
}

// 📌 Close Tabs Function
function closeTabs() {
    fetch("/close-tabs", { method: "POST" })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error("Error:", error));
}

// 📌 Real-time Active Tab Counter
socket.on("tabCount", (count) => {
    document.getElementById("tabCount").innerText = count;
});
