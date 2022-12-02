const BOARD = "monaco";

// Sections
const SECTIONS = ["centers", "directions"];

// Cellsdata will be stored here
let cellsData = localStorage.getItem("formulaD" + BOARD);
if (cellsData !== null) {
  cellsData = JSON.parse(cellsData);
} else {
  cellsData = CIRCUITS[BOARD] ?? { computed: {}, cells: {} };
}

function saveCellsData() {
  let data = JSON.stringify(cellsData);
  localStorage.setItem("formulaD" + BOARD, data);
  $("data").innerHTML = data;
  updateStatus();
}

function updateStatus() {
  SECTIONS.forEach((section) => {
    $(`section-${section}`).classList.toggle(
      "computed",
      cellsData.computed[section] || false
    );
  });
}

saveCellsData();

// Create obj loading external svg
let obj = document.createElement("object");
obj.data = BOARD + ".svg";
obj.type = "image/svg+xml";
obj.id = "board";
obj.style.backgroundImage = `url(${BOARD}.jpg)`;
$("main-frame").appendChild(obj);

// Load svg
let cellIds = [];
let cells = {};
obj.onload = () => {
  // Find the cells
  let svg = obj.contentDocument.querySelector("svg");
  let paths = [...svg.querySelectorAll("path")];
  paths.forEach((cell) => {
    // Remove the "path" prefix auto-added by Inkscape
    let id = parseInt(cell.id.substr(4));
    cellIds.push(id);
    cells[id] = cell;
    if (!cellsData.cells[id]) {
      cellsData.cells[id] = {};
    }

    cell.addEventListener("mouseenter", () => onMouseEnterCell(id, cell));
    cell.addEventListener("mouseleave", () => onMouseLeaveCell(id, cell));
    cell.addEventListener("click", (evt) => onMouseClickCell(id, cell, evt));

    cell.style.fill = "transparent";
    cell.style.stroke = "black";
    cell.style.strokeWidth = "1";
  });

  $("circuit-info").innerHTML = `${BOARD} - ${paths.length} cells`;
  if (cellsData.computed.centers || false) updateCenters();
  if (cellsData.computed.directions || false) updateDirections();
};

///////////////////////////////////////////////////////////////////////////
//  _____                 _     _   _                 _ _
// | ____|_   _____ _ __ | |_  | | | | __ _ _ __   __| | | ___ _ __ ___
// |  _| \ \ / / _ \ '_ \| __| | |_| |/ _` | '_ \ / _` | |/ _ \ '__/ __|
// | |___ \ V /  __/ | | | |_  |  _  | (_| | | | | (_| | |  __/ |  \__ \
// |_____| \_/ \___|_| |_|\__| |_| |_|\__,_|_| |_|\__,_|_|\___|_|  |___/
///////////////////////////////////////////////////////////////////////////
let modes = localStorage.getItem("formuladModes");
modes = modes === null ? {} : JSON.parse(modes);

function toggleShow(section, val = null) {
  modes[section].show = val === null ? !modes[section].show : val;
  $("main-frame").classList.toggle(`show-${section}`, modes[section].show);
  $(`show-${section}`).classList.toggle("active", modes[section].show);
  localStorage.setItem("formuladModes", JSON.stringify(modes));
}

SECTIONS.forEach((section) => {
  modes[section] = modes[section] || {
    show: false,
    edit: false,
  };

  $(`show-${section}`).addEventListener("click", () => toggleShow(section));
  toggleShow(section, modes[section].show);

  $(`edit-${section}`).addEventListener("click", () => {
    modes[section].edit = !modes[section].edit;
    $("main-frame").classList.toggle(`edit-${section}`, modes[section].edit);
    $(`edit-${section}`).classList.toggle("active", modes[section].edit);
  });

  $(`generate-${section}`).addEventListener("click", () => {
    let method =
      "generate" + section.charAt(0).toUpperCase() + section.slice(1);
    window[method]();
  });
});

function onMouseEnterCell(id, cell) {
  $("cell-indicator-counter").innerHTML = id;
  cell.style.fill = "gray";
  cell.style.strokeWidth = "2";
}

function onMouseLeaveCell(id, cell) {
  $("cell-indicator-counter").innerHTML = "----";
  cell.style.fill = "transparent";
  cell.style.strokeWidth = "1";
}

function onMouseClickCell(id, cell, evt) {
  if (modes.centers.edit) {
    let x = evt.clientX - 1,
      y = evt.clientY - 3;
    cellsData.cells[id].center = { x, y };
    updateCenters();
    saveCellsData();
    return;
  }
}

//////////////////////////////////////
//   ____           _
//  / ___|___ _ __ | |_ ___ _ __ ___
// | |   / _ \ '_ \| __/ _ \ '__/ __|
// | |__|  __/ | | | ||  __/ |  \__ \
//  \____\___|_| |_|\__\___|_|  |___/
//////////////////////////////////////
function generateCenters() {
  if (
    (cellsData.computed.centers || false) &&
    !confirm("Are you sure you want to overwrite existing centers ?")
  ) {
    return;
  }

  cellIds.forEach((id) => {
    let cell = cells[id];
    let pos = computeCenterOfCell(cell);
    cellsData.cells[id].center = pos;
  });

  cellsData.computed.centers = true;
  this.saveCellsData();
  this.updateCenters();
  toggleShow("centers", true);
  console.log("Centers computed");
}

function updateCenters() {
  cellIds.forEach((cellId) => {
    if (!$(`center-${cellId}`)) {
      $("centers").insertAdjacentHTML(
        "beforeend",
        `<div class='center-indicator' id='center-${cellId}'></div>`
      );
    }

    $(`center-${cellId}`).style.left =
      cellsData.cells[cellId].center.x - 2 + "px";
    $(`center-${cellId}`).style.top =
      cellsData.cells[cellId].center.y - 2 + "px";
  });
}

