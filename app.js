var albumString = '';
var rankedSongsString = '';

var config = null;
var metadata = {};
var namMember = [];

var lstMember = new Array();
var parent = new Array();
var equal = new Array();
var rec = new Array();
var cmp1, cmp2;
var head1, head2;
var nrec;
var numQuestion;
var totalSize;
var finishSize;
var finishFlag;

var prevStates = [];

// Load configuration from JSON
async function loadConfig() {
  try {
    const response = await fetch('config.json');
    config = await response.json();

    // IMPORTANT: Clear any old localStorage from previous sessions
    // This prevents loading a partially completed sort from a different song list
    localStorage.removeItem('prevStates');
    prevStates = [];

    // Build metadata and namMember from config
    config.songs.forEach((song, index) => {
      namMember.push(song.name);
      metadata[song.name] = {
        image: song.image,
        index: index
      };
    });

    // Apply configuration
    applyConfig();

    // Initialize sorting
    initList();
    showImage();
  } catch (error) {
    console.error('Error loading config:', error);
    alert('Failed to load configuration. Please check config.json');
  }
}

// Apply configuration to page
function applyConfig() {
  // Set title
  if (config.title) {
    document.title = config.title;
    const titleElement = document.querySelector('h4');
    if (titleElement) {
      titleElement.textContent = config.title.toUpperCase();
    }
  }

  // Set description
  const descElement = document.querySelector('.instructions');
  if (descElement) {
    if (config.description) {
      descElement.innerHTML = `<center><br/><br/>${config.description}<br/><br/></center>`;
      descElement.style.display = 'block'; // Make sure it's visible after loading
    } else {
      // Hide the loading text if no description is provided
      descElement.style.display = 'none';
    }
  }

  // Set header image
  if (config.headerImage) {
    const headerImg = document.querySelector('img[src="img/title.png"]');
    if (headerImg) {
      headerImg.src = config.headerImage;
    }
  }

  // Apply background
  if (config.background) {
    if (config.background.type === 'image' && config.background.value) {
      document.body.style.setProperty('--background-image', `url('${config.background.value}')`);
      document.body.classList.add('has-background-image');
      document.body.classList.remove('has-gradient-background');
    } else if (config.background.type === 'gradient') {
      const start = config.background.gradientStart || '#667eea';
      const end = config.background.gradientEnd || '#764ba2';
      document.body.style.setProperty('--gradient-start', start);
      document.body.style.setProperty('--gradient-end', end);
      document.body.classList.add('has-gradient-background');
      document.body.classList.remove('has-background-image');
    }
  }

  // Apply theme colors
  if (config.theme) {
    if (config.theme === 'light') {
      // Light theme - dark text, subtle shadows, dark borders
      document.body.style.setProperty('--text-color', '#1a1a1a');
      document.body.style.setProperty('--text-shadow', '1px 1px 3px rgba(255, 255, 255, 0.6)');
      document.body.style.setProperty('--heading-shadow', '2px 2px 6px rgba(255, 255, 255, 0.8)');
      document.body.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.3)');
      document.body.style.setProperty('--button-gradient-start', 'rgba(0, 0, 0, 0.15)');
      document.body.style.setProperty('--button-gradient-end', 'rgba(0, 0, 0, 0.08)');
      document.body.style.setProperty('--button-hover-start', 'rgba(0, 0, 0, 0.25)');
      document.body.style.setProperty('--button-hover-end', 'rgba(0, 0, 0, 0.15)');
    } else {
      // Dark theme (default) - white text, dark shadows, light borders
      document.body.style.setProperty('--text-color', '#ffffff');
      document.body.style.setProperty('--text-shadow', '2px 2px 6px rgba(0, 0, 0, 0.8)');
      document.body.style.setProperty('--heading-shadow', '3px 3px 10px rgba(0, 0, 0, 0.9)');
      document.body.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.3)');
      document.body.style.setProperty('--button-gradient-start', 'rgba(255, 255, 255, 0.2)');
      document.body.style.setProperty('--button-gradient-end', 'rgba(255, 255, 255, 0.1)');
      document.body.style.setProperty('--button-hover-start', 'rgba(255, 255, 255, 0.3)');
      document.body.style.setProperty('--button-hover-end', 'rgba(255, 255, 255, 0.2)');
    }
  }
}

// Don't try to load prevStates before config loads
// This is now handled in loadConfig()

// Save current state for undo functionality
function saveState() {
  prevStates.push({
    lstMember: JSON.parse(JSON.stringify(lstMember)),
    parent: JSON.parse(JSON.stringify(parent)),
    equal: JSON.parse(JSON.stringify(equal)),
    rec: JSON.parse(JSON.stringify(rec)),
    cmp1: cmp1,
    cmp2: cmp2,
    head1: head1,
    head2: head2,
    nrec: nrec,
    numQuestion: numQuestion,
    finishSize: finishSize,
    finishFlag: finishFlag,
    totalSize: totalSize
  });
  localStorage.setItem('prevStates', JSON.stringify(prevStates));
}

