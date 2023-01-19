const BOARD = "monaco";

// Sections
const SECTIONS = ["centers", "directions", "neighbours", "adjacence", "lanes"];

// Cellsdata will be stored here
let cellsData = localStorage.getItem("formulaD" + BOARD);
if (cellsData != "") {
  cellsData = JSON.parse(cellsData);
} else {
  cellsData = CIRCUITS[BOARD] ?? { computed: {}, cells: {} };
}

$("force-refresh").addEventListener("click", () => {
  localStorage.setItem("formulaD" + BOARD, "");
  window.location.reload();
});

let cellIds = [];
let cells = {};

function updateStatus() {
  SECTIONS.forEach((section) => {
    $(`section-${section}`).classList.toggle(
      "computed",
      cellsData.computed[section] || false
    );
  });
}

function saveCellsData() {
  if (cells.length > 0) {
    let toKeep = Object.keys(cells);
    let t = Object.keys(cellsData.cells);
    t.forEach((cId) => {
      if (!toKeep.includes(cId)) {
        delete cellsData.cells[cId];
      }
    });
  }

  let data = JSON.stringify(cellsData);
  localStorage.setItem("formulaD" + BOARD, data);
  $("data").innerHTML = data;
  updateStatus();
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
obj.onload = () => {
  // Find the cells
  let svg = obj.contentDocument.querySelector("svg");
  let paths = [...svg.querySelectorAll("path")];
  paths.forEach((cell) => {
    // Remove the "path" prefix auto-added by Inkscape
    let id = parseInt(cell.id.substring(4));
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
  if (cellsData.computed.laneEnds || false) updateLaneEnds();
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
  };

  $(`show-${section}`).addEventListener("click", () => toggleShow(section));
  toggleShow(section, modes[section].show);

  ["edit", "swap", "check", "end1", "end2", "end3"].forEach((action) => {
    if (!$(`${action}-${section}`)) return;

    modes[section][action] = false;
    $(`${action}-${section}`).addEventListener("click", () => {
      modes[section][action] = !modes[section][action];
      $("main-frame").classList.toggle(
        `edit-${section}`,
        modes[section][action]
      );
      $(`${action}-${section}`).classList.toggle(
        "active",
        modes[section][action]
      );
    });
  });

  $(`generate-${section}`).addEventListener("click", () => {
    let method =
      "generate" + section.charAt(0).toUpperCase() + section.slice(1);
    window[method]();
  });
});

let highlightedCells = {};
function highlightCells(cellIds = null, className = null) {
  if (cellIds != null) {
    cellIds.forEach(
      (cellId) => (highlightedCells[cellId] = className[cellId] ?? className)
    );
  }

  Object.keys(highlightedCells).forEach((cellId) => {
    let c = highlightedCells[cellId];
    if (c == "white") c = "#ffffffaa";
    if (c == "green") c = "#00ff00aa";

    cells[cellId].style.fill = c;
  });
}

function clearHighlights() {
  Object.keys(highlightedCells).forEach((cellId) => {
    cells[cellId].style.fill = "transparent";
  });
  highlightedCells = {};
}

function onMouseEnterCell(id, cell) {
  $("cell-indicator-counter").innerHTML = id;

  if (selectedCell === null) {
    if (modes.lanes.check) {
      let lane = computeLane(id);
      let highlights = {};
      lane.forEach((cellId, i) => {
        let opacity = Math.max((255.0 - i) / 255.0, 0);
        highlights[cellId] = `rgba(255,255,255, ${opacity})`;
      });
      highlightCells(lane, highlights);
    } else {
      // Otherwise, display neighbours and/or adjacence
      if (modes.neighbours.show && cellsData.computed.neighbours) {
        let neighbourIds = cellsData.cells[id].neighbours;
        highlightCells(neighbourIds, "white");
      }
      if (modes.adjacence.show && cellsData.computed.adjacence) {
        let adjacentCellIds = cellsData.cells[id].adjacence;
        highlightCells(adjacentCellIds, "green");
      }
    }
  }

  if (id === selectedCell) return;

  let color = cell.style.fill;
  if (color == "transparent") color = "rgb(100,100,100)";
  cell.style.fill = rgba2hex(color, "ee");
  cell.style.strokeWidth = "2";
}

function onMouseLeaveCell(id, cell) {
  $("cell-indicator-counter").innerHTML = "----";
  if (id === selectedCell) return;

  cell.style.strokeWidth = "1";
  let color = rgba2hex(cell.style.fill, "aa");
  if (color == "#646464aa") color = "transparent";
  cell.style.fill = color;

  if (selectedCell == null) {
    clearHighlights();
  } else {
    highlightCells();
  }
}

let selectedCell = null;
function onMouseClickCell(id, cell, evt) {
  if (modes.lanes.end1) {
    updateLaneEnd(1, id);
    return;
  }
  if (modes.lanes.end2) {
    updateLaneEnd(2, id);
    return;
  }
  if (modes.lanes.end3) {
    updateLaneEnd(3, id);
    return;
  }

  if (modes.centers.edit) {
    let x = evt.clientX - 1,
      y = evt.clientY - 3;
    cellsData.cells[id].center = { x, y };
    updateCenters();
    saveCellsData();
    return;
  }

  if (modes.directions.swap) {
    swapDirection(id);
    saveCellsData();
    return;
  }

  if (modes.directions.edit) {
    if (selectedCell == null) {
      selectedCell = id;
      cell.style.fill = "green";
    } else {
      changeDirection(selectedCell, evt);
      selectedCell = null;
      saveCellsData();
      clearHighlights();
    }
  }

  if (modes.neighbours.edit) {
    if (selectedCell == null) {
      selectedCell = id;
      cell.style.fill = "green";
      highlightCells(cellsData.cells[id].neighbours, "white");
    } else if (selectedCell == id) {
      selectedCell = null;
      cell.style.fill = "transparent";
      clearHighlights();
    } else {
      toggleNeighbour(selectedCell, id, cell);
    }
    return;
  }

  if (modes.adjacence.edit) {
    if (selectedCell == null) {
      selectedCell = id;
      cell.style.fill = "green";
      updateHighlights(
        cellsData.cells[id].neighbours,
        cellsData.cells[id].adjacence
      );
    } else if (selectedCell == id) {
      selectedCell = null;
      cell.style.fill = "transparent";
      clearHighlights();
      clearGreenHighlights();
    } else {
      toggleAdjacence(selectedCell, id, cell);
    }
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

    $(`center-${cellId}`).dataset.lane = cellsData.cells[cellId].lane ?? 0;
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
    let angle = computeTangentOfCell(cell, center);
    cellsData.cells[id].angle = angle;
  });

  cellsData.computed.directions = true;
  this.saveCellsData();
  this.updateDirections();
  toggleShow("directions", true);
  console.log("Directions computed");
}

function updateDirections() {
  cellIds.forEach((cellId) => {
    updateDirection(cellId);
  });
}

function updateDirection(cellId) {
  if (!$(`direction-${cellId}`)) {
    $(`center-${cellId}`).insertAdjacentHTML(
      "beforeend",
      `<div class='direction-indicator' id='direction-${cellId}'></div>`
    );
  }

  let angle = cellsData.cells[cellId].angle ?? 0;
  $(`direction-${cellId}`).style.transform = `rotate(${angle}deg)`;
}

function swapDirection(cellId) {
  let angle = cellsData.cells[cellId].angle;
  cellsData.cells[cellId].angle = (angle + 180) % 360;
  updateDirection(cellId);
}

function changeDirection(id, evt) {
  let x = evt.clientX - 1,
    y = evt.clientY - 3;
  let center = cellsData.cells[id].center;
  cellsData.cells[id].angle =
    (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI;
  updateDirection(id);
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

  let slope = -(minPos2.x - minPos1.x) / (minPos2.y - minPos1.y);
  let rotation = (Math.atan2(slope, 1) * 180) / Math.PI;
  return rotation;
}

///////////////////////////////////////////////////////////
//  _   _      _       _     _
// | \ | | ___(_) __ _| |__ | |__   ___  _   _ _ __ ___
// |  \| |/ _ \ |/ _` | '_ \| '_ \ / _ \| | | | '__/ __|
// | |\  |  __/ | (_| | | | | |_) | (_) | |_| | |  \__ \
// |_| \_|\___|_|\__, |_| |_|_.__/ \___/ \__,_|_|  |___/
//               |___/
///////////////////////////////////////////////////////////
function generateNeighbours() {
  if (!cellsData.computed.centers || !cellsData.computed.directions) {
    alert("You must compute the centers and directions first");
    return false;
  }

  if (
    (cellsData.computed.neighbours || false) &&
    !confirm("Are you sure you want to overwrite existing neighbours ?")
  ) {
    return;
  }

  // Compute neighbours
  cellIds.forEach((id) => {
    let neighbours = computeNeighbours(id);
    cellsData.cells[id].neighbours = neighbours;
  });
  // Ensure the relation is symmetric
  cellIds.forEach((cellId) => {
    cellsData.cells[id].neighbours.forEach((id) => {
      let neighbours2 = cellsData.cells[id].neighbours;
      if (!neighbours2.includes(cellId)) {
        neighbours2.push(cellId);
      }
    });
  });

  cellsData.computed.neighbours = true;
  this.saveCellsData();
  toggleShow("neighbours", true);
  console.log("Neighbours computed");
}

function computeNeighbours(id) {
  let center = cellsData.cells[id].center;
  let angle = (cellsData.cells[id].angle * Math.PI) / 180;

  // Sort cells by distance
  let dists = {};
  // Keep only the cells not orthogonal to direction
  let ids = Object.keys(cells).filter((cellId) => {
    if (cellId == id) return false;

    let center2 = cellsData.cells[cellId].center;
    let v = { x: center2.x - center.x, y: center2.y - center.y };
    let alpha = Math.atan2(v.y, v.x) - angle;
    if (alpha < -Math.PI / 2) alpha += 2 * Math.PI;

    return Math.abs(Math.cos(alpha)) > 0.2;
  });

  ids.forEach((cellId) => {
    let center2 = cellsData.cells[cellId].center;
    dists[cellId] =
      (center.x - center2.x) * (center.x - center2.x) +
      (center.y - center2.y) * (center.y - center2.y);
  });
  ids = ids.sort(function (id1, id2) {
    return dists[id1] - dists[id2];
  });

  // Keep only the 6 closest ones
  ids = ids.slice(0, 6);

  // Keep only the ones close enough
  let minDist = dists[ids[0]];
  ids = ids.filter((cellId) => dists[cellId] < 2 * minDist);

  return ids.map((t) => parseInt(t));
}

function toggleNeighbour(selectedCell, id, cell) {
  let neighbours = cellsData.cells[selectedCell].neighbours;
  let i = neighbours.findIndex((cId) => cId == id);

  if (i === -1) {
    // New neighbour => add it
    neighbours.push(id);
    highlightCells([id], "white");

    // Add myself to new neighbour as well
    let neighbours2 = cellsData.cells[id].neighbours;
    if (!neighbours2.includes(selectedCell)) {
      neighbours2.push(selectedCell);
    }
  } else {
    // Already there => remove it
    neighbours.splice(i, 1);

    // Remove myself to old neighbour as well
    let neighbours2 = cellsData.cells[id].neighbours;
    let j = neighbours2.findIndex((cId) => cId == selectedCell);
    if (j !== -1) {
      neighbours2.splice(j, 1);
    }

    highlightCells([id], "transparent");
  }
  saveCellsData();
}

////////////////////////////////////////////////////////
//     _       _  _
//    / \   __| |(_) __ _  ___ ___ _ __   ___ ___
//   / _ \ / _` || |/ _` |/ __/ _ \ '_ \ / __/ _ \
//  / ___ \ (_| || | (_| | (_|  __/ | | | (_|  __/
// /_/   \_\__,_|/ |\__,_|\___\___|_| |_|\___\___|
//             |__/
////////////////////////////////////////////////////////
function generateAdjacence() {
  if (!cellsData.computed.neighbours) {
    alert("You must compute the neighbours first");
    return false;
  }

  if (
    (cellsData.computed.adjacence || false) &&
    !confirm("Are you sure you want to overwrite existing adjacence ?")
  ) {
    return;
  }

  // Compute adjacence
  cellIds.forEach((id) => {
    let neighbours = computeAdjacentCells(id);
    cellsData.cells[id].adjacence = neighbours;
  });

  cellsData.computed.adjacence = true;
  this.saveCellsData();
  toggleShow("adjacence", true);
  console.log("Adjacence computed");
}

function computeAdjacentCells(id) {
  let center = cellsData.cells[id].center;
  let angle = (cellsData.cells[id].angle * Math.PI) / 180;

  // Keep only the cells within the cone angle
  let coneAngle = Math.PI / 3;
  let ids = cellsData.cells[id].neighbours.filter((cellId) => {
    if (cellId == id) return false;

    let center2 = cellsData.cells[cellId].center;
    let v = { x: center2.x - center.x, y: center2.y - center.y };
    let alpha = Math.atan2(v.y, v.x) - angle;
    if (alpha < -Math.PI / 2) alpha += 2 * Math.PI;

    return alpha > -coneAngle && alpha < coneAngle;
  });

  return ids;
}

function toggleAdjacence(selectedCell, id, cell) {
  let neighbours = cellsData.cells[selectedCell].adjacence;
  let i = neighbours.findIndex((cId) => cId == id);

  if (i === -1) {
    // New neighbour => add it
    neighbours.push(id);
    highlightCells([id], "green");
  } else {
    // Already there => remove it
    neighbours.splice(i, 1);
    highlightCells([id], "white");
  }
  saveCellsData();
}

////////////////////////////////
//  _
// | |    __ _ _ __   ___  ___
// | |   / _` | '_ \ / _ \/ __|
// | |__| (_| | | | |  __/\__ \
// |_____\__,_|_| |_|\___||___/
////////////////////////////////

function computeLane(id) {
  let current = id;
  let visited = [];
  while (!visited.includes(current)) {
    visited.push(current);

    let adj = cellsData.cells[current].adjacence;
    if (adj.length == 1) {
      current = adj[0];
    } else {
      let center = cellsData.cells[current].center;
      let angle = (cellsData.cells[current].angle * Math.PI) / 180;
      let angles = adj.map((cellId) => {
        let center2 = cellsData.cells[cellId].center;
        let v = { x: center2.x - center.x, y: center2.y - center.y };
        let alpha = Math.atan2(v.y, v.x) - angle;
        if (alpha < -Math.PI / 2) alpha += 2 * Math.PI;
        return Math.abs(alpha);
      });
      let ids = Object.keys(adj);
      ids = ids.sort(function (id1, id2) {
        return angles[id1] - angles[id2];
      });
      current = adj[ids[0]];
    }
  }

  return visited;
}

function generateLanes() {
  if (!cellsData.computed.adjacence) {
    alert("You must compute the adjacence first");
    return false;
  }
  if (
    !cellsData.computed.laneEnds ||
    !cellsData.computed.laneEnds.end1 ||
    !cellsData.computed.laneEnds.end2 ||
    !cellsData.computed.laneEnds.end3
  ) {
    alert("You must add the lane endings first");
    return false;
  }

  if (
    (cellsData.computed.lanes || false) &&
    !confirm("Are you sure you want to overwrite existing lanes ?")
  ) {
    return;
  }

  // Compute adjacence
  [1, 2, 3].forEach((lane) => {
    let cellId = cellsData.computed.laneEnds[`end${lane}`];
    let cellIds = computeLane(cellId);
    cellIds.forEach((cId) => {
      cellsData.cells[cId].lane = lane;
    });
  });

  cellsData.computed.lanes = true;
  this.saveCellsData();
  toggleShow("lanes", true);
  updateCenters();
  console.log("Lanes computed");
}

// Lane ends
function updateLaneEnd(lane, cellId) {
  if (!cellsData.computed.laneEnds) cellsData.computed.laneEnds = {};
  cellsData.computed.laneEnds[`end${lane}`] = cellId;
  saveCellsData();
  updateLaneEnds();
}

function updateLaneEnds() {
  [1, 2, 3].forEach((i) => {
    let end = `end${i}`;
    let cellId = cellsData.computed.laneEnds[end] ?? null;
    if (cellId) {
      if (!$(`lane-${end}`)) {
        $(`center-${cellId}`).insertAdjacentHTML(
          "beforeend",
          `<div id='lane-${end}' class='lane-end-indicator'>${i}🏁</div>`
        );
      }

      $(`center-${cellId}`).insertAdjacentElement(
        "beforeend",
        $(`lane-${end}`)
      );
    }
  });
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

function rgba2hex(orig, forceAlpha = null) {
  var a,
    isPercent,
    rgb = orig
      .replace(/\s/g, "")
      .match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = ((rgb && rgb[4]) || "").trim(),
    hex = rgb
      ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
        (rgb[2] | (1 << 8)).toString(16).slice(1) +
        (rgb[3] | (1 << 8)).toString(16).slice(1)
      : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = 01;
  }
  // multiply before convert to HEX
  a = ((a * 255) | (1 << 8)).toString(16).slice(1);
  if (forceAlpha) {
    a = forceAlpha;
  }
  hex = hex + a;

  return "#" + hex;
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
