import { shuffle } from "lodash";
import { useContext, useEffect, useState } from "react";
import { generateDeck } from "../../utils/cards";
import styles from "./Cards.module.css";
import { EndGameModal } from "../EndGameModal/EndGameModal";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { GameContext } from "../../contex/gameContext";

// Игра закончилась
const STATUS_LOST = "STATUS_LOST";
const STATUS_WON = "STATUS_WON";
// Идет игра: карты закрыты, игрок может их открыть
const STATUS_IN_PROGRESS = "STATUS_IN_PROGRESS";
// Начало игры: игрок видит все карты в течении нескольких секунд
const STATUS_PREVIEW = "STATUS_PREVIEW";

// Тут я думаю выставляется время 0 перед стартом игры и время затраченное на игру в итоге и фремя реальное в игре
function getTimerValue(startDate, endDate) {
  if (!startDate && !endDate) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }

  if (endDate === null) {
    endDate = new Date();
  }

  const diffInSecconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSecconds / 60);
  const seconds = diffInSecconds % 60;
  return {
    minutes,
    seconds,
  };
}

/**
 * Основной компонент игры, внутри него находится вся игровая механика и логика.
 * pairsCount - сколько пар будет в игре
 * previewSeconds - сколько секунд пользователь будет видеть все карты открытыми до начала игры
 */
