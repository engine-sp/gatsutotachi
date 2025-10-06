document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        start: document.getElementById('start-screen'),
        practice: document.getElementById('practice-screen'),
        end: document.getElementById('end-screen'),
    };
    const scopeModal = document.getElementById('scope-modal');
    const scopeDisplay = document.getElementById('scope-display');
    const changeScopeBtn = document.getElementById('change-scope-btn');
    const saveScopeBtn = document.getElementById('save-scope-btn');
    const startBtn = document.getElementById('start-btn');
    const monthsCheckbox = document.getElementById('months-checkbox');
    const daysCheckbox = document.getElementById('days-checkbox');
    const dayPracticeMode = document.getElementsByName('day-practice-mode');
    const questionCounter = document.getElementById('question-counter');
    const earlyEndBtn = document.getElementById('early-end-btn');
    const kanjiDisplay = document.getElementById('kanji-display');
    const statusBar = document.getElementById('status-bar');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const scoreDisplay = document.getElementById('score-display');
    const reviewTable = document.getElementById('review-table');
    const restartBtn = document.getElementById('restart-btn');

    let practiceScope = { months: true, days: true, dayMode: 'special' };
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];
    let canGoNext = false;

    const showScreen = (screenName) => {
        for (const key in screens) {
            screens[key].classList.add('hidden');
        }
        screens[screenName].classList.remove('hidden');
    };

    const updateScopeDisplay = () => {
        let scopeText = [];
        if (practiceScope.months) {
            scopeText.push('練習「X月」');
        }
        if (practiceScope.days) {
            if (practiceScope.dayMode === 'special') {
                scopeText.push('練習「X日」(特別日)');
            } else {
                scopeText.push('練習「X日」(全部)');
            }
        }
        if (scopeText.length === 0) {
            scopeDisplay.textContent = '未設定';
        } else {
            scopeDisplay.textContent = scopeText.join('、');
        }
    };

    changeScopeBtn.addEventListener('click', () => {
        scopeModal.classList.remove('hidden');
    });

    saveScopeBtn.addEventListener('click', () => {
        if (!monthsCheckbox.checked && !daysCheckbox.checked) {
            alert('必須至少勾選一項類別才能開始練習');
            return;
        }
        practiceScope.months = monthsCheckbox.checked;
        practiceScope.days = daysCheckbox.checked;
        if (practiceScope.days) {
            practiceScope.dayMode = document.querySelector('input[name="day-practice-mode"]:checked').value;
        }
        updateScopeDisplay();
        scopeModal.classList.add('hidden');
    });

    startBtn.addEventListener('click', () => {
        generateQuestions();
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        showScreen('practice');
        displayQuestion();
    });

    const generateQuestions = () => {
        questions = [];
        const numQuestions = 10;
        const availableMonths = data.months.filter(m => m.number !== null);
        let availableDays;
        if (practiceScope.dayMode === 'special') {
            availableDays = data.days.filter(d => d.spday);
        } else {
            availableDays = data.days.filter(d => d.number !== null);
        }

        for (let i = 0; i < numQuestions; i++) {
            let question;
            if (practiceScope.months && practiceScope.days) {
                let month, day;
                do {
                    month = availableMonths[Math.floor(Math.random() * availableMonths.length)];
                    day = availableDays[Math.floor(Math.random() * availableDays.length)];
                } while (!isValidDate(month.number, day.number));
                question = {
                    kanji: `${month.kanji}${day.kanji}`,
                    kana: `${month.kana}${day.kana}`
                };
            } else if (practiceScope.months) {
                const month = availableMonths[Math.floor(Math.random() * availableMonths.length)];
                question = { kanji: month.kanji, kana: month.kana };
            } else if (practiceScope.days) {
                const day = availableDays[Math.floor(Math.random() * availableDays.length)];
                question = { kanji: day.kanji, kana: day.kana };
            } else {
                // Should not happen because of the check in saveScopeBtn
                questions = [];
                return;
            }
            questions.push(question);
        }
    };

    const isValidDate = (month, day) => {
        if ([4, 6, 9, 11].includes(month) && day > 30) {
            return false;
        }
        if (month === 2 && day > 29) {
            return false;
        }
        return true;
    };

    const displayQuestion = () => {
        if (currentQuestionIndex < questions.length) {
            questionCounter.textContent = `第${currentQuestionIndex + 1}題 / 共10題`;
            kanjiDisplay.textContent = questions[currentQuestionIndex].kanji;
            statusBar.textContent = '';
            answerInput.value = '';
            submitBtn.classList.remove('hidden');
            nextBtn.classList.add('hidden');
            answerInput.focus();
        } else {
            showEndScreen();
        }
    };

    answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (!submitBtn.classList.contains('hidden')) {
                submitBtn.click();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            if (!nextBtn.classList.contains('hidden') && canGoNext) {
                nextBtn.click();
            }
        }
    });

    submitBtn.addEventListener('click', () => {
        canGoNext = false;
        const userAnswer = answerInput.value.trim();
        userAnswers.push(userAnswer);
        const correctAnswer = questions[currentQuestionIndex].kana;

        if (userAnswer === correctAnswer) {
            statusBar.textContent = '答對';
            statusBar.classList.remove('text-red-500');
            statusBar.classList.add('text-green-500');
            score++;
        } else {
            statusBar.innerHTML = `錯誤，正解為 <span class="font-bold">${correctAnswer}</span>`;
            statusBar.classList.remove('text-green-500');
            statusBar.classList.add('text-red-500');
        }

        submitBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        setTimeout(() => { canGoNext = true; }, 500);
    });

    nextBtn.addEventListener('click', () => {
        canGoNext = false;
        currentQuestionIndex++;
        displayQuestion();
    });

    earlyEndBtn.addEventListener('click', () => {
        showEndScreen();
    });

    const showEndScreen = () => {
        document.body.classList.remove('flex', 'items-center');
        showScreen('end');
        scoreDisplay.textContent = `您答對了 ${score} / ${questions.length} 題！`;
        renderReviewTable();
    };

    const renderReviewTable = () => {
        let tableHtml = `
            <div class="hidden md:grid md:grid-cols-4 gap-4 font-bold mb-2">
                <div>題目</div>
                <div>您的答案</div>
                <div>正解？</div>
                <div>正解說明</div>
            </div>
        `;

        for (let i = 0; i < currentQuestionIndex; i++) {
            const question = questions[i];
            const userAnswer = userAnswers[i];
            const isCorrect = userAnswer === question.kana;

            tableHtml += `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 border-b py-2">
                    <div class="md:hidden font-bold">題目</div>
                    <div>${question.kanji}</div>
                    <div class="md:hidden font-bold">您的答案</div>
                    <div class="${!isCorrect ? 'text-red-500' : ''}">${highlightMistakes(userAnswer, question.kana)}</div>
                    <div class="md:hidden font-bold">正解？</div>
                    <div>${isCorrect ? '✔️' : '❌'}</div>
                    <div class="md:hidden font-bold">正解說明</div>
                    <div>${!isCorrect ? question.kana : ''}</div>
                </div>
            `;
        }
        reviewTable.innerHTML = tableHtml;
    };

    const highlightMistakes = (userAnswer, correctAnswer) => {
        if (userAnswer === correctAnswer) return userAnswer;
        let result = '';
        for (let i = 0; i < userAnswer.length; i++) {
            if (i < correctAnswer.length && userAnswer[i] === correctAnswer[i]) {
                result += userAnswer[i];
            } else {
                result += `<span class="font-bold text-red-700">${userAnswer[i]}</span>`;
            }
        }
        return result;
    };

    restartBtn.addEventListener('click', () => {
        document.body.classList.add('flex', 'items-center');
        showScreen('start');
    });

    showScreen('start');
    updateScopeDisplay();
});
