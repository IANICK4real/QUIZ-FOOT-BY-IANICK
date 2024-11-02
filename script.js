let currentQuestionIndex = 0;
let timeLeft;
let timerInterval;
let score = 0;
let playerName = "";
let disqualificationActive = false;
let isDisqualified = false;
let scoreboard = JSON.parse(localStorage.getItem("scoreboard")) || [];

// Tableau des questions
const questions = [
  { question: "Quel est le nom du stade principal de l'équipe nationale de France ?", answer: "stade de france", points: 3 },
  { question: "Quel pays a organisé la Coupe du Monde de la FIFA en 2010 ?", answer: "afrique du sud", points: 3 },
  { question: "Dans quelle ville se trouve le stade mythique de Wembley ?", answer: "londres", points: 3 },
  { question: "Quel pays a remporté la Coupe d'Afrique des Nations en 2019 ?", answer: "algérie", points: 3 },
  { question: "Qui a marqué le but décisif lors de la finale de la CAN 2017 ?", answer: "vincent aboubakar", points: 3 },
];

// Fonction pour démarrer le quiz
function startQuiz() {
  playerName = document.getElementById("playerName").value.trim();
  if (playerName === "") {
    alert("Veuillez entrer votre nom pour commencer le quiz.");
    return;
  }

  document.getElementById("name-entry").style.display = "none";
  document.getElementById("quiz").style.display = "block";
  document.getElementById("disqualificationMessage").style.display = "none";
  isDisqualified = false;
  addParticipant(playerName);
  showQuestion();
}

// Fonction pour ajouter le participant dans le tableau des scores
function addParticipant(name) {
  const participant = { name: name, score: 0, status: "En cours" };
  scoreboard.push(participant);
  localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
  updateScoreboard();
}

// Fonction pour afficher/masquer la section Admin
function toggleAdminSection() {
  const adminSection = document.getElementById("admin-section");
  adminSection.style.display = adminSection.style.display === "none" ? "block" : "none";
}

// Fonction pour afficher le contenu Admin après vérification des identifiants
function showAdminContent() {
  const adminID = document.getElementById("adminID").value;
  const adminPassword = document.getElementById("adminPassword").value;

  if (adminID === "yanick" && adminPassword === "2001") {
    document.getElementById("scoreboard-container").style.display = "block";
    updateScoreboard(); // Affiche immédiatement la liste des participants avec leurs scores et statuts
  } else {
    alert("Identifiant ou mot de passe incorrect.");
  }
}

// Fonction pour gérer la disqualification si le joueur change de fenêtre/onglet
function handleVisibilityChange() {
  if (document.hidden && disqualificationActive) {
    disqualifyParticipant();
  }
}

// Fonction pour disqualifier un participant et afficher un message
function disqualifyParticipant() {
  isDisqualified = true;
  disqualificationActive = false;
  const participant = scoreboard.find(participant => participant.name === playerName);
  if (participant) {
    participant.status = "Disqualifié";
    participant.score = score; // Conserve le score actuel même en cas de disqualification
    localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
    updateScoreboard();
  }
  document.getElementById("disqualificationMessage").textContent = "Vous avez été disqualifié pour avoir quitté la page pendant le temps de réponse.";
  document.getElementById("disqualificationMessage").style.display = "block";
  resetQuiz();
}

// Fonction pour gérer l'abandon lors de l'actualisation de la page
window.addEventListener("beforeunload", (event) => {
  if (playerName && !isDisqualified && currentQuestionIndex < questions.length) {
    const participant = scoreboard.find(participant => participant.name === playerName);
    if (participant) {
      participant.status = "Abandon";
      participant.score = score; // Conserve le score actuel même en cas d'abandon
      localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
    }
    updateScoreboard();
    event.returnValue = ""; // Affiche un message de confirmation avant de quitter
  }
});

// Fonction pour afficher la question actuelle
function showQuestion() {
  if (isDisqualified) return;

  if (currentQuestionIndex < questions.length) {
    const currentQuestion = questions[currentQuestionIndex];
    document.getElementById("question").textContent = currentQuestion.question;
    document.getElementById("answer").value = "";
    startTimer(15);
  } else {
    endQuiz();
  }
}