export function Cards({ pairsCount = 3, previewSeconds = 5 }) {
  const { gameMode } = useContext(GameContext);
  const [lives, setLives] = useState(gameMode ? 3 : 1);

  // В cards лежит игровое поле - массив карт и их состояние открыта\закрыта
  const [cards, setCards] = useState([]);
  // Текущий статус игры
  const [status, setStatus] = useState(STATUS_PREVIEW);

  // Дата начала игры
  const [gameStartDate, setGameStartDate] = useState(null);
  // Дата конца игры
  const [gameEndDate, setGameEndDate] = useState(null);

  // Стейт для таймера, высчитывается в setInteval на основе gameStartDate и gameEndDate
  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
  });

  function finishGame(status = STATUS_LOST) {
    setGameEndDate(new Date());
    setStatus(status);
  }
  function startGame() {
    const startDate = new Date();
    setLives(3);
    setGameEndDate(null);
    setGameStartDate(startDate);
    setTimer(getTimerValue(startDate, null));
    setStatus(STATUS_IN_PROGRESS);
  }
  function resetGame() {
    setLives(3);
    setGameStartDate(null);
    setGameEndDate(null);
    setTimer(getTimerValue(null, null));
    setStatus(STATUS_PREVIEW);
  }

  /**
   * Обработка основного действия в игре - открытие карты.
   * После открытия карты игра может пепереходит в следующие состояния
   * - "Игрок выиграл", если на поле открыты все карты
   * - "Игрок проиграл", если на поле есть две открытые карты без пары
   * - "Игра продолжается", если не случилось первых двух условий
   */
  const openCard = clickedCard => {
    // Если карта уже открыта, то ничего не делаем
    if (clickedCard.open) {
      return;
    }
    // Игровое поле после открытия кликнутой карты
    // Если кликаем по карте с другим ID, то открываем кликнутую карту
    const nextCards = cards.map(card => {
      console.log(card.id);
      if (card.id !== clickedCard.id) {
        return card;
      }
      //  меняю значение свойства объекта card (открытой карты) на тру
      return {
        ...card,
        open: true,
      };
    });

    setCards(nextCards);
    // Проверяю что все карты открыты (метод every смотрит все ли карты в массиве открыты)
    const isPlayerWon = nextCards.every(card => card.open);

    // Победа - все карты на поле открыты
    if (isPlayerWon) {
      finishGame(STATUS_WON);
      return;
    }

    // Открытые карты на игровом поле
    // Кладу в переменную кликнутую открытую карту найденную в массиве карт на поле
    const openCards = nextCards.filter(card => card.open);

    // Ищем открытые карты, у которых нет пары среди других открытых
    // Кладу в переменную то что нашел в массиве открытых карт на поле. По условию что в открытых картах есть карта без пары
    const openCardsWithoutPair = openCards.filter(card => {
      const sameCards = openCards.filter(openCard => card.suit === openCard.suit && card.rank === openCard.rank);
      console.log(sameCards);
      return sameCards.length < 2;
    });
    // кладу в переменную найденные 2-е открытые карты без пары
    const playerLost = openCardsWithoutPair.length >= 2;

    // "Игрок проиграл", т.к на поле есть две открытые карты без пары
    // Если есть 2 карты без пары и режим игры 3 попытки отключет - то игру заканчикаем - игрок програл. Иначе с включенным режимом "3 попытки" уменьшаем на 1 попытку
    if (playerLost) {
      if (!gameMode) {
        finishGame(STATUS_LOST);
        return;
      }
      setLives(lives - 1);
      // Если есть совпадение кликнутой карты с картой из массива открытых карт без ПАРЫЫЫЫЫ
      nextCards.map(el => {
        if (openCardsWithoutPair.some(openCard => openCard.id === el.id)) {
          setTimeout(() => {
            setCards(prev => {
              // не догоняю пока почемй тут open: false. Я же кликнул карту ID который совпадает с картой без пары из массива открытых карт
              return prev.map(card => (el.id === card.id ? { ...card, open: false } : card));
            });
          }, 500);
        }
      });
    }

    // ... игра продолжается
  };

  //  Тут чтото происходит.. кладу в переменную или такой или такой статус
  const isGameEnded = status === STATUS_LOST || status === STATUS_WON;

  // жизней 0 в режиме 3 попытки?  - конец игры
  useEffect(() => {
    if (lives === 0) {
      finishGame(STATUS_LOST);
    }
  }, [lives]);

  // Игровой цикл !ё!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  useEffect(() => {
    // В статусах кроме превью доп логики не требуется
    //  ТУт если статус не превью (все карты НЕ открыты) то ретерн
    if (status !== STATUS_PREVIEW) {
      return;
    }

    // В статусе превью мы
    // Это когда такой алерт выскочит??? если пк окроет сколько карт в какой игре?
    if (pairsCount > 36) {
      alert("Столько пар сделать невозможно");
      return;
    }

    // мешаю карты для 10 пар
    setCards(() => {
      return shuffle(generateDeck(pairsCount, 10));
    });

    // показываю карты на 50 сек
    const timerId = setTimeout(() => {
      startGame();
    }, previewSeconds * 500);
    // чищу таймер
    return () => {
      clearTimeout(timerId);
    };
  }, [status, pairsCount, previewSeconds]);

  // Обновляем значение таймера в интервале
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(getTimerValue(gameStartDate, gameEndDate));
    }, 300);
    return () => {
      clearInterval(intervalId);
    };
  }, [gameStartDate, gameEndDate]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.timer}>
          {status === STATUS_PREVIEW ? (
            <div>
              <p className={styles.previewText}>Запоминайте пары!</p>
              <p className={styles.previewDescription}>Игра начнется через {previewSeconds} секунд</p>
            </div>
          ) : (
            <>
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>min</div>
                <div>{timer.minutes.toString().padStart("2", "0")}</div>
              </div>
              .
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>sec</div>
                <div>{timer.seconds.toString().padStart("2", "0")}</div>
              </div>
            </>
          )}
        </div>
        {status === STATUS_IN_PROGRESS ? <Button onClick={resetGame}>Начать заново</Button> : null}
      </div>

      <div className={styles.cards}>
        {cards.map(card => (
          <Card
            key={card.id}
            onClick={() => openCard(card)}
            open={status !== STATUS_IN_PROGRESS ? true : card.open}
            suit={card.suit}
            rank={card.rank}
          />
        ))}
      </div>

      {gameMode && <p className={styles.liveSpan}>Осталось попыток: {lives}</p>}

      {isGameEnded ? (
        <div className={styles.modalContainer}>
          <EndGameModal
            isWon={status === STATUS_WON}
            gameDurationSeconds={timer.seconds}
            gameDurationMinutes={timer.minutes}
            onClick={resetGame}
          />
        </div>
      ) : null}
    </div>
  );
}
