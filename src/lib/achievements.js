// Achievement definitions and utility helpers
// Each achievement has:
// - id: stable string used for storage
// - category: display grouping
// - name, emoji, desc: UI strings
// - xp: XP awarded when unlocked
export const ACHIEVEMENTS = [
  { id: 'first-grip', category: '🧗 Climbing Milestones', name: 'First Grip', emoji: '✋', desc: 'Log your very first problem.', xp: 25 },
  { id: 'new-territory', category: '🧭 Exploration & Logging', name: 'New Territory', emoji: '🗺️', desc: 'Log a problem at a new gym or location.', xp: 25 },
  { id: 'breaking-sweat', category: '🧗 Climbing Milestones', name: 'Breaking Sweat', emoji: '💦', desc: 'Complete 5 problems in one session.', xp: 50 },
  { id: 'no-fear', category: '💪 Skill & Performance', name: 'No Fear', emoji: '😎', desc: 'Attempt a problem above your comfort zone.', xp: 50 },
  { id: 'smooth-operator', category: '💪 Skill & Performance', name: 'Smooth Operator', emoji: '🌀', desc: 'Flash (send on first attempt) 3 problems in one session.', xp: 75 },
  { id: 'consistency', category: '🧗 Climbing Milestones', name: 'Consistency is Key', emoji: '📆', desc: 'Climb 3 days in a row.', xp: 75 },
  { id: 'weekend-warrior', category: '🧗 Climbing Milestones', name: 'Weekend Warrior', emoji: '🪓', desc: 'Log problems on both Saturday and Sunday.', xp: 75 },
  { id: 'comeback-kid', category: '💪 Skill & Performance', name: 'Comeback Kid', emoji: '🔁', desc: 'Send a problem you previously failed on.', xp: 100 },
  { id: 'crux-destroyer', category: '💪 Skill & Performance', name: 'Crux Destroyer', emoji: '💥', desc: 'Complete a problem after 5+ failed attempts.', xp: 125 },
  { id: 'the-finisher', category: '💪 Skill & Performance', name: 'The Finisher', emoji: '🧩', desc: 'Complete every problem you attempted in a session.', xp: 125 },
  { id: 'hundred-grips', category: '🧗 Climbing Milestones', name: '100 Grips Later', emoji: '💯', desc: 'Log your 100th problem.', xp: 150 },
  { id: 'top-out-titan', category: '🧗 Climbing Milestones', name: 'Top Out Titan', emoji: '🏁', desc: 'Finish a project you’ve been tracking for over a week.', xp: 175 },
  { id: 'chalked-up', category: '🌟 Endurance & Dedication', name: 'Chalked Up', emoji: '🧴', desc: 'Log 10 sessions in a month.', xp: 200 },
  { id: 'never-skipping', category: '🌟 Endurance & Dedication', name: 'Never Skipping Wall Day', emoji: '🧗', desc: 'Climb every week for 2 months straight.', xp: 250 },
  { id: 'long-haul-hero', category: '🌟 Endurance & Dedication', name: 'Long Haul Hero', emoji: '🚀', desc: 'Hit 1 year of continuous logging.', xp: 350 },
  { id: 'trailblazer', category: '🌟 Endurance & Dedication', name: 'Trailblazer', emoji: '🪙', desc: 'Earn 5000 total XP.', xp: 400 },
  { id: 'legend-status', category: '🌟 Endurance & Dedication', name: 'Legend Status', emoji: '🐉', desc: 'Reach Level 10 — “Legend of the Wall.”', xp: 500 },
];

export function findAchievement(id) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// Helper: extract numeric part from grade string
function gradeNumber(g) {
  if (!g) return 0;
  const m = String(g).match(/(\d+)/);
  return m ? parseInt(m[0], 10) : 0;
}