// Restore the previous state
function undoLastAction() {
  if (prevStates.length > 0) {
    var prevState = prevStates.pop();
    lstMember = prevState.lstMember;
    parent = prevState.parent;
    equal = prevState.equal;
    rec = prevState.rec;
    cmp1 = prevState.cmp1;
    cmp2 = prevState.cmp2;
    head1 = prevState.head1;
    head2 = prevState.head2;
    nrec = prevState.nrec;
    numQuestion = prevState.numQuestion;
    finishSize = prevState.finishSize;
    finishFlag = prevState.finishFlag;
    showImage(true);
  }
}

function ohOkNvm() {
  document.getElementById('restartPrompt').style = 'display: none;';
  document.getElementById('restartButton').style = 'display: flex; justify-content: center; margin-top: 10px;';
}

function restart() {
  localStorage.removeItem('prevStates');
  window.location.reload();
}

function restartQuestion() {
  document.getElementById('restartButton').style = 'display: none;';
  document.getElementById('restartPrompt').style = 'display: flex; justify-content: center;';
}

function restoreList() {
  var prevState = prevStates[prevStates.length - 1];
  lstMember = JSON.parse(JSON.stringify(prevState.lstMember));
  parent = JSON.parse(JSON.stringify(prevState.parent));
  equal = JSON.parse(JSON.stringify(prevState.equal));
  rec = JSON.parse(JSON.stringify(prevState.rec));
  cmp1 = prevState.cmp1;
  cmp2 = prevState.cmp2;
  head1 = prevState.head1;
  head2 = prevState.head2;
  nrec = prevState.nrec;
  numQuestion = prevState.numQuestion - 1;
  finishSize = prevState.finishSize;
  finishFlag = prevState.finishFlag;
  totalSize = prevState.totalSize;
}

// The initialization of the variable
function initList() {
  // Never restore from prevStates on fresh load - always start from scratch
  var n = 0;
  var mid;
  var i;
  lstMember[n] = new Array();
  for (i = 0; i < namMember.length; i++) {
    lstMember[n][i] = i;
  }
  parent[n] = -1;
  totalSize = 0;
  n++;
  for (i = 0; i < lstMember.length; i++) {
    if (lstMember[i].length >= 2) {
      mid = Math.ceil(lstMember[i].length / 2);
      lstMember[n] = new Array();
      lstMember[n] = lstMember[i].slice(0, mid);
      totalSize += lstMember[n].length;
      parent[n] = i;
      n++;
      lstMember[n] = new Array();
      lstMember[n] = lstMember[i].slice(mid, lstMember[i].length);
      totalSize += lstMember[n].length;
      parent[n] = i;
      n++;
    }
  }
  for (i = 0; i < namMember.length; i++) {
    rec[i] = 0;
  }
  nrec = 0;
  for (i = 0; i <= namMember.length; i++) {
    equal[i] = -1;
  }
  cmp1 = lstMember.length - 2;
  cmp2 = lstMember.length - 1;
  head1 = 0;
  head2 = 0;
  numQuestion = 0;
  finishSize = 0;
  finishFlag = 0;
}

// flag: -1 (left), 0 (tie), 1 (right)
function sortList(flag) {
  saveState(); // Save the current state before sorting
  var i;
  var str;
  if (flag < 0) {
    rec[nrec] = lstMember[cmp1][head1];
    head1++;
    nrec++;
    finishSize++;
    while (equal[rec[nrec - 1]] != -1) {
      rec[nrec] = lstMember[cmp1][head1];
      head1++;
      nrec++;
      finishSize++;
    }
  } else if (flag > 0) {
    rec[nrec] = lstMember[cmp2][head2];
    head2++;
    nrec++;
    finishSize++;
    while (equal[rec[nrec - 1]] != -1) {
      rec[nrec] = lstMember[cmp2][head2];
      head2++;
      nrec++;
      finishSize++;
    }
  } else {
    rec[nrec] = lstMember[cmp1][head1];
    head1++;
    nrec++;
    finishSize++;
    while (equal[rec[nrec - 1]] != -1) {
      rec[nrec] = lstMember[cmp1][head1];
      head1++;
      nrec++;
      finishSize++;
    }
    equal[rec[nrec - 1]] = lstMember[cmp2][head2];
    rec[nrec] = lstMember[cmp2][head2];
    head2++;
    nrec++;
    finishSize++;
    while (equal[rec[nrec - 1]] != -1) {
      rec[nrec] = lstMember[cmp2][head2];
      head2++;
      nrec++;
      finishSize++;
    }
  }
  if (head1 < lstMember[cmp1].length && head2 == lstMember[cmp2].length) {
    while (head1 < lstMember[cmp1].length) {
      rec[nrec] = lstMember[cmp1][head1];
      head1++;
      nrec++;
      finishSize++;
    }
  } else if (head1 == lstMember[cmp1].length && head2 < lstMember[cmp2].length) {
    while (head2 < lstMember[cmp2].length) {
      rec[nrec] = lstMember[cmp2][head2];
      head2++;
      nrec++;
      finishSize++;
    }
  }
  if (head1 == lstMember[cmp1].length && head2 == lstMember[cmp2].length) {
    for (i = 0; i < lstMember[cmp1].length + lstMember[cmp2].length; i++) {
      lstMember[parent[cmp1]][i] = rec[i];
    }
    lstMember.pop();
    lstMember.pop();
    cmp1 = cmp1 - 2;
    cmp2 = cmp2 - 2;
    head1 = 0;
    head2 = 0;
    if (head1 == 0 && head2 == 0) {
      for (i = 0; i < namMember.length; i++) {
        rec[i] = 0;
      }
      nrec = 0;
    }
  }
  if (cmp1 < 0) {
    str = 'battle #' + (numQuestion - 1) + '<br>' + Math.floor((finishSize * 100) / totalSize) + '% sorted.';
    document.getElementById('battleNumber').innerHTML = str;
    showResult();
    finishFlag = 1;
  } else {
    showImage();
  }
}

