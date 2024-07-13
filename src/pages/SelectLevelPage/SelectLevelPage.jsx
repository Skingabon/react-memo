import { Link } from "react-router-dom";
import styles from "./SelectLevelPage.module.css";
import { useContext } from "react";
import { GameContext } from "../../contex/gameContext";

export function SelectLevelPage() {
  const { handleGameMode } = useContext(GameContext);

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <h1 className={styles.title}>
          Режим "3 ошибки" <input type="checkbox" onClick={handleGameMode} />
        </h1>

        <h1 className={styles.title}>Выбери сложность</h1>
        <ul className={styles.levels}>
          <li className={styles.level}>
            <Link className={styles.levelLink} to="/game/3">
              1
            </Link>
          </li>
          <li className={styles.level}>
            <Link className={styles.levelLink} to="/game/6">
              2
            </Link>
          </li>
          <li className={styles.level}>
            <Link className={styles.levelLink} to="/game/9">
              3
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
