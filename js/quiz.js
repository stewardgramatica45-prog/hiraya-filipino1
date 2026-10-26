document.addEventListener("DOMContentLoaded", () => {
  const banks = window.HIRAYA_QUIZ_BANKS;
  const termButtons = [...document.querySelectorAll("[data-quiz-term]")];
  const description = document.querySelector("#quizTermDescription");
  const progressText = document.querySelector("#quizProgressText");
  const answeredText = document.querySelector("#quizAnsweredText");
  const progressTrack = document.querySelector(".quiz-progress-track");
  const progressBar = document.querySelector("#quizProgressBar");
  const questionNumber = document.querySelector("#quizQuestionNumber");
  const topicLabel = document.querySelector("#quizTopicLabel");
  const questionHeading = document.querySelector("#quizQuestion");
  const optionsContainer = document.querySelector("#quizOptions");
  const feedback = document.querySelector("#quizFeedback");
  const previous = document.querySelector("#quizPrevious");
  const next = document.querySelector("#quizNext");
  const questionArea = document.querySelector("#quizQuestionArea");
  const results = document.querySelector("#quizResults");
  const resultHeading = document.querySelector("#quizResultHeading");
  const resultCopy = document.querySelector("#quizResultCopy");
  const score = document.querySelector("#quizScore");
  const scorePercent = document.querySelector("#quizScorePercent");
  const review = document.querySelector("#quizReview");
  const retry = document.querySelector("#quizRetry");

  if (!banks || !termButtons.length || !questionHeading || !optionsContainer) {
    console.error("Hindi ma-load ang quiz. Tiyaking naka-load ang quiz-data.js bago ang quiz.js.");
    return;
  }

  const answers = new Map();
  let activeTerm = "prelim";
  let activeIndex = 0;

  const shuffle = (items) => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };

  const renderQuestion = () => {
    const bank = banks[activeTerm];
    const question = bank.questions[activeIndex];
    const selectedAnswer = answers.get(activeIndex);
    const answeredCount = answers.size;

    description.textContent = bank.description;
    progressText.textContent = `Tanong ${activeIndex + 1} sa ${bank.questions.length}`;
    answeredText.textContent = `${answeredCount} nasagutan`;
    progressTrack.setAttribute("aria-valuemax", String(bank.questions.length));
    progressTrack.setAttribute("aria-valuenow", String(activeIndex + 1));
    progressBar.style.width = `${((activeIndex + 1) / bank.questions.length) * 100}%`;
    questionNumber.textContent = `TANONG ${String(activeIndex + 1).padStart(2, "0")}`;
    topicLabel.textContent = bank.title.toUpperCase();
    questionHeading.textContent = question.prompt;
    feedback.textContent = "";
    feedback.classList.remove("is-correct", "is-incorrect");
    optionsContainer.replaceChildren();

    shuffle(question.choices).forEach((choice, choiceIndex) => {
      const button = document.createElement("button");
      button.className = "quiz-choice";
      button.type = "button";
      button.textContent = choice;
      button.setAttribute("aria-pressed", String(choice === selectedAnswer));
      if (choice === selectedAnswer) button.classList.add("is-selected");
      button.addEventListener("click", () => {
        answers.set(activeIndex, choice);
        [...optionsContainer.children].forEach((option) => {
          const isSelected = option.textContent === choice;
          option.classList.toggle("is-selected", isSelected);
          option.setAttribute("aria-pressed", String(isSelected));
        });
        feedback.textContent = "";
        feedback.classList.remove("is-correct", "is-incorrect");
        answeredText.textContent = `${answers.size} nasagutan`;
        next.textContent = activeIndex === bank.questions.length - 1
          ? "Tingnan ang resulta →"
          : "Susunod na tanong →";
      });
      optionsContainer.append(button);
    });

    previous.disabled = activeIndex === 0;
    next.textContent = activeIndex === bank.questions.length - 1
      ? "Tingnan ang resulta →"
      : selectedAnswer ? "Susunod na tanong →" : "Sagutin at magpatuloy →";
  };

  const renderResults = () => {
    const bank = banks[activeTerm];
    const incorrect = bank.questions
      .map((question, index) => ({ question, answer: answers.get(index) }))
      .filter((item) => item.answer !== item.question.answer);
    const correctCount = bank.questions.length - incorrect.length;
    const percentage = Math.round((correctCount / bank.questions.length) * 100);

    questionArea.hidden = true;
    results.hidden = false;
    resultHeading.textContent = `${bank.title} na pagsusulit`;
    resultCopy.textContent = `Nasagutan mo ang lahat ng ${bank.questions.length} tanong.`;
    score.textContent = `${correctCount} / ${bank.questions.length}`;
    scorePercent.textContent = `${percentage}%`;
    review.replaceChildren();

    if (incorrect.length) {
      const title = document.createElement("h4");
      title.textContent = `Balikan ang ${incorrect.length} tanong`;
      review.append(title);

      incorrect.forEach(({ question, answer }, index) => {
        const item = document.createElement("article");
        item.className = "quiz-review-item";
        const prompt = document.createElement("h5");
        prompt.textContent = `${index + 1}. ${question.prompt}`;
        const yourAnswer = document.createElement("p");
        yourAnswer.className = "quiz-review-wrong";
        yourAnswer.textContent = `Sagot mo: ${answer}`;
        const correctAnswer = document.createElement("p");
        correctAnswer.className = "quiz-review-right";
        correctAnswer.textContent = `Tamang sagot: ${question.answer}`;
        item.append(prompt, yourAnswer, correctAnswer);
        review.append(item);
      });
    } else {
      const perfect = document.createElement("p");
      perfect.className = "quiz-perfect";
      perfect.textContent = "Perpekto! Nasagot mo nang tama ang lahat ng tanong.";
      review.append(perfect);
    }
  };

  termButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const term = button.dataset.quizTerm;
      if (!banks[term] || banks[term].questions.length !== 50) {
        console.error(`Hindi available ang 50 tanong para sa ${term}.`);
        return;
      }
      activeTerm = term;
      activeIndex = 0;
      answers.clear();
      questionArea.hidden = false;
      results.hidden = true;
      termButtons.forEach((termButton) => {
        const isSelected = termButton === button;
        termButton.classList.toggle("is-selected", isSelected);
        termButton.setAttribute("aria-pressed", String(isSelected));
      });
      renderQuestion();
    });
  });

  previous.addEventListener("click", () => {
    if (activeIndex === 0) return;
    activeIndex -= 1;
    renderQuestion();
  });

  next.addEventListener("click", () => {
    if (!answers.has(activeIndex)) {
      feedback.textContent = "Pumili muna ng sagot bago magpatuloy.";
      feedback.classList.remove("is-correct", "is-incorrect");
      return;
    }
    if (activeIndex === banks[activeTerm].questions.length - 1) {
      renderResults();
      return;
    }
    activeIndex += 1;
    renderQuestion();
    questionHeading.focus();
  });

  retry.addEventListener("click", () => {
    activeIndex = 0;
    answers.clear();
    questionArea.hidden = false;
    results.hidden = true;
    renderQuestion();
    questionHeading.focus();
  });

  termButtons.forEach((button) => {
    if (button.dataset.quizTerm === "finals" && banks.finals.questions.length !== 50) {
      console.error("Ang cumulative Finals quiz ay kailangang may 50 tanong.");
    }
  });

  renderQuestion();
});
