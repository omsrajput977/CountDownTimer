const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const setBtn = document.getElementById('setBtn');
const secondsInput = document.getElementById('seconds');
const display = document.getElementById('display');
const sub = document.getElementById('sub');
const progress = document.getElementById('progress');
const visual = document.getElementById('visual');

let total = 0;
let remaining = 0;
let running = false;
let intervalId = null;

const audioCtx = new (window.AudioContext)();
function beep() {
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = 880;
  g.gain.value = 0.12;

  o.connect(g);
  g.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  o.start(now);
  o.stop(now + 0.2);
}

function notify() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification('Timer Finished!', { body: 'Your countdown is complete.', silent: true });
  }
}

function format(s) {
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  if (minutes > 0) {
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  } else {
    return String(seconds).padStart(2, '0');
  }
}

function update() {
  display.textContent = format(Math.ceil(remaining));
}

function start() {
  if (running || total <= 0) return;
  running = true;
  sub.textContent = 'Running';

  intervalId = setInterval(() => {
    remaining = Math.max(0, remaining - 1);
    update();

    if (total > 0 && progress) {
      const ratio = (total - remaining) / total;
      progress.style.width = `${Math.round(ratio * 100)}%`;
    }

    if (remaining <= 0) finish();
  }, 1000);

  update();
  if (progress) progress.style.width = `0%`;
}

function pause() {
  if (!running) return;
  running = false;
  clearInterval(intervalId);
  intervalId = null;
  sub.textContent = 'Paused';
}

function reset() {
  running = false;
  clearInterval(intervalId);
  intervalId = null;
  remaining = total;
  update();
  sub.textContent = 'Ready';
  if (progress) progress.style.width = '0%';
}

function finish() {
  running = false;
  clearInterval(intervalId);
  intervalId = null;
  remaining = 0;
  update();
  sub.textContent = 'Finished';
  if (progress) progress.style.width = '100%';

  beep();
  notify();
}

function setTime() {
  const val = Number(secondsInput.value);
  if (!Number.isFinite(val) || val <= 0) {
    alert('Please enter a positive number of seconds.');
    return;
  }
  total = remaining = Math.floor(val);
  update();
  sub.textContent = `Set to ${format(total)}`;
  if (progress) progress.style.width = '0%';
}

document.querySelectorAll('.preset button').forEach(b => {
  b.onclick = () => {
    secondsInput.value = b.dataset.sec;
    setTime();
  };
});
setBtn.onclick = setTime;
startBtn.onclick = start;
pauseBtn.onclick = pause;
resetBtn.onclick = reset;

document.addEventListener('click', function once() {
  document.removeEventListener('click', once);
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
});
