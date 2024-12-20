let selectedParticipants = [];
let scores = {};
let currentParticipant = null;

const newParticipantName = document.getElementById('newParticipantName');
const addParticipantBtn = document.getElementById('addParticipantBtn');
const participantsDiv = document.getElementById('participants');
const gameStartBtn = document.getElementById('gameStartBtn');
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const participantSelection = document.getElementById('participantSelection');
const currentPlayer = document.getElementById('currentPlayer');
const coffeeMessage = document.getElementById('coffeeMessage');
const mainBtn = document.getElementById('mainBtn');
const resultDisplay = document.getElementById('resultDisplay');
const results = document.getElementById('results');

let reactionStartTime = null; // 초록색 시점
let inGreenPhase = false;
let reactionTimer = null;
let gameRunning = false;

function attachParticipantListeners() {
    const participantBtns = document.querySelectorAll('.participantBtn');
    participantBtns.forEach(button => {
        button.addEventListener('click', toggleParticipantSelection);
    });
}

attachParticipantListeners();

addParticipantBtn.addEventListener('click', () => {
    const name = newParticipantName.value.trim();
    if (name) {
        const newButton = document.createElement('button');
        newButton.className = 'participantBtn';
        newButton.setAttribute('data-name', name);
        newButton.innerText = name;
        newButton.addEventListener('click', toggleParticipantSelection);
        participantsDiv.appendChild(newButton);

        newParticipantName.value = '';
        updateGameStartButton();
    }
});

newParticipantName.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        addParticipantBtn.click();
    }
});

function toggleParticipantSelection(event) {
    const button = event.target;
    const participantName = button.getAttribute('data-name');

    if (button.classList.contains('selected')) {
        button.classList.remove('selected');
        selectedParticipants = selectedParticipants.filter(name => name !== participantName);
    } else {
        button.classList.add('selected');
        selectedParticipants.push(participantName);
    }

    updateGameStartButton();
}

function updateGameStartButton() {
    gameStartBtn.disabled = selectedParticipants.length === 0;
}

gameStartBtn.addEventListener('click', () => {
    if (selectedParticipants.length > 0) {
        page1.style.display = 'none';
        page2.style.display = 'block';

        participantSelection.innerHTML = '';
        selectedParticipants.forEach(participantName => {
            const newButton = document.createElement('button');
            newButton.className = 'participantBtn';
            newButton.setAttribute('data-name', participantName);
            newButton.innerText = participantName;
            newButton.addEventListener('click', selectParticipant);
            participantSelection.appendChild(newButton);
        });
    }
});

function selectParticipant(event) {
    currentParticipant = event.target.getAttribute('data-name');
    currentPlayer.innerText = 현재 플레이어: ${currentParticipant};
    mainBtn.disabled = false;
    mainBtn.innerText = 'Start';
    resultDisplay.innerText = '';
    page2.style.backgroundColor = '#ffffff'; // 초기 흰색 컨테이너 배경

    inGreenPhase = false;
    gameRunning = false;
}

mainBtn.addEventListener('click', () => {
    if (!gameRunning && mainBtn.innerText === 'Start') {
        startReactionGame();
    } else if (mainBtn.innerText === 'Stop') {
        // Stop 클릭 시
        if (inGreenPhase) {
            const stopTime = Date.now();
            const reactionTime = stopTime - reactionStartTime; // ms
            resultDisplay.innerText = 반응속도: ${reactionTime}ms;
            scores[currentParticipant] = reactionTime;
            endRound();
        } else {
            // 초록색 전 클릭 - 패널티
            resultDisplay.innerText = '너무 일찍 눌렀습니다! 2000ms 페널티';
            scores[currentParticipant] = 2000;
            endRound();
        }
    } else if (mainBtn.innerText === 'Reset') {
        // Reset 상태 시 추가 로직 필요시 구현
    }
});
function startReactionGame() {
    gameRunning = true;
    mainBtn.innerText = 'Stop';
    resultDisplay.innerText = '';

    // container(#page2) 배경을 회색으로 변경
    page2.style.backgroundColor = 'gray';
    inGreenPhase = false;

    const delay = (Math.random() * 2000) + 3000; // 3~5초
    reactionTimer = setTimeout(() => {
        // 초록색 전환 (더 밝은 색상으로 수정)
        page2.style.backgroundColor = '#32CD32'; // 밝은 초록색
        inGreenPhase = true;
        reactionStartTime = Date.now();
    }, delay);
}

function endRound() {
    mainBtn.innerText = 'Reset';
    mainBtn.disabled = false;
    gameRunning = false;
    inGreenPhase = false;
    clearTimeout(reactionTimer);

    // 라운드 종료 후 컨테이너 배경을 다시 흰색으로
    page2.style.backgroundColor = '#ffffff';

    displayResults();
    processResults();
}

function displayResults() {
    results.innerHTML = '';

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const dateHeading = document.createElement('h3');
    dateHeading.innerText = `${yyyy}년 ${mm}월 ${dd}일`;
    results.appendChild(dateHeading);

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const headers = ['순위', '이름', '점수(ms)'];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.innerText = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // 점수 높은 순으로 정렬
    const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);

    sortedScores.forEach(([participant, score], index) => {
        const row = document.createElement('tr');
        const rankCell = document.createElement('td');
        rankCell.innerText = `${index + 1}위`;
        const nameCell = document.createElement('td');
        nameCell.innerText = participant;
        const scoreCell = document.createElement('td');
        scoreCell.innerText = score;

        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        table.appendChild(row);
    });

    results.appendChild(table);
}

function processResults() {
    if (Object.keys(scores).length === selectedParticipants.length) {
        let highestScore = -Infinity;
        let losers = [];

        for (const [participant, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                losers = [participant];
            } else if (score === highestScore) {
                losers.push(participant);
            }
        }

        if (losers.length === 1) {
            const loserMessage = document.createElement('div');
            loserMessage.className = 'highlight';
            loserMessage.innerText = `오늘의 거북이: ${losers[0]}`;
            results.appendChild(loserMessage);
        } else {
            const tieMessage = document.createElement('div');
            tieMessage.className = 'highlight';
            tieMessage.innerText = `동점자 발생! 재경기 필요: ${losers.join(', ')}`;
            results.appendChild(tieMessage);

            selectedParticipants = losers;
            participantSelection.innerHTML = '';

            selectedParticipants.forEach(participantName => {
                const newButton = document.createElement('button');
                newButton.className = 'participantBtn';
                newButton.setAttribute('data-name', participantName);
                newButton.innerText = participantName;
                newButton.addEventListener('click', selectParticipant);
                participantSelection.appendChild(newButton);
            });

            mainBtn.innerText = 'Start';
            mainBtn.disabled = true;
        }
    }
}

function launchFireworks() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const interval = setInterval(() => {
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            createFirework(x, y);
        }
    }, 500);

    setTimeout(() => {
        clearInterval(interval);
    }, 10000);
}

function createFirework(x, y) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.left = ${x}px;
    firework.style.top = ${y}px;
    document.body.appendChild(firework);

    setTimeout(() => {
        firework.remove();
    }, 10000);
}

function updateCoffeeMessage() {
    let lowestScore = Infinity;
    let lowestScorer = '';

    for (const [participant, score] of Object.entries(scores)) {
        if (score < lowestScore) {
            lowestScore = score;
            lowestScorer = participant;
        }
    }

    coffeeMessage.innerText = 오늘의 거북이는?;
}

// 초기화
updateCoffeeMessage(); 