function copyRankedSongsToClipboard() {
  // Regenerate the ranked songs string from current table order
  const table = document.querySelector('#resultField table');
  const rows = table.querySelectorAll('tr');
  rankedSongsString = '';

  for (let i = 1; i < rows.length; i++) {
    // Skip header row
    const cells = rows[i].querySelectorAll('td');
    const rank = cells[0].textContent.trim();
    const songName = cells[1].textContent.trim();
    rankedSongsString += `${rank}. ${songName}\n`;
  }

  navigator.clipboard.writeText(rankedSongsString);
  document.getElementById('songsCopyText').innerHTML = 'Copied!';
  document.getElementById('songsCopyText').disabled = true;
  setTimeout(() => {
    document.getElementById('songsCopyText').innerHTML = 'Copy Text';
    document.getElementById('songsCopyText').disabled = false;
  }, 2000);
}

function showResult() {
  // Hide comparison buttons and battle number when showing results
  const mainTable = document.getElementById('mainTable');
  const undoButton = document.getElementById('undoButton');
  const battleNumber = document.getElementById('battleNumber');

  if (mainTable) mainTable.style.display = 'none';
  if (undoButton) undoButton.parentElement.style.display = 'none';
  if (battleNumber) battleNumber.style.display = 'none';

  // Remove the fake album creation - we only want ranked songs
  var ranking = 1;
  var sameRank = 1;
  var str = '';
  var i;
  str +=
    '<h3>All Songs Ranked</h3><table id="resultsTable" style="width:450px; font-size:18px; line-height:120%; margin-left:auto; margin-right:auto; border:1px solid #000; border-collapse:collapse" align="center">';
  str += '<tr><td style="text-align:center;">Rank</td><td style="text-align:center;">Songs</td></tr>';
  for (i = 0; i < namMember.length; i++) {
    rankedSongsString += `${ranking}. ${namMember[lstMember[0][i]]}\n`;
    str +=
      '<tr draggable="true" data-song-index="' +
      i +
      '"><td style="border:1px solid #000; text-align:center; padding-right:5px;">' +
      ranking +
      '</td><td style="border:1px solid #000; padding-left:5px;">' +
      namMember[lstMember[0][i]] +
      `</td><td style="padding:8px;"><img width="50" height="50" src="${
        metadata[namMember[lstMember[0][i]]].image
      }"/></td></tr>`;
    if (i < namMember.length - 1) {
      if (equal[lstMember[0][i]] == lstMember[0][i + 1]) {
        sameRank++;
      } else {
        ranking += sameRank;
        sameRank = 1;
      }
    }
  }
  str += `
  </table>
  <button id="songsCopyText" style="margin-top: 10;" onclick="copyRankedSongsToClipboard()">Copy Text</button>
  `;
  document.getElementById('resultField').innerHTML = str;

  // Enable drag and drop for reordering
  enableDragAndDrop();
}

