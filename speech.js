const expectedText = "Привет как дела"; // Измени на нужную фразу

// Создаём элемент для вывода результата
const resultEl = document.createElement('div');
resultEl.style.fontSize = '24px';
resultEl.style.marginTop = '20px';
document.body.appendChild(resultEl);

// Инициализация распознавания речи
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'ru-RU';
recognition.interimResults = false;
recognition.continuous = true;

// Срабатывает, когда есть результат
recognition.onresult = (event) => {
  const spokenText = event.results[event.results.length - 1][0].transcript.trim();
  const spokenWords = spokenText.split(' ');
  const expectedWords = expectedText.split(' ');
  
  let html = '';
  for (let i = 0; i < spokenWords.length; i++) {
    const word = spokenWords[i];
    const isCorrect = expectedWords[i] === word;
    html += `<span style="color: ${isCorrect ? 'black' : 'red'}">${word} </span>`;
  }
  
  resultEl.innerHTML = html;
};

// Ошибки
recognition.onerror = (e) => {
  console.error('Ошибка распознавания речи:', e.error);
};

// Запуск
recognition.start();

// Создаём элемент для вывода результата
const resultEl = document.createElement('div');
resultEl.style.fontSize = '24px';
resultEl.style.marginTop = '20px';
document.body.appendChild(resultEl);

// Инициализация распознавания речи
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'ru-RU';
recognition.interimResults = false;
recognition.continuous = true;

// Срабатывает, когда есть результат
recognition.onresult = (event) => {
  const spokenText = event.results[event.results.length - 1][0].transcript.trim();
  const spokenWords = spokenText.split(' ');
  const expectedWords = expectedText.split(' ');

  let html = '';
  for (let i = 0; i < spokenWords.length; i++) {
    const word = spokenWords[i];
    const isCorrect = expectedWords[i] === word;
    html += `<span style="color: ${isCorrect ? 'black' : 'red'}">${word} </span>`;
  }

  resultEl.innerHTML = html;
};

// Ошибки
recognition.onerror = (e) => {
  console.error('Ошибка распознавания речи:', e.error);
};

// Запуск
recognition.start();