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
let timerId = null;    
let lastTick = null;   


const audioCtx = new (window.AudioContext)();

function beep() {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  
  const o = audioCtx.createOscillator();  
  const g = audioCtx.createGain();      

  o.type = "sine";         
  o.frequency.value = 880;  
  g.gain.value = 0.12;      

  
  o.connect(g);
  g.connect(audioCtx.destination);

  
  const now = audioCtx.currentTime;
  o.start(now);
  o.stop(now + 0.2);
}



async function notify() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification('Timer Finished!', { body: 'Your countdown is complete.', silent: true });
  }
  
}


function format(s) {
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;

  if (minutes > 0) {
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  } else {
    return String(seconds).padStart(2, "0");
  }
}



function update() {
  display.textContent = format(Math.ceil(remaining));
}


function start() {
  if (total <= 0 || running) return; 
  running = true;
  lastTick = performance.now(); 
  sub.textContent = 'Running';
  timerId = requestAnimationFrame(tick);
}


function pause() {
  if (!running) return;
  running = false;
  cancelAnimationFrame(timerId);
  timerId = null;
  sub.textContent = 'Paused';
}


function reset() {
  running = false;
  cancelAnimationFrame(timerId);
  timerId = null;
  remaining = total;
  update();
  sub.textContent = 'Ready';
  
  if (progress) progress.style.width = '0%';
}


function tick(now) {
  if (!running) return;
  const dt = (now - lastTick) / 1000; 
  lastTick = now;

  remaining = Math.max(0, remaining - dt); 
  update();

  
  if (total > 0 && progress) {
    const ratio = (total - remaining) / total;
    progress.style.width = `${Math.round(ratio * 100)}%`;
  }

  
  if (remaining <= 0) {
    running = false;
    cancelAnimationFrame(timerId);
    timerId = null;
    sub.textContent = 'Finished';
    
    beep();
    notify();
    return;
  }

  timerId = requestAnimationFrame(tick);
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


document.addEventListener('click', function req() {
    document.removeEventListener('click', req);

    if (!('Notification' in window)) return;

    Notification.requestPermission().then(permission => {

    });
}); 
