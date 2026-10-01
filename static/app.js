
const history = {labels: [], temperature: [], humidity: [], light: [], power: []};
const MAX_POINTS = 30;
const chartOptions = {
  responsive: true, maintainAspectRatio: false, animation: false,
  interaction: {intersect: false, mode: "index"},
  plugins: {legend: {labels: {color: "#a5b6cd"}}},
  scales: {
    x: {ticks: {color: "#8195b1", maxTicksLimit: 6}, grid: {color: "rgba(143,162,189,.1)"}},
    y: {beginAtZero: true, ticks: {color: "#8195b1"}, grid: {color: "rgba(143,162,189,.1)"}}
  }
};
const environmentChart = new Chart(document.getElementById("environmentChart"), {
  type: "line",
  data: {labels: history.labels, datasets: [
    {label:"Temperature (°C)", data:history.temperature, borderColor:"#ffb47e", backgroundColor:"rgba(255,180,126,.1)", tension:.35, pointRadius:2},
    {label:"Humidity (%)", data:history.humidity, borderColor:"#67c7ff", backgroundColor:"rgba(103,199,255,.1)", tension:.35, pointRadius:2}
  ]}, options: chartOptions
});
const lightChart = new Chart(document.getElementById("lightChart"), {
  type:"line", data:{labels:history.labels,datasets:[
    {label:"Light level",data:history.light,borderColor:"#f6d66e",backgroundColor:"rgba(246,214,110,.12)",fill:true,tension:.35,pointRadius:2}
  ]}, options:chartOptions
});
const powerChart = new Chart(document.getElementById("powerChart"), {
  type:"line", data:{labels:history.labels,datasets:[
    {label:"Power (W)",data:history.power,borderColor:"#65dfc8",backgroundColor:"rgba(101,223,200,.12)",fill:true,tension:.35,pointRadius:2}
  ]}, options:chartOptions
});
function addHistory(data) {
  history.labels.push(new Date().toLocaleTimeString());
  for (const key of ["temperature","humidity","light","power"]) {
    const value = Number(data[key]);
    history[key].push(data[key] !== null && data[key] !== "" && Number.isFinite(value) ? value : null);
  }
  if (history.labels.length > MAX_POINTS) {
    history.labels.shift();
    for (const key of ["temperature","humidity","light","power"]) history[key].shift();
  }
  [environmentChart, lightChart, powerChart].forEach(chart => chart.update());
}

const fields = {
  temperature: {id:"temperature", suffix:"", decimals:1},
  humidity: {id:"humidity", suffix:"", decimals:0},
  light: {id:"light", suffix:"", decimals:0},
  power: {id:"power", suffix:"", decimals:0},
  energy: {id:"energy", suffix:"", decimals:4}
};
const el = id => document.getElementById(id);
function number(value, decimals=0) {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString(undefined, {minimumFractionDigits:decimals, maximumFractionDigits:decimals});
}
function status(value, activeText, inactiveText) {
  if (value === null || value === undefined || value === "") return null;
  const s = String(value).toLowerCase();
  return ["1","true","on","open","detected","yes"].includes(s) ? activeText : inactiveText;
}
async function refresh() {
  try {
    const response = await fetch("/api/data", {cache:"no-store"});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Data request failed");
    for (const [key, config] of Object.entries(fields)) el(config.id).textContent = number(data[key], config.decimals);
    addHistory(data);
    el("humidity-bar").style.width = `${Math.max(0, Math.min(100, Number(data.humidity)||0))}%`;
    el("light-bar").style.width = `${Math.max(0, Math.min(100, (Number(data.light)||0)/3500*100))}%`;
    el("power-bar").style.width = `${Math.max(0, Math.min(100, (Number(data.power)||0)/500*100))}%`;

    const motion = status(data.motion, "Motion detected", "No motion");
    const door = status(data.door, "Open", "Closed");
    el("motion").textContent = motion ?? "—";
    el("motion-desc").textContent = motion ? "Latest activity state" : "No reading available";
    el("door").textContent = door ?? "—";
    el("door-desc").textContent = door ? "Latest door state" : "No reading available";
    el("motion-led").classList.toggle("on", motion === "Motion detected");
    el("door-led").classList.toggle("on", door === "Open");
    el("connection").textContent = "Cloud connected";
    el("last-updated").textContent = new Date().toLocaleTimeString();
  } catch (err) {
    el("connection").textContent = "Data unavailable";
    el("last-updated").textContent = "Retrying…";
    console.error(err);
  }
}
el("year").textContent = new Date().getFullYear();
refresh();
setInterval(refresh, 5000);