// Fonction de démarrage du chronomètre de réponse
function startTimer(duration) {
  timeLeft = duration;
  disqualificationActive = true;
  document.getElementById("time").textContent = timeLeft;
  timerInterval = setInterval(updateTimer, 1000);
}

// Fonction pour mettre à jour le chronomètre
function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
  } else {
    clearInterval(timerInterval);
    submitAnswer();
  }
}

// Fonction pour soumettre la réponse
function submitAnswer() {
  clearInterval(timerInterval);
  const answer = document.getElementById("answer").value.trim().toLowerCase();
  const currentQuestion = questions[currentQuestionIndex];

  if (answer === currentQuestion.answer.toLowerCase() && !isDisqualified) {
    score += currentQuestion.points;
  }

  updateParticipantScore(playerName, score);
  currentQuestionIndex++;
  disqualificationActive = false;
  startWaitPeriod(getWaitTime(currentQuestionIndex));
  showConfirmationMessage();
}

// Fonction pour calculer le temps d'attente entre les questions
function getWaitTime(questionIndex) {
  if (questionIndex < 5) return 60;
  if (questionIndex < 10) return 90;
  if (questionIndex < 15) return 120;
  return 180;
}

// Fonction pour afficher le temps d'attente avant la question suivante
function startWaitPeriod(waitTime) {
  let waitTimeLeft = waitTime;
  document.getElementById("nextQuestionTimer").textContent = `Prochaine question dans : ${waitTimeLeft} secondes`;
  document.getElementById("nextQuestionTimer").style.display = "block";
  const waitInterval = setInterval(() => {
    waitTimeLeft--;
    document.getElementById("nextQuestionTimer").textContent = `Prochaine question dans : ${waitTimeLeft} secondes`;
    if (waitTimeLeft <= 0) {
      clearInterval(waitInterval);
      document.getElementById("nextQuestionTimer").style.display = "none";
      showQuestion();
    }
  }, 1000);
}

// Fonction de réinitialisation du quiz
function resetQuiz() {
  document.getElementById("name-entry").style.display = "block";
  document.getElementById("quiz").style.display = "none";
  currentQuestionIndex = 0;
  score = 0;
}

// Fonction de mise à jour du score pour le participant
function updateParticipantScore(name, updatedScore) {
  const participant = scoreboard.find(participant => participant.name === name);
  if (participant) {
    participant.score = updatedScore;
    localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
    updateScoreboard();
  }
}

// Fonction de fin du quiz
function endQuiz() {
  document.getElementById("quiz").style.display = "none";
  alert(`Quiz terminé ! Score final de ${playerName}: ${score}`);
  const participant = scoreboard.find(participant => participant.name === playerName);
  if (participant && !isDisqualified) {
    participant.status = "Terminé";
    participant.score = score;
    localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
    updateScoreboard();
  }
}

// Fonction pour afficher le tableau des scores
function updateScoreboard() {
  const scoreboardTable = document.getElementById("scoreboard");
  scoreboardTable.innerHTML = "";
  scoreboard.forEach(participant => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${participant.name}</td><td>${participant.score}</td><td>${participant.status}</td>`;
    scoreboardTable.appendChild(row);
  });
}

// Fonction pour effacer le tableau des scores
function clearScoreboard() {
  scoreboard = [];
  localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
  updateScoreboard();
}

// Écouteur d'événement pour détecter le changement de visibilité de la page
document.addEventListener("visibilitychange", handleVisibilityChange);
// Fonction pour afficher le message de confirmation de réponse
function showConfirmationMessage() {
    const confirmationMessage = document.getElementById("confirmationMessage");
    confirmationMessage.style.display = "block";
    confirmationMessage.style.animation = "fadeInOut 2s ease-in-out";
  
    // Masquer le message après 2 secondes
    setTimeout(() => {
      confirmationMessage.style.display = "none";
    }, 2000);
  }
  