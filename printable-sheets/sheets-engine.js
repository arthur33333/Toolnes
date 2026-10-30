/* Toolnes printable sheets engine */

var SHEET_TYPES = [
  { id: 'xmas_gifts', name: 'Christmas Gift List', cat: 'Christmas' },
  { id: 'xmas_budget', name: 'Holiday Budget Planner', cat: 'Christmas' },
  { id: 'xmas_cards', name: 'Christmas Card List', cat: 'Christmas' },
  { id: 'advent', name: 'Advent Calendar', cat: 'Christmas' },
  { id: 'xmas_hunt', name: 'Christmas Scavenger Hunt', cat: 'Christmas' },
  { id: 'xmas_menu', name: 'Holiday Meal Planner', cat: 'Christmas' },
  { id: 'calendar', name: 'Monthly Calendar', cat: 'Planners' },
  { id: 'weekly', name: 'Weekly Planner', cat: 'Planners' },
  { id: 'daily', name: 'Daily Planner', cat: 'Planners' },
  { id: 'todo', name: 'To-Do List', cat: 'Planners' },
  { id: 'budget_monthly', name: 'Monthly Budget Planner', cat: 'Budget' },
  { id: 'budget', name: 'Budget Tracker', cat: 'Budget' },
  { id: 'bills', name: 'Bill Tracker', cat: 'Budget' },
  { id: 'savings', name: '52-Week Savings Challenge', cat: 'Budget' },
  { id: 'debt', name: 'Debt Payoff Tracker', cat: 'Budget' },
  { id: 'timetable', name: 'Class Schedule', cat: 'Study' },
  { id: 'exams', name: 'Exam Planner', cat: 'Study' },
  { id: 'homework', name: 'Homework Tracker', cat: 'Study' },
  { id: 'cornell', name: 'Cornell Notes', cat: 'Study' },
  { id: 'habit', name: 'Habit Tracker', cat: 'Health & Family' },
  { id: 'workout', name: 'Workout Log', cat: 'Health & Family' },
  { id: 'water', name: 'Water Tracker', cat: 'Health & Family' },
  { id: 'sleep', name: 'Sleep Tracker', cat: 'Health & Family' },
  { id: 'chores', name: 'Chore Chart', cat: 'Health & Family' },
  { id: 'rewards', name: 'Reward Chart', cat: 'Health & Family' },
  { id: 'wedding_check', name: 'Wedding Checklist', cat: 'Wedding & Home' },
  { id: 'guests', name: 'Wedding Guest List', cat: 'Wedding & Home' },
  { id: 'grocery', name: 'Grocery List', cat: 'Wedding & Home' },
  { id: 'meal', name: 'Meal Planner', cat: 'Wedding & Home' },
  { id: 'lined', name: 'Lined Paper', cat: 'Paper & Journal' },
  { id: 'handwriting', name: 'Handwriting Practice', cat: 'Paper & Journal' },
  { id: 'dotgrid', name: 'Dot Grid', cat: 'Paper & Journal' },
  { id: 'graph', name: 'Graph Paper', cat: 'Paper & Journal' },
  { id: 'gratitude', name: 'Gratitude Journal', cat: 'Paper & Journal' },
  { id: 'reading', name: 'Reading Log', cat: 'Paper & Journal' }
];
var SHEET_PAPER = { letter: [612, 792], a4: [595.28, 841.89] };
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var SM = 40, GRID = '#c9cde0';