// Simple date helpers
function toDateKey(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

// Evaluate a saved session and return a list of achievement ids that should unlock.
// - session: the Session object just saved (with attempts)
// - problems: current problems array (after marking completed dates)
// - pastSessions: array of previous sessions (not including the current one)
// - prevPB: numeric previous personal best before this session
// - currentXp: XP total after session XP has been applied (achievements will add more)
export function evaluateSessionAchievements({ session, problems, pastSessions = [], prevPB = 0, currentXp = 0 }) {
  const unlocked = new Set();

  const attempts = session.attempts || [];
  if (!attempts.length) return [];

  // Helpers
  const sends = attempts.filter((a) => a.result === 'send');
  const sendsCount = sends.length;

  // Map problemId -> attempts in this session (in order)
  const byProblem = attempts.reduce((acc, a) => {
    (acc[a.problemId] = acc[a.problemId] || []).push(a);
    return acc;
  }, {});

  // Build quick lookup for problems by id
  const probMap = (problems || []).reduce((m, p) => { m[p.id] = p; return m; }, {});

  // 1) First Grip: if there were no completed problems before (prevPB===0) and this session created at least one send
  if (prevPB === 0 && sendsCount > 0) unlocked.add('first-grip');

  // 2) New Territory: if session.location exists and is a new area
  if (session.location) {
    const existingAreas = new Set((problems || []).map((p) => (p.area || '').trim()).filter(Boolean));
    if (!existingAreas.has(session.location.trim())) unlocked.add('new-territory');
  }

  // 3) Breaking Sweat: 5 sends in one session
  if (sendsCount >= 5) unlocked.add('breaking-sweat');

  // 4) No Fear: attempted a problem higher than previous PB
  for (const a of attempts) {
    const p = probMap[a.problemId];
    const gn = gradeNumber(p ? p.grade : '');
    if (gn > prevPB) { unlocked.add('no-fear'); break; }
  }

  // 5) Smooth Operator: flash (send on first attempt) 3 problems in one session
  let firstSendFlashes = 0;
  for (const pid of Object.keys(byProblem)) {
    const list = byProblem[pid];
    if (list.length >= 1 && list[0].result === 'send') firstSendFlashes += 1;
  }
  if (firstSendFlashes >= 3) unlocked.add('smooth-operator');

  // 6) The Finisher: all attempts in the session are sends
  if (attempts.every((a) => a.result === 'send')) unlocked.add('the-finisher');

  // 7) Comeback Kid & Crux Destroyer: compare past sessions to see history for problems
  // Build map of historical attempts counts per problem
  const histCounts = {};
  for (const s of pastSessions || []) {
    for (const a of s.attempts || []) {
      histCounts[a.problemId] = histCounts[a.problemId] || { attempts: 0, sends: 0 };
      histCounts[a.problemId].attempts += (a.result === 'attempt' ? 1 : (a.result === 'send' ? 0 : 1));
      if (a.result === 'send') histCounts[a.problemId].sends += 1;
    }
  }

  for (const sendAttempt of sends) {
    const pid = sendAttempt.problemId;
    const hist = histCounts[pid] || { attempts: 0, sends: 0 };
    // Comeback Kid: there was at least one prior non-send attempt and now it's sent
    if (hist.attempts > 0 && hist.sends === 0) unlocked.add('comeback-kid');
    // Crux Destroyer: 5+ prior failed attempts
    if (hist.attempts >= 5) unlocked.add('crux-destroyer');
  }

  // 8) 100 Grips Later: total problems logged (problems array length) >= 100
  if ((problems || []).length >= 100) unlocked.add('hundred-grips');

  // 9) Top Out Titan: completed a problem that was created over a week ago
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  for (const sendAttempt of sends) {
    const p = probMap[sendAttempt.problemId];
    if (p && p.createdAt) {
      const created = new Date(p.createdAt).getTime();
      if ((new Date(session.date).getTime() - created) > oneWeekMs) {
        unlocked.add('top-out-titan');
        break;
      }
    }
  }

  // 10) Trailblazer: reach 5000 XP
  if (currentXp >= 5000) unlocked.add('trailblazer');

  // 11) Legend Status: reach Level 10 (we can infer from currentXp >= 4000 per level table)
  if (currentXp >= 4000) unlocked.add('legend-status');

  return Array.from(unlocked);
}

// --- Additional helpers for streak/time-based achievements ---

function buildDateSet(sessions) {
  const set = new Set();
  for (const s of sessions || []) {
    if (!s || !s.date) continue;
    set.add(toDateKey(s.date));
  }
  return set;
}

function consecutiveDaysEndingOn(dateKey, dateSet) {
  // Count consecutive days ending on dateKey that exist in dateSet
  let count = 0;
  let d = new Date(dateKey + 'T00:00:00');
  while (true) {
    const k = d.toISOString().slice(0, 10);
    if (!dateSet.has(k)) break;
    count += 1;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

function weekKey(date) {
  // approximate week key YYYY-WW using UTC week starting Monday
  const d = new Date(date + 'T00:00:00');
  // get Thursday in current week to calculate ISO week number
  const target = new Date(d.valueOf());
  target.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const weekNumber = Math.round(((target - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7) + 1;
  return `${target.getFullYear()}-${String(weekNumber).padStart(2, '0')}`;
}

function monthKey(date) {
  const d = new Date(date + 'T00:00:00');
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Extended evaluation for streak/temporal achievements
export function evaluateTemporalAchievements({ session, pastSessions = [], currentXp = 0 }) {
  const unlocked = new Set();
  const allSessions = [...(pastSessions || []), session];
  const dateSet = buildDateSet(allSessions);
  const sessionDateKey = toDateKey(session.date);

  // Consistency is Key: climb 3 days in a row (including today)
  if (consecutiveDaysEndingOn(sessionDateKey, dateSet) >= 3) unlocked.add('consistency');

  // Weekend Warrior: any week where both Saturday and Sunday have sessions
  // Build weeks map: weekKey -> set of weekdays present
  const weeks = {};
  for (const d of dateSet) {
    const w = weekKey(d);
    weeks[w] = weeks[w] || new Set();
    const day = new Date(d + 'T00:00:00').getDay(); // 0 Sun .. 6 Sat
    weeks[w].add(day);
  }
  for (const w of Object.keys(weeks)) {
    const s = weeks[w];
    if (s.has(6) && s.has(0)) { unlocked.add('weekend-warrior'); break; }
  }

  // Chalked Up: 10 sessions in the same month
  const monthCounts = {};
  for (const d of dateSet) {
    const m = monthKey(d);
    monthCounts[m] = (monthCounts[m] || 0) + 1;
  }
  for (const m of Object.keys(monthCounts)) {
    if (monthCounts[m] >= 10) { unlocked.add('chalked-up'); break; }
  }

  // Never Skipping Wall Day: climb every week for 2 months straight (8 consecutive weeks)
  // Build a sorted list of week keys present
  const weeksPresent = new Set(Object.keys(weeks));
  // gather week keys for the 8 weeks ending on the session week
  const currentWeek = weekKey(sessionDateKey);
  // generate previous 7 week keys
  const weekKeys = [];
  let wkDate = new Date(sessionDateKey + 'T00:00:00');
  for (let i = 0; i < 8; i++) {
    weekKeys.push(weekKey(wkDate.toISOString().slice(0,10)));
    wkDate.setDate(wkDate.getDate() - 7);
  }
  if (weekKeys.every((k) => weeksPresent.has(k))) unlocked.add('never-skipping');

  // Long Haul Hero: 1 year of continuous logging (365-day streak)
  if (consecutiveDaysEndingOn(sessionDateKey, dateSet) >= 365) unlocked.add('long-haul-hero');

  return Array.from(unlocked);
}
