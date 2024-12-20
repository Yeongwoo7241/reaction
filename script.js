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
