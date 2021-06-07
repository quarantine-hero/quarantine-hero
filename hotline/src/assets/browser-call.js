let to;
let apiKey;
let device;

function log(message, highlight) {
  const logContainer = document.getElementById('log');

  const line = document.createElement('p');
  line.textContent = message;
  if (highlight) {
    line.className = 'highlighted';
  }

  logContainer.appendChild(line);
  logContainer.scrollTop = logContainer.scrollHeight;
}

window.onload = () => {
  const { search } = window.location;
  const url = new URLSearchParams(search);

  to = url.get('to');
  apiKey = url.get('apiKey');

  document.getElementById('lbl_to').textContent = to || 'UNKNOWN NUMBER';
};

function startCall() {
  // Do the actual call
  if (!device) {
    log('No device initialized', true);
  }

  log(`Calling ${to}...`);

  const outgoingConnection = device.connect({
    To: to,
  });

  outgoingConnection.on('ringing', () => {
    log('Ringing...');
  });

  document.getElementById('btn_call').disabled = true;
  document.getElementById('btn_hangup').disabled = false;
}

document.getElementById('btn_call').onclick = async () => {
  if (!apiKey || !to) {
    log('Invalid API key or phone number', true);
    return;
  }

  // Get auth token
  const response = await fetch(
    `./getToken?apiKey=${encodeURIComponent(apiKey)}`,
  );
  if (response.status !== 200) {
    log('Error while retrieving the auth token', true);
    return;
  }
  const authToken = await response.text();

  if (device) {
    startCall();
    return;
  }

  // Setup Twilio Device
  device = new Twilio.Device(authToken, {
    codecPreferences: ['opus', 'pcmu'],
    fakeLocalDTMF: true,
    enableRingingState: true,
  });

  device.on('ready', () => {
    log('Device Ready!');
    startCall();
  });

  device.on('error', (error) => {
    log(`Device Error: ${error.message}`, true);
    document.getElementById('btn_call').disabled = false;
    document.getElementById('btn_hangup').disabled = true;
  });

  device.on('connect', () => {
    log('Successfully established call!');
  });

  device.on('disconnect', () => {
    log('Call ended.');
    document.getElementById('btn_call').disabled = false;
    document.getElementById('btn_hangup').disabled = true;
  });
};

document.getElementById('btn_hangup').onclick = () => {
  if (device) {
    device.disconnectAll();
  }
};