function sLine(c, x1, y1, x2, y2, w, col) { c.strokeStyle = col || GRID; c.lineWidth = w || 0.8; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
function sText(c, t, x, y, size, col, bold, align) { c.fillStyle = col; c.font = (bold ? 'bold ' : '') + size + 'px Arial'; c.textAlign = align || 'left'; c.fillText(t, x, y); }
function sHeader(c, o, W, def, right) {
  sText(c, o.title || def, SM, 54, 24, o.color, true);
  sLine(c, SM, 64, SM + 70, 64, 2.5, o.color);
  if (right) sText(c, right, W - SM, 52, 11, '#555', false, 'right');
}
function sBox(c, x, y, s) { c.strokeStyle = '#555'; c.lineWidth = 1; c.strokeRect(x, y, s, s); }
function fitCols(cols, total) { var s = 0; cols.forEach(function (v) { s += v; }); return cols.map(function (v) { return v * total / s; }); }
function sTable(c, o, x, y, cols, rh, n, heads, hh) {
  var w = 0; cols.forEach(function (v) { w += v; }); hh = hh || 24;
  c.fillStyle = o.color; c.fillRect(x, y, w, hh);
  var cx = x;
  heads.forEach(function (t, i) { sText(c, t, cx + 6, y + hh * .68, 10.5, '#fff', true); cx += cols[i]; });
  y += hh;
  for (var r = 0; r <= n; r++) sLine(c, x, y + r * rh, x + w, y + r * rh);
  cx = x;
  for (var i = 0; i <= cols.length; i++) { sLine(c, cx, y, cx, y + n * rh); cx += cols[i] || 0; }
  return y;
}
function monthInfo(o) {
  var first = new Date(o.year, o.month, 1).getDay(), days = new Date(o.year, o.month + 1, 0).getDate();
  if (o.weekStart === 1) first = (first + 6) % 7;
  return { first: first, days: days };
}
function dayNames(o) { var d = DAYS.slice(); if (o.weekStart === 1) d = d.slice(1).concat(d[0]); return d; }

var SHEET_DRAW = {
  lined: function (c, o, W, H) {
    sHeader(c, o, W, 'Lined Paper', 'Name: ____________   Date: ____________');
    var sp = o.spacing || 25, y = 96;
    for (; y < H - 40; y += sp) sLine(c, SM, y, W - SM, y, 0.8);
    if (o.margin) sLine(c, SM + 40, 78, SM + 40, H - 36, 1.2, '#e08a8a');
  },
  handwriting: function (c, o, W, H) {
    sHeader(c, o, W, 'Handwriting Practice', 'Name: ____________   Date: ____________');
    for (var y = 100; y + 50 < H - 30; y += 56) {
      sLine(c, SM, y, W - SM, y, 1, '#9aa0b8');
      c.setLineDash([5, 4]); sLine(c, SM, y + 22, W - SM, y + 22, .8, '#c2c6d8'); c.setLineDash([]);
      sLine(c, SM, y + 44, W - SM, y + 44, 1.3, '#9aa0b8');
    }
  },
  cornell: function (c, o, W, H) {
    sHeader(c, o, W, 'Cornell Notes', 'Topic: ____________   Date: ____________');
    var top = 84, cue = 150, sum = H - 150;
    c.strokeStyle = o.color; c.lineWidth = 1.4;
    c.strokeRect(SM, top, W - 2 * SM, H - 40 - top);
    sLine(c, SM + cue, top, SM + cue, sum, 1.4, o.color); sLine(c, SM, sum, W - SM, sum, 1.4, o.color);
    sText(c, 'Cues / Questions', SM + 8, top + 18, 11, o.color, true);
    sText(c, 'Notes', SM + cue + 10, top + 18, 11, o.color, true);
    sText(c, 'Summary', SM + 8, sum + 18, 11, o.color, true);
    for (var y = top + 44; y < sum - 6; y += 24) sLine(c, SM + cue + 8, y, W - SM - 8, y);
    for (var y2 = sum + 42; y2 < H - 46; y2 += 24) sLine(c, SM + 8, y2, W - SM - 8, y2);
  },
  dotgrid: function (c, o, W, H) {
    sHeader(c, o, W, 'Dot Grid');
    var sp = o.spacing || 14.2;
    c.fillStyle = '#8a90a8';
    for (var y = 92; y < H - 34; y += sp) for (var x = SM; x <= W - SM + 1; x += sp) { c.beginPath(); c.arc(x, y, .9, 0, Math.PI * 2); c.fill(); }
  },
  graph: function (c, o, W, H) {
    sHeader(c, o, W, 'Graph Paper');
    var sp = o.spacing || 14.2, k = 0, x, y;
    for (x = SM; x <= W - SM + 1; x += sp, k++) sLine(c, x, 86, x, H - 34, k % 5 === 0 ? 1 : .5, k % 5 === 0 ? '#a7aec8' : GRID);
    k = 0;
    for (y = 86; y <= H - 34; y += sp, k++) sLine(c, SM, y, W - SM, y, k % 5 === 0 ? 1 : .5, k % 5 === 0 ? '#a7aec8' : GRID);
  },
  calendar: function (c, o, W, H) {
    sText(c, MONTHS[o.month] + ' ' + o.year, SM, 56, 30, o.color, true);
    if (o.title) sText(c, o.title, W - SM, 54, 13, '#555', false, 'right');
    var mi = monthInfo(o), rows = Math.ceil((mi.first + mi.days) / 7), top = 108, cw = (W - 2 * SM) / 7, rh = (H - 40 - top) / rows;
    c.fillStyle = o.color; c.fillRect(SM, 76, W - 2 * SM, 26);
    dayNames(o).forEach(function (d, i) { sText(c, d.slice(0, 3).toUpperCase(), SM + i * cw + cw / 2, 94, 11, '#fff', true, 'center'); });
    for (var r = 0; r <= rows; r++) sLine(c, SM, top + r * rh, W - SM, top + r * rh, 1, '#9aa0b8');
    for (var i2 = 0; i2 <= 7; i2++) sLine(c, SM + i2 * cw, top, SM + i2 * cw, top + rows * rh, 1, '#9aa0b8');
    for (var d = 1; d <= mi.days; d++) { var idx = mi.first + d - 1; sText(c, String(d), SM + (idx % 7) * cw + 6, top + Math.floor(idx / 7) * rh + 16, 12, '#333', true); }
  },
  weekly: function (c, o, W, H) {
    sHeader(c, o, W, 'Weekly Planner', 'Week of: ______________________');
    var bw = (W - 2 * SM - 14) / 2, bh = (H - 100 - 40 - 3 * 12) / 4, names = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','Notes'];
    names.forEach(function (n, i) {
      var x = SM + (i % 2) * (bw + 14), y = 84 + Math.floor(i / 2) * (bh + 12);
      c.strokeStyle = GRID; c.lineWidth = 1.2; c.strokeRect(x, y, bw, bh);
      c.fillStyle = o.color; c.fillRect(x, y, bw, 20); sText(c, n, x + 8, y + 14, 11, '#fff', true);
      for (var ly = y + 44; ly < y + bh - 6; ly += 22) sLine(c, x + 8, ly, x + bw - 8, ly);
    });
  },
  daily: function (c, o, W, H) {
    sHeader(c, o, W, 'Daily Planner', 'Date: ______________________');
    var top = 84, sx = SM, sw = (W - 2 * SM) * .58, rx = sx + sw + 16, rw = W - SM - rx, hours = 17, rh = (H - 40 - top - 22) / hours;
    c.fillStyle = o.color; c.fillRect(sx, top, sw, 20); sText(c, 'Schedule', sx + 8, top + 14, 11, '#fff', true);
    for (var i = 0; i < hours; i++) {
      var y = top + 20 + i * rh, h = 6 + i, lab = (h % 12 === 0 ? 12 : h % 12) + (h < 12 || h === 24 ? ' am' : ' pm');
      sLine(c, sx, y + rh, sx + sw, y + rh); sText(c, lab, sx + 6, y + rh * .62, 10, '#555');
    }
    sLine(c, sx + 46, top + 20, sx + 46, top + 20 + hours * rh);
    var half = (H - 40 - top) / 3 - 8;
    ['Top 3 priorities', 'To do', 'Notes'].forEach(function (t, k) {
      var y = top + k * (half + 12);
      c.fillStyle = o.color; c.fillRect(rx, y, rw, 20); sText(c, t, rx + 8, y + 14, 11, '#fff', true);
      for (var ly = y + 40; ly < y + half && (k !== 0 || ly < y + 40 + 3 * 24); ly += 24) { if (k < 2) sBox(c, rx + 6, ly - 10, 10); sLine(c, rx + (k < 2 ? 24 : 6), ly, rx + rw - 4, ly); }
    });
  },
  todo: function (c, o, W, H) {
    sHeader(c, o, W, 'To-Do List', 'Date: ______________________');
    for (var y = 100; y < H - 40; y += 30) { sBox(c, SM + 4, y - 12, 13); sLine(c, SM + 28, y, W - SM, y); }
  },
  habit: function (c, o, W, H) {
    var mi = monthInfo(o);
    sText(c, 'Habit Tracker - ' + MONTHS[o.month] + ' ' + o.year, SM, 54, 22, o.color, true);
    sLine(c, SM, 64, SM + 70, 64, 2.5, o.color);
    var left = SM, nameW = 130, cw = (W - 2 * SM - nameW) / mi.days, top = 84, rows = 16, rh = (H - 40 - top - 24) / rows;
    c.fillStyle = o.color; c.fillRect(left, top, W - 2 * SM, 24);
    sText(c, 'Habit', left + 6, top + 16, 10.5, '#fff', true);
    for (var d = 0; d < mi.days; d++) sText(c, String(d + 1), left + nameW + d * cw + cw / 2, top + 16, 8, '#fff', true, 'center');
    for (var r = 0; r <= rows; r++) sLine(c, left, top + 24 + r * rh, W - SM, top + 24 + r * rh);
    for (var k = 0; k <= mi.days; k++) sLine(c, left + nameW + k * cw, top + 24, left + nameW + k * cw, top + 24 + rows * rh);
    sLine(c, left, top + 24, left, top + 24 + rows * rh); sLine(c, left + nameW, top + 24, left + nameW, top + 24 + rows * rh);
  },
  budget: function (c, o, W, H) {
    sHeader(c, o, W, 'Budget Tracker', 'Month: ______________________');
    var cols = fitCols([62, 165, 105, 72, 72, 66], W - 2 * SM), rh = 25, n = Math.floor((H - 40 - 84 - 24) / rh);
    sTable(c, o, SM, 84, cols, rh, n, ['Date', 'Description', 'Category', 'Income', 'Expense', 'Balance'], 24);
  },
  reading: function (c, o, W, H) {
    sHeader(c, o, W, 'Reading Log', 'Name: ______________________');
    var cols = fitCols([190, 130, 62, 62, 88], W - 2 * SM), rh = 30, n = Math.floor((H - 40 - 84 - 24) / rh);
    sTable(c, o, SM, 84, cols, rh, n, ['Title', 'Author', 'Started', 'Finished', 'Rating'], 24);
  },
  meal: function (c, o, W, H) {
    sHeader(c, o, W, 'Meal Planner', 'Week of: ______________________');
    var cols = fitCols([92, 110, 110, 110, 100], W - 2 * SM), n = 7, rh = (H - 40 - 84 - 24 - 110) / n;
    var y = sTable(c, o, SM, 84, cols, rh, n, ['Day', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'], 24);
    DAYS.slice(1).concat(DAYS[0]).forEach(function (d, i) { sText(c, d, SM + 6, y + i * rh + rh * .55, 11, '#333', true); });
    var gy = y + n * rh + 16;
    sText(c, 'Grocery list', SM, gy + 8, 12, o.color, true);
    for (var ly = gy + 32; ly < H - 40; ly += 22) sLine(c, SM, ly, W - SM, ly);
  },
  gratitude: function (c, o, W, H) {
    sHeader(c, o, W, 'Gratitude Journal', 'Date: ______________________');
    var prompts = ['Three things I am grateful for today', 'Someone who made my day better', 'A small win I want to remember', 'Something I am looking forward to', 'My mood today (draw or write)'];
    var y = 100, block = (H - 40 - 100) / prompts.length;
    prompts.forEach(function (p) {
      sText(c, p, SM, y, 12.5, o.color, true);
      for (var ly = y + 26; ly < y + block - 6; ly += 24) sLine(c, SM, ly, W - SM, ly);
      y += block;
    });
  }
};


function tableSheet(def, heads, widths, rh, right, first) {
  return function (c, o, W, H) {
    sHeader(c, o, W, def, right);
    var cols = fitCols(widths, W - 2 * SM), avail = H - 40 - 84 - 24, rows, y, list = null, h = rh;
    if (first) { list = typeof first === 'function' ? first(o) : first; rows = list.length; h = Math.min(40, avail / rows); }
    else rows = Math.floor(avail / rh);
    y = sTable(c, o, SM, 84, cols, h, rows, heads, 24);
    if (list) list.forEach(function (t, i) { sText(c, String(t), SM + 6, y + i * h + h * .62, 10.5, '#333', false); });
  };
}
function starShape(c, x, y, r, col) {
  c.strokeStyle = col; c.lineWidth = 1; c.beginPath();
  for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; if (i) c.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); else c.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); }
  c.closePath(); c.stroke();
}
function checkList(c, o, x, y, w, items, step) {
  items.forEach(function (t, i) { sBox(c, x, y + i * step - 9, 10); sText(c, t, x + 18, y + i * step, 11, '#333', false); sLine(c, x + 18, y + i * step + 4, x + w, y + i * step + 4, .5); });
}
function sections(c, o, x, y, w, list) {
  list.forEach(function (s) {
    c.fillStyle = o.color; c.fillRect(x, y, w, 22); sText(c, s[0], x + 8, y + 15, 11.5, '#fff', true); y += 22;
    s[1].forEach(function (t, i) { sBox(c, x + 4, y + 12 + i * 32, 11); sText(c, t, x + 24, y + 21 + i * 32, 11, '#333', false); sLine(c, x + 24, y + 27 + i * 32, x + w, y + 27 + i * 32, .5); });
    y += s[1].length * 32 + 26;
  });
}
function blockLines(c, o, x, y, w, title, n, boxes) {
  c.fillStyle = o.color; c.fillRect(x, y, w, 20); sText(c, title, x + 8, y + 14, 11, '#fff', true);
  for (var i = 1; i <= n; i++) { if (boxes) sBox(c, x + 4, y + 20 + i * 22 - 11, 10); sLine(c, x + (boxes ? 20 : 4), y + 20 + i * 22, x + w, y + 20 + i * 22); }
  return y + 20 + n * 22 + 14;
}
function monthDays(o) { return new Date(o.year, o.month + 1, 0).getDate(); }

