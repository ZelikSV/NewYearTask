
const leversSwitchersWrap = document.querySelectorAll('.lever');
const cityBuilding = document.querySelectorAll('.lever-card-img');


const socket = new WebSocket('ws://178.20.156.145:3000');

console.log(socket);

const levers = [false, false, false, false]
const knownLever = 0;
let checkedLever = 1;
let stateFlag = true;

const sendCompareQuery = (lever1, lever2, stateId) => {
  const query = {
    action: 'check',
    lever1,
    lever2,
    stateId,
  }

  socket.send(JSON.stringify(query));
}

const sendTurnOffQuery = stateId => {
  const query = {
    action: 'powerOff',
    stateId,
  }

  socket.send(JSON.stringify(query));
}

const checkAllSameOrNot = () => levers.every( lever => lever === stateFlag );

const toggleLevers = () => {
    leversSwitchersWrap.forEach((item, i) => {
        item.checked = levers[i];
        if(item.checked === true){
          cityBuilding[i].classList.add('light');
        }else{
          cityBuilding[i].classList.remove('light');
        }
  })
}

socket.onopen = () => console.log('Connected');
socket.onclose = () => console.log('Disconnected');
socket.onmessage = event => {
  const data = JSON.parse(event.data);

  if (data.pulled >= 0) {
    levers[data.pulled] = !levers[data.pulled];
    toggleLevers();
    sendCompareQuery(knownLever, checkedLever, data.stateId);
  }

  if (data.newState === 'poweredOn') stateFlag = false;

  if (data.newState === 'poweredOff') {
    console.log('Token: ', data.token);
    socket.close();
  }

  if (data.same) {
    levers[checkedLever] = levers[knownLever];
    if (checkedLever < levers.length - 1) checkedLever++;
    if (checkAllSameOrNot()) sendTurnOffQuery(data.stateId);
  }
}