function enableDragAndDrop() {
  const table = document.getElementById('resultsTable');
  const rows = table.querySelectorAll('tr[draggable="true"]');

  let draggedRow = null;
  let dropIndicator = null;
  let touchStartY = 0;
  let touchCurrentY = 0;

  rows.forEach((row) => {
    // Desktop drag and drop
    row.addEventListener('dragstart', function (e) {
      draggedRow = this;
      this.style.opacity = '0.4';
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', function (e) {
      this.style.opacity = '';
      this.classList.remove('dragging');
      // Remove any drop indicators
      const indicators = table.querySelectorAll('.drop-indicator');
      indicators.forEach((ind) => ind.remove());
    });

    row.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (this !== draggedRow) {
        // Remove existing indicators
        const indicators = table.querySelectorAll('.drop-indicator');
        indicators.forEach((ind) => ind.remove());

        const rect = this.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        // Create drop indicator
        const indicator = document.createElement('tr');
        indicator.className = 'drop-indicator';
        indicator.innerHTML =
          '<td colspan="3" style="height: 4px; padding: 0; background: linear-gradient(90deg, #667eea, #764ba2, #e097d9); box-shadow: 0 0 10px rgba(102, 126, 234, 0.8);"></td>';

        if (e.clientY < midpoint) {
          this.parentNode.insertBefore(indicator, this);
          this.parentNode.insertBefore(draggedRow, this);
        } else {
          this.parentNode.insertBefore(indicator, this.nextSibling);
          this.parentNode.insertBefore(draggedRow, this.nextSibling);
        }
      }
    });

    row.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      // Remove drop indicators
      const indicators = table.querySelectorAll('.drop-indicator');
      indicators.forEach((ind) => ind.remove());
      updateRankNumbers();
    });

    // Mobile touch events
    row.addEventListener('touchstart', function (e) {
      draggedRow = this;
      touchStartY = e.touches[0].clientY;
      this.classList.add('dragging');

      // Prevent scrolling while dragging
      document.body.style.overflow = 'hidden';
    });

    row.addEventListener('touchmove', function (e) {
      if (!draggedRow) return;

      e.preventDefault(); // Prevent scrolling
      touchCurrentY = e.touches[0].clientY;

      // Move the dragged row with finger
      const deltaY = touchCurrentY - touchStartY;
      draggedRow.style.transform = `translateY(${deltaY}px)`;

      // Find the row under the touch point
      const elementBelow = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      const rowBelow = elementBelow?.closest('tr[draggable="true"]');

      if (rowBelow && rowBelow !== draggedRow) {
        // Remove existing indicators
        const indicators = table.querySelectorAll('.drop-indicator');
        indicators.forEach((ind) => ind.remove());

        const rect = rowBelow.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        // Create drop indicator
        const indicator = document.createElement('tr');
        indicator.className = 'drop-indicator';
        indicator.innerHTML =
          '<td colspan="3" style="height: 4px; padding: 0; background: linear-gradient(90deg, #667eea, #764ba2, #e097d9); box-shadow: 0 0 10px rgba(102, 126, 234, 0.8);"></td>';

        if (touchCurrentY < midpoint) {
          rowBelow.parentNode.insertBefore(indicator, rowBelow);
        } else {
          rowBelow.parentNode.insertBefore(indicator, rowBelow.nextSibling);
        }
      }
    });

    row.addEventListener('touchend', function (e) {
      if (!draggedRow) return;

      // Reset transform
      draggedRow.style.transform = '';
      draggedRow.classList.remove('dragging');

      // Re-enable scrolling
      document.body.style.overflow = '';

      // Find the drop indicator and insert before it
      const indicator = table.querySelector('.drop-indicator');
      if (indicator) {
        indicator.parentNode.insertBefore(draggedRow, indicator);
        indicator.remove();
      }

      // Remove any remaining indicators
      const indicators = table.querySelectorAll('.drop-indicator');
      indicators.forEach((ind) => ind.remove());

      updateRankNumbers();
      draggedRow = null;
    });
  });
}

function updateRankNumbers() {
  const table = document.getElementById('resultsTable');
  const rows = table.querySelectorAll('tr[draggable="true"]');

  rows.forEach((row, index) => {
    const rankCell = row.querySelector('td:first-child');
    rankCell.textContent = index + 1;
  });
}

function showImage(undo) {
  if (!undo) numQuestion++;
  var str0 = 'BATTLE #' + numQuestion + '<br>' + Math.floor((finishSize * 100) / totalSize) + '% SORTED';
  var str1 = '' + toNameFace(lstMember[cmp1][head1]);
  var str2 = '' + toNameFace(lstMember[cmp2][head2]);
  var img1 = metadata[str1]?.image;
  var img2 = metadata[str2]?.image;
  const innerHtml1 = `
  <div>
    ${str1}
    <br>
    <img width="50" height="50" src="${img1}"/>
  </div>
  `;
  const innerHtml2 = `
  <div>
    ${str2}
    <br>
    <img width="50" height="50" src="${img2}"/>
  </div>
  `;
  document.getElementById('battleNumber').innerHTML = str0;
  document.getElementById('leftField').innerHTML = innerHtml1;
  document.getElementById('rightField').innerHTML = innerHtml2;
}

function toNameFace(n) {
  var str = namMember[n];
  return str;
}