SHEET_DRAW.xmas_gifts = tableSheet('Christmas Gift List', ['Person', 'Gift idea', 'Store / link', 'Price', 'Bought'], [100, 170, 100, 60, 52], 28, 'Year: ____________');
SHEET_DRAW.xmas_cards = tableSheet('Christmas Card List', ['Name', 'Address', 'Sent', 'Received'], [130, 240, 56, 66], 28, 'Year: ____________');
SHEET_DRAW.xmas_budget = tableSheet('Holiday Budget Planner', ['Category', 'Budget', 'Actual', 'Difference'], [200, 100, 100, 110], 36, 'Year: ____________',
  ['Gifts', 'Food and drinks', 'Decorations', 'Travel', 'Cards and postage', 'Wrapping paper', 'Entertainment', 'Charity', 'Other', 'TOTAL']);
SHEET_DRAW.budget_monthly = tableSheet('Monthly Budget Planner', ['Category', 'Planned', 'Actual', 'Difference'], [200, 100, 100, 110], 30, 'Month: ____________',
  ['Total income', 'Rent / mortgage', 'Utilities', 'Groceries', 'Transport', 'Insurance', 'Phone and internet', 'Health', 'Dining out', 'Entertainment', 'Debt payments', 'Savings', 'Other', 'TOTAL EXPENSES']);
