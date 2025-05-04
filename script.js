const coinElement = document.getElementById("coin");
const rockButton = document.getElementById("rock");
const scissorsButton = document.getElementById("scissors");
const paperButton = document.getElementById("paper");
const resultElement = document.getElementById("result");
const jankenTextElement = document.getElementById("jankenText");
const startButton = document.getElementById("startButton");
const jankenVoice = document.querySelectorAll("#jankenVoice")[0];
const coinSe = document.querySelectorAll("#coinSe")[0];

let gameStarted = false;
const drawVoice = document.querySelectorAll("#drawVoice")[0];
const rouletteCanvas = document.getElementById("rouletteCanvas");
const rouletteCtx = rouletteCanvas.getContext("2d");

let coin = 20;
let rouletteValues = [4, 1, 2, 7, 4, 2, 20, 1, 2, 4, 7, 2];
let rouletteValue = 3;
coinElement.textContent = coin;

let stoppedIndex = null; // ルーレット停止後のインデックスを保持
function drawRoulette(currentAngle) {
  rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
  const anglePerSlice = (Math.PI * 2) / rouletteValues.length;

  for (let i = 0; i < rouletteValues.length; i++) {
    const startAngle = anglePerSlice * i;
    const endAngle = anglePerSlice * (i + 1);
    const x = Math.cos(startAngle + anglePerSlice / 2) * 120 + 150;
    const y = Math.sin(startAngle + anglePerSlice / 2) * 120 + 150;

    // **回転中も黄色を適用するよう修正**
    const isSelected =
      (stoppedIndex !== null && i === stoppedIndex) ||
      (stoppedIndex === null &&
        Math.floor((currentAngle % (Math.PI * 2)) / anglePerSlice) === i);

    rouletteCtx.beginPath();
    rouletteCtx.arc(150, 150, 120, startAngle, endAngle);
    rouletteCtx.lineTo(150, 150);
    rouletteCtx.fillStyle = isSelected ? "#ff0" : i % 2 === 0 ? "#eee" : "#fff";
    rouletteCtx.fill();
    rouletteCtx.closePath();

    rouletteCtx.font = "20px sans-serif";
    rouletteCtx.textAlign = "center";
    rouletteCtx.textBaseline = "middle";
    rouletteCtx.fillStyle = "#000";
    rouletteCtx.fillText(rouletteValues[i], x, y);
  }
}

window.onload = function () {
  drawRoulette(0);
  resultElement.textContent = "スタートをおしてね！";
};

function janken(userHand) {
  const cpuHand = Math.floor(Math.random() * 3); // 0: グー, 1: チョキ, 2: パー
  const hands = ["グー", "チョキ", "パー"];
  jankenTextElement.textContent = "ぽん! (" + hands[cpuHand] + "をだした）";
  let result = "";
  if (userHand === cpuHand) {
    result = "あいこ！";
    const drawVoice = document.getElementById("drawVoice");
    drawVoice.volume = 0.5; // 音量調整（0.0〜1.0）
    drawVoice.play().catch((error) => {
      console.warn("自動再生がブロックされました:", error);
    });
  } else if (
    (userHand === 0 && cpuHand === 1) ||
    (userHand === 1 && cpuHand === 2) ||
    (userHand === 2 && cpuHand === 0)
  ) {
    result = "勝ち！";
    const winVoice = document.getElementById("winVoice");
    winVoice.volume = 0.5; // 音量調整（0.0〜1.0）
    winVoice.play().catch((error) => {
      console.warn("自動再生がブロックされました:", error);
    });
    spinRoulette();
  } else {
    result = "負け！（スタートをおしてね！）";
    startButton.disabled = false;
    rockButton.disabled = true;
    scissorsButton.disabled = true;
    paperButton.disabled = true;
    coin--;
    coinElement.textContent = coin;
    if (coin <= 0) {
      result = "ゲームオーバー！";
      rockButton.disabled = true;
      scissorsButton.disabled = true;
      paperButton.disabled = true;
      startButton.disabled = false;
    }
  }

  resultElement.textContent = `${result}`;
}

function spinRoulette() {
  let initAngle = Math.random() * Math.PI * 2; // **ランダムな初期角度**
  let animationDuration = 5000; // 5 seconds
  const startTime = Date.now();

  // **前回の停止位置をリセット**
  stoppedIndex = null;

  rockButton.disabled = true;
  scissorsButton.disabled = true;
  paperButton.disabled = true;

  function animate() {
    const now = Date.now();
    const elapsedTime = now - startTime;
    const currentAngle =
      initAngle + (elapsedTime / animationDuration) * Math.PI * 6; // **ランダム性を強調**

    drawRoulette(currentAngle);

    if (elapsedTime < animationDuration) {
      requestAnimationFrame(animate);
    } else {
      startButton.disabled = false;

      // **ルーレット停止位置の計算**
      const anglePerSlice = (Math.PI * 2) / rouletteValues.length;
      stoppedIndex = Math.floor((currentAngle % (Math.PI * 2)) / anglePerSlice);
      const selectedValue = rouletteValues[stoppedIndex];

      coin += selectedValue;
      coinElement.textContent = coin;
      resultElement.textContent =
        "コインを " + selectedValue + "まいゲット！（スタートをおしてね！）";

      // **コインが増える枚数だけ coinSe を鳴らす**
      function playCoinSound(times) {
        if (times > 0) {
          coinSe.play().catch((error) => console.warn("再生エラー:", error));
        }
      }

      playCoinSound(selectedValue);

      // **停止後に黄色を適用して再描画**
      drawRoulette(currentAngle);

      if (coin >= 1000) {
        resultElement.textContent = "ゲームクリア！";
        rockButton.disabled = true;
        scissorsButton.disabled = true;
        paperButton.disabled = true;
      }
    }
  }

  animate();
}

rockButton.addEventListener("click", () => {
  if (gameStarted) {
    janken(0);
  }
});

scissorsButton.addEventListener("click", () => {
  if (gameStarted) {
    janken(1);
  }
});

paperButton.addEventListener("click", () => {
  if (gameStarted) {
    janken(2);
  }
});

startButton.addEventListener("click", () => {
  jankenTextElement.textContent = "じゃんけん・・・";
  startButton.disabled = true;
  resultElement.textContent = "";
  const jankenVoice = document.getElementById("jankenVoice");
  jankenVoice.volume = 0.5; // 音量調整（0.0〜1.0）
  jankenVoice.play().catch((error) => {
    console.warn("自動再生がブロックされました:", error);
  });

  if (!gameStarted) {
    gameStarted = true;

    document.getElementById("janken").style.display = "block";

    const bgm = document.getElementById("bgm");
    bgm.volume = 0.1; // 音量調整（0.0〜1.0）
    bgm.play().catch((error) => {
      console.warn("自動再生がブロックされました:", error);
    });
  } else {
    rockButton.disabled = false;
    scissorsButton.disabled = false;
    paperButton.disabled = false;
  }
});