function computeCenterOfCell(cell) {
  const M = 40;
  let pathLength = Math.floor(cell.getTotalLength());
  let totX = 0,
    totY = 0;
  for (let i = 0; i < M; i++) {
    let pos = cell.getPointAtLength((i * pathLength) / M);
    totX += pos.x;
    totY += pos.y;
  }

  return {
    x: totX / M,
    y: totY / M,
  };
}

///////////////////////////////////////////////////
//  ____  _               _   _
// |  _ \(_)_ __ ___  ___| |_(_) ___  _ __  ___
// | | | | | '__/ _ \/ __| __| |/ _ \| '_ \/ __|
// | |_| | | | |  __/ (__| |_| | (_) | | | \__ \
// |____/|_|_|  \___|\___|\__|_|\___/|_| |_|___/
///////////////////////////////////////////////////
function generateDirections() {
  if (!cellsData.computed.centers) {
    alert("You must compute the centers first");
    return false;
  }

  if (
    (cellsData.computed.directions || false) &&
    !confirm("Are you sure you want to overwrite existing directions ?")
  ) {
    return;
  }

  cellIds.forEach((id) => {
    let cell = cells[id];
    let center = cellsData.cells[id].center;
    let slope = computeTangentOfCell(cell, center);
    cellsData.cells[id].slope = slope;
  });

  cellsData.computed.directions = true;
  this.saveCellsData();
  this.updateDirections();
  toggleShow("directions", true);
  console.log("Directions computed");
}

function updateDirections() {
  cellIds.forEach((cellId) => {
    if (!$(`direction-${cellId}`)) {
      $(`center-${cellId}`).insertAdjacentHTML(
        "beforeend",
        `<div class='direction-indicator' id='direction-${cellId}'></div>`
      );
    }

    let m = cellsData.cells[cellId].slope;
    let rotation = (Math.atan2(m, 1) * 180) / Math.PI;
    $(`direction-${cellId}`).style.transform = `rotate(${rotation}deg)`;
  });
}

function computeTangentOfCell(cell, center) {
  let pathLength = Math.floor(cell.getTotalLength());
  const M = 200;
  let minDist = pathLength * pathLength;
  let minPos1 = null;
  let minI = 0;
  for (let i = 0; i < M; i++) {
    let pos = cell.getPointAtLength((i * pathLength) / M);
    let d = dist2(pos, center);
    if (d < minDist) {
      minDist = d;
      minPos1 = pos;
      minI = i;
    }
  }

  minDist = pathLength * pathLength;
  let minPos2 = null;
  for (let i = minI + M / 2 - M / 5; i < minI + M / 2 + M / 5; i++) {
    let pos = cell.getPointAtLength(((i % M) * pathLength) / M);
    let d = dist2(pos, center);
    if (d < minDist) {
      minDist = d;
      minPos2 = pos;
    }
  }

  return -(minPos2.x - minPos1.x) / (minPos2.y - minPos1.y);
}

////////////////////////
//  _   _ _   _ _
// | | | | |_(_) |___
// | | | | __| | / __|
// | |_| | |_| | \__ \
//  \___/ \__|_|_|___/
////////////////////////

function dist2(pos1, pos2) {
  return (
    (pos1.x - pos2.x) * (pos1.x - pos2.x) +
    (pos1.y - pos2.y) * (pos1.y - pos2.y)
  );
}

function $(id) {
  return document.getElementById(id);
}

/////////////////////////////////////////
//     _             _     _
//    / \   _ __ ___| |__ (_)_   _____
//   / _ \ | '__/ __| '_ \| \ \ / / _ \
//  / ___ \| | | (__| | | | |\ V /  __/
// /_/   \_\_|  \___|_| |_|_| \_/ \___|
/////////////////////////////////////////

//		 	<image x="0" y="0" width="4304" height="2813" href="formula.jpeg" draggable="false" />
// 	<img src="testFormulaD/formula.jpeg" id="img" />

/*
var xmlns = "http://www.w3.org/2000/svg";

monacoBoard.forEach(cell => {
	var polygon = document.createElementNS(xmlns, "polygon");
	let points = [];
	for(var i = 0; i < cell.box.length; i++){
		points.push(cell.box[i][0][0] + ", " + cell.box[i][0][1]);
	}

	polygon.setAttribute("points", points.join(","));
	document.getElementById("svg").querySelector('#group').appendChild(polygon);
});

var data = (new XMLSerializer()).serializeToString(document.getElementById("svg"));
console.log(data);
*/

/*
function findLineByLeastSquares(path) {
		const M = 100;
		let values_x = [], values_y = [];
		let pathLength = Math.floor(path.getTotalLength());
		for(let i = 0; i < M; i++){
			let pos = path.getPointAtLength(Math.random() * pathLength);
			values_x.push(pos.x);
			values_y.push(pos.y);
		}

    var x_sum = 0;
    var y_sum = 0;
    var xy_sum = 0;
    var xx_sum = 0;
    var count = 0;

    var x = 0;
    var y = 0;
    var values_length = M;
    for (let i = 0; i< values_length; i++) {
        x = values_x[i];
        y = values_y[i];
        x_sum+= x;
        y_sum+= y;
        xx_sum += x*x;
        xy_sum += x*y;
        count++;
    }

    var m = (count*xy_sum - x_sum*y_sum) / (count*xx_sum - x_sum*x_sum);
    var b = (y_sum/count) - (m*x_sum)/count;
		return m;
}
*/