SHEET_DRAW.bills = tableSheet('Bill Tracker', ['Bill', 'Due date', 'Amount', 'Paid', 'Notes'], [150, 70, 70, 50, 150], 28, 'Month: ____________');
SHEET_DRAW.debt = tableSheet('Debt Payoff Tracker', ['Creditor', 'Balance', 'Interest', 'Min. payment', 'Paid off'], [150, 80, 70, 90, 80], 32, 'Start date: ____________');
SHEET_DRAW.exams = tableSheet('Exam Planner', ['Subject', 'Date', 'Topics to review', 'Study hours', 'Done'], [110, 70, 190, 70, 50], 30, 'Semester: ____________');
SHEET_DRAW.homework = tableSheet('Homework Tracker', ['Subject', 'Assignment', 'Due', 'Done'], [100, 230, 80, 50], 28, 'Week of: ____________');
SHEET_DRAW.workout = tableSheet('Workout Log', ['Exercise', 'Set 1', 'Set 2', 'Set 3', 'Set 4', 'Notes'], [150, 58, 58, 58, 58, 120], 30, 'Date: ____________');
SHEET_DRAW.guests = tableSheet('Wedding Guest List', ['Name', 'Party size', 'RSVP', 'Table', 'Notes'], [170, 70, 60, 60, 140], 26, '');
SHEET_DRAW.chores = tableSheet('Chore Chart', ['Chore', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [150, 52, 52, 52, 52, 52, 52, 52], 32, 'Week of: ____________');
SHEET_DRAW.timetable = tableSheet('Class Schedule', ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], [70, 92, 92, 92, 92, 92], 40, 'Semester: ____________',
  ['8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00']);
SHEET_DRAW.sleep = tableSheet('Sleep Tracker - ', ['Date', 'Bedtime', 'Wake up', 'Hours', 'Quality (1-5)'], [60, 100, 100, 80, 100], 22, '', function (o) { var a = [], n = monthDays(o); for (var i = 1; i <= n; i++) a.push(i); return a; });
(function () {
  var base = SHEET_DRAW.sleep;
  SHEET_DRAW.sleep = function (c, o, W, H) { var o2 = Object.assign({}, o); if (!o.title) o2.title = 'Sleep Tracker - ' + MONTHS[o.month] + ' ' + o.year; base(c, o2, W, H); };
})();

SHEET_DRAW.savings = function (c, o, W, H) {
  sHeader(c, o, W, '52-Week Savings Challenge', 'Goal: ____________');
  sText(c, 'Save the amount shown each week. Week 1 = 1, week 52 = 52. Total saved: 1,378.', SM, 84, 10.5, '#555');
  var cols = 4, rows = 13, top = 98, cw = (W - 2 * SM) / cols, rh = (H - 40 - top) / rows;
  for (var n = 1; n <= 52; n++) {
    var r = (n - 1) % rows, col = Math.floor((n - 1) / rows), x = SM + col * cw, y = top + r * rh;
    c.strokeStyle = GRID; c.lineWidth = 1; c.strokeRect(x + 3, y + 3, cw - 6, rh - 6);
    sText(c, 'Week ' + n, x + 12, y + rh * .6, 11, '#444', false); sText(c, String(n), x + cw - 44, y + rh * .6, 13, o.color, true, 'right'); sBox(c, x + cw - 30, y + rh * .5 - 6, 11);
  }
};
SHEET_DRAW.water = function (c, o, W, H) {
  var n = monthDays(o);
  sText(c, 'Water Tracker - ' + MONTHS[o.month] + ' ' + o.year, SM, 54, 22, o.color, true); sLine(c, SM, 64, SM + 70, 64, 2.5, o.color);
  sText(c, 'Color one circle for each glass of water. Daily goal: ______ glasses', SM, 84, 10.5, '#555');
  var top = 98, rh = Math.min(24, (H - 40 - top) / n), gx = SM + 50, gap = (W - SM - gx - 10) / 8;
  for (var d = 1; d <= n; d++) {
    var y = top + (d - 1) * rh; sLine(c, SM, y + rh, W - SM, y + rh); sText(c, String(d), SM + 6, y + rh * .68, 11, '#333', true);
    for (var g = 0; g < 8; g++) { c.strokeStyle = o.color; c.lineWidth = 1.2; c.beginPath(); c.arc(gx + g * gap + gap / 2, y + rh / 2, Math.min(8, rh / 2 - 3), 0, Math.PI * 2); c.stroke(); }
  }
};
SHEET_DRAW.rewards = function (c, o, W, H) {
  sHeader(c, o, W, 'Reward Chart', 'Name: ____________');
  var cols = fitCols([150, 54, 54, 54, 54, 54, 54, 54], W - 2 * SM), rows = 9, rh = Math.min(60, (H - 40 - 84 - 24 - 60) / rows);
  var y = sTable(c, o, SM, 84, cols, rh, rows, ['Task', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 24);
  for (var r = 0; r < rows; r++) { var x = SM + cols[0]; for (var k = 1; k < cols.length; k++) { starShape(c, x + cols[k] / 2, y + r * rh + rh / 2, Math.min(15, rh / 2 - 4), '#b9bfd6'); x += cols[k]; } }
  sText(c, 'My reward: ______________________________________', SM, y + rows * rh + 34, 13, o.color, true);
};
SHEET_DRAW.advent = function (c, o, W, H) {
  sHeader(c, o, W, 'Advent Calendar', 'December 1 - 24');
  var cols = 4, rows = 6, top = 84, gap = 8, cw = (W - 2 * SM - gap * (cols - 1)) / cols, ch = (H - 40 - top - gap * (rows - 1)) / rows;
  for (var n = 1; n <= 24; n++) {
    var x = SM + ((n - 1) % cols) * (cw + gap), y = top + Math.floor((n - 1) / cols) * (ch + gap);
    c.strokeStyle = o.color; c.lineWidth = 1.5; c.strokeRect(x, y, cw, ch);
    sText(c, String(n), x + 10, y + 24, 20, o.color, true); starShape(c, x + cw - 20, y + 20, 9, o.color);
    sLine(c, x + 12, y + ch - 14, x + cw - 12, y + ch - 14, .6);
  }
};
SHEET_DRAW.xmas_hunt = function (c, o, W, H) {
  sHeader(c, o, W, 'Christmas Scavenger Hunt', 'Name: ____________');
  sText(c, 'Find each item and tick the box!', SM, 84, 11, '#555');
  var items = ['Candy cane', 'Christmas tree', 'Snowman', 'Reindeer', 'Star', 'Wreath', 'Stocking', 'Gingerbread man', 'Bell', 'Wrapped present', 'Santa hat', 'Snowflake', 'Angel', 'Candle', 'Holly', 'Mistletoe', 'Ornament', 'Nutcracker', 'Fireplace', 'Christmas lights', 'Sleigh', 'Elf', 'Mittens', 'Hot chocolate'];
  var half = items.length / 2, w = (W - 2 * SM - 20) / 2, step = (H - 40 - 120) / half;
  checkList(c, o, SM, 120, w, items.slice(0, half), step); checkList(c, o, SM + w + 20, 120, w, items.slice(half), step);
};
SHEET_DRAW.xmas_menu = function (c, o, W, H) {
  sHeader(c, o, W, 'Holiday Meal Planner', 'Date: ____________');
  var lw = (W - 2 * SM) * .56, rx = SM + lw + 16, rw = W - SM - rx, y = 84;
  ['Appetizers', 'Main dish', 'Side dishes', 'Desserts', 'Drinks'].forEach(function (t) { y = blockLines(c, o, SM, y, lw, t, 4, false); });
  var ry = blockLines(c, o, rx, 84, rw, 'Shopping list', 17, true);
  blockLines(c, o, rx, ry - 4, rw, 'Cooking timeline', 3, false);
};
SHEET_DRAW.wedding_check = function (c, o, W, H) {
  sHeader(c, o, W, 'Wedding Checklist');
  var w = (W - 2 * SM - 20) / 2;
  sections(c, o, SM, 84, w, [
    ['12+ months before', ['Set your budget', 'Create a guest list', 'Choose a date', 'Book the venue']],
    ['9-11 months before', ['Hire a photographer', 'Choose the wedding party', 'Book the caterer']],
    ['6-8 months before', ['Choose attire', 'Order invitations', 'Plan the honeymoon']]]);
  sections(c, o, SM + w + 20, 84, w, [
    ['3-5 months before', ['Send invitations', 'Plan the ceremony', 'Book music or DJ']],
    ['1-2 months before', ['Finalize the guest count', 'Make the seating chart', 'Get the marriage license']],
    ['Final week', ['Confirm all vendors', 'Pack for the honeymoon', 'Relax and enjoy!']]]);
};
SHEET_DRAW.grocery = function (c, o, W, H) {
  sHeader(c, o, W, 'Grocery List', 'Date: ____________');
  var names = ['Fruits and vegetables', 'Dairy and eggs', 'Meat and fish', 'Bakery', 'Pantry', 'Frozen', 'Drinks', 'Household'];
  var w = (W - 2 * SM - 16) / 2, bh = (H - 40 - 84 - 3 * 14) / 4, rows = Math.floor((bh - 26) / 22);
  names.forEach(function (n, i) {
    var x = SM + (i % 2) * (w + 16), y = 84 + Math.floor(i / 2) * (bh + 14);
    c.strokeStyle = GRID; c.lineWidth = 1.2; c.strokeRect(x, y, w, bh); c.fillStyle = o.color; c.fillRect(x, y, w, 20); sText(c, n, x + 8, y + 14, 11, '#fff', true);
    for (var k = 1; k <= rows; k++) { sBox(c, x + 8, y + 20 + k * 22 - 11, 10); sLine(c, x + 24, y + 20 + k * 22, x + w - 8, y + 20 + k * 22); }
  });
};


SHEET_DRAW.year = function (c, o, W, H) {
  sText(c, String(o.year), SM, 60, 40, o.color, true);
  sText(c, o.title || 'Year at a glance', W - SM, 54, 14, '#555', false, 'right');
  sLine(c, SM, 72, W - SM, 72, 2, o.color);
  var cols = 3, rows = 4, top = 88, bw = (W - 2 * SM) / cols, bh = (H - 40 - top) / rows, init = o.weekStart === 1 ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  for (var m = 0; m < 12; m++) {
    var x = SM + (m % cols) * bw + 6, y = top + Math.floor(m / cols) * bh, w = bw - 12, cw = w / 7, rh = (bh - 38) / 7;
    sText(c, MONTHS[m], x, y + 14, 12, o.color, true);
    init.forEach(function (d, i) { sText(c, d, x + i * cw + cw / 2, y + 30, 8, '#888', true, 'center'); });
    var first = new Date(o.year, m, 1).getDay(), days = new Date(o.year, m + 1, 0).getDate();
    if (o.weekStart === 1) first = (first + 6) % 7;
    for (var d = 1; d <= days; d++) { var idx = first + d - 1; sText(c, String(d), x + (idx % 7) * cw + cw / 2, y + 38 + Math.floor(idx / 7) * rh + rh * .7, 8.5, '#333', false, 'center'); }
  }
};

function drawSheet(ctx, o) {
  var p = SHEET_PAPER[o.paper] || SHEET_PAPER.letter, W = p[0], H = p[1];
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, o.px, o.px * H / W);
  ctx.scale(o.px / W, o.px / W);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  SHEET_DRAW[o.type](ctx, o, W, H);
  ctx.fillStyle = '#9aa0b8'; ctx.font = '8px Arial'; ctx.textAlign = 'center';
  ctx.fillText('toolnes.netlify.app - free printable sheets', W / 2, H - 14);
  ctx.restore();
}

function initSheetApp(fixed) {
  var $ = function (id) { return document.getElementById(id); };
  var COLORS = ['#5b45d6', '#2563eb', '#16a34a', '#db2777', '#222222'];
  var SPACING = {
    lined: [['Narrow', 20], ['College', 25], ['Wide', 32]],
    dotgrid: [['Small (3.5 mm)', 10], ['Standard (5 mm)', 14.2], ['Large (7 mm)', 20]],
    graph: [['Small (3.5 mm)', 10], ['Standard (5 mm)', 14.2], ['Large (7 mm)', 20]]
  };
  var DATE_TYPES = ['calendar', 'habit', 'water', 'sleep'];
  var now = new Date();
  var o = { type: fixed || 'weekly', paper: 'letter', color: COLORS[0], title: '', month: now.getMonth(), year: now.getFullYear(), weekStart: 0, spacing: null, margin: true };
  var typeBtns = {}, curCat = 'All';

  MONTHS.forEach(function (m, i) { var op = document.createElement('option'); op.value = i; op.textContent = m; $('month').appendChild(op); });
  $('month').value = o.month; $('year').value = o.year;

  var sw = $('swatches');
  COLORS.forEach(function (c, i) {
    var b = document.createElement('button'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', 'Color ' + (i + 1));
    if (i === 0) b.className = 'on';
    b.addEventListener('click', function () {
      o.color = c; Array.prototype.forEach.call(sw.children, function (x) { x.classList.remove('on'); }); b.classList.add('on');
      drawMain(); drawThumbs();
    });
    sw.appendChild(b);
  });

  function buildTypes() {
    if (!$('types')) return;
    SHEET_TYPES.forEach(function (t) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 't';
      var cv = document.createElement('canvas'); var sp = document.createElement('span'); sp.textContent = t.name;
      b.appendChild(cv); b.appendChild(sp);
      b.addEventListener('click', function () { selectType(t.id, true); });
      $('types').appendChild(b); typeBtns[t.id] = b;
    });
    if ($('cats')) {
      var cats = ['All'];
      SHEET_TYPES.forEach(function (t) { if (cats.indexOf(t.cat) < 0) cats.push(t.cat); });
      cats.forEach(function (c) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (c === 'All' ? ' on' : ''); b.textContent = c;
        b.addEventListener('click', function () {
          curCat = c; Array.prototype.forEach.call($('cats').children, function (x) { x.classList.toggle('on', x === b); });
          SHEET_TYPES.forEach(function (t) { typeBtns[t.id].style.display = (c === 'All' || t.cat === c) ? '' : 'none'; });
        });
        $('cats').appendChild(b);
      });
    }
  }
  function drawThumbs() {
    if (!$('types')) return;
    SHEET_TYPES.forEach(function (t) {
      var cv = typeBtns[t.id].querySelector('canvas'), p = SHEET_PAPER[o.paper], px = 180;
      cv.width = px; cv.height = Math.round(px * p[1] / p[0]);
      drawSheet(cv.getContext('2d'), Object.assign({}, o, { type: t.id, px: px, title: '' }));
    });
  }
  function setSpacingOptions() {
    var list = SPACING[o.type], f = $('fSpacing');
    if (!list) { f.style.display = 'none'; o.spacing = null; return; }
    f.style.display = ''; $('spacing').innerHTML = '';
    list.forEach(function (it, i) { var op = document.createElement('option'); op.value = it[1]; op.textContent = it[0]; $('spacing').appendChild(op); if (i === 1) op.selected = true; });
    o.spacing = +$('spacing').value;
  }
  function selectType(id, scroll) {
    o.type = id;
    Object.keys(typeBtns).forEach(function (k) { typeBtns[k].classList.toggle('on', k === id); });
    setSpacingOptions();
    $('fDate').style.display = DATE_TYPES.indexOf(id) >= 0 ? '' : 'none';
    $('fWeek').style.display = id === 'calendar' ? '' : 'none';
    $('fMargin').style.display = id === 'lined' ? '' : 'none';
    drawMain();
    if (!fixed) { try { history.replaceState(null, '', '#' + id); } catch (e) {} }
    if (scroll && window.innerWidth < 1000) $('sheet').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function applyPaperCss() {
    var p = o.paper;
    $('pageStyle').textContent = '@page{size:' + (p === 'a4' ? 'A4' : 'letter') + ';margin:0}';
    document.documentElement.style.setProperty('--pw', p === 'a4' ? '210mm' : '8.5in');
    document.documentElement.style.setProperty('--ph', p === 'a4' ? '297mm' : '11in');
  }
  function drawMain() {
    var cv = $('sheet'), p = SHEET_PAPER[o.paper], px = 1000;
    cv.width = px; cv.height = Math.round(px * p[1] / p[0]);
    drawSheet(cv.getContext('2d'), Object.assign({}, o, { px: px }));
  }

  $('title').addEventListener('input', function () { o.title = this.value; drawMain(); });
  $('paper').addEventListener('change', function () { o.paper = this.value; applyPaperCss(); drawMain(); drawThumbs(); });
  $('spacing').addEventListener('change', function () { o.spacing = +this.value; drawMain(); });
  $('month').addEventListener('change', function () { o.month = +this.value; drawMain(); });
  $('year').addEventListener('input', function () { var y = parseInt(this.value, 10); if (y >= 1900 && y <= 2100) { o.year = y; drawMain(); } });
  $('week').addEventListener('change', function () { o.weekStart = +this.value; drawMain(); });
  $('margin').addEventListener('change', function () { o.margin = this.checked; drawMain(); });
  $('dl').addEventListener('click', function () {
    var p = SHEET_PAPER[o.paper], px = o.paper === 'a4' ? 2480 : 2550, cv = document.createElement('canvas');
    cv.width = px; cv.height = Math.round(px * p[1] / p[0]);
    drawSheet(cv.getContext('2d'), Object.assign({}, o, { px: px }));
    cv.toBlob(function (blob) {
      if (!blob) return;
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'toolnes-' + o.type + (DATE_TYPES.indexOf(o.type) >= 0 ? '-' + o.year + '-' + (o.month + 1) : '') + '-' + o.paper + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
    }, 'image/png');
  });
  $('pr').addEventListener('click', function () { window.print(); });

  buildTypes(); applyPaperCss();
  var h = (location.hash || '').replace('#', ''), ok = SHEET_TYPES.some(function (t) { return t.id === h; });
  drawThumbs();
  selectType(fixed ? fixed : (ok ? h : 'weekly'), false);
  if ($('year2')) $('year2').textContent = now.getFullYear();
}
