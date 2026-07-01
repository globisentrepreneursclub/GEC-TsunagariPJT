// 診断ロジック - Founder Quest

/**
 * 回答からパラメータスコアを計算する
 * @param {Array} answers - 回答配列 [{questionId, value, parameter, type}]
 * @returns {Object} パラメータスコア
 */
function calculateParameterScores(answers) {
  const scores = {
    VISION: 0,
    ACTION: 0,
    EMPATHY: 0,
    ANALYSIS: 0,
    CREATIVE: 0,
    RISK: 0,
    TEAM: 0,
    PERSIST: 0
  };

  for (const answer of answers) {
    const { type, parameter, value } = answer;

    if (type === 'scale' && parameter) {
      // 5段階評価: 1〜5点をそのまま加算
      const score = parseInt(value);
      if (!isNaN(score) && score >= 1 && score <= 5) {
        scores[parameter] += score;
      }
    } else if (type === 'scenario' && parameter) {
      // シナリオ選択: 対応パラメータに+2点
      scores[parameter] += 2;
    } else if (type === 'value' && parameter) {
      // 価値観選択: 対応パラメータに+3点
      scores[parameter] += 3;
    }
    // free_text はスコア対象外
  }

  return scores;
}

/**
 * パラメータスコアから各キャラの判定スコアを計算する
 * @param {Object} scores - パラメータスコア
 * @returns {Object} キャラクタースコア {characterId: score}
 */
function calculateCharacterScores(scores) {
  const { VISION, ACTION, EMPATHY, ANALYSIS, CREATIVE, RISK, TEAM, PERSIST } = scores;

  return {
    hero:       VISION * 1.5 + TEAM * 1.0 + RISK * 0.8,
    warrior:    ACTION * 1.5 + PERSIST * 1.0 + RISK * 0.8,
    monk:       EMPATHY * 1.5 + PERSIST * 1.0 + TEAM * 0.8,
    mage:       CREATIVE * 1.5 + VISION * 1.0 + ANALYSIS * 0.8,
    thief:      RISK * 1.5 + CREATIVE * 1.0 + ACTION * 0.8,
    merchant:   ANALYSIS * 1.5 + EMPATHY * 1.0 + PERSIST * 0.8,
    strategist: ANALYSIS * 1.5 + VISION * 1.0 + TEAM * 0.8,
    summoner:   TEAM * 1.5 + EMPATHY * 1.0 + VISION * 0.8
  };
}

/**
 * キャラクタースコアからメイン・サブタイプを判定する
 * @param {Object} characterScores - キャラクタースコア
 * @returns {Object} {mainCharacter, subCharacter, isHybrid}
 */
function determineCharacter(characterScores) {
  // スコアでソート（降順）
  const sorted = Object.entries(characterScores)
    .sort((a, b) => b[1] - a[1]);

  const [mainId, mainScore] = sorted[0];
  const [subId, subScore] = sorted[1];

  const diff = mainScore - subScore;
  const isHybrid = diff <= 3;

  return {
    mainCharacter: mainId,
    subCharacter: subId,
    isHybrid,
    mainScore,
    subScore,
    sortedCharacters: sorted
  };
}

/**
 * 全診断処理をまとめて行う
 * @param {Array} answers - 回答配列
 * @returns {Object} 診断結果
 */
function runDiagnosis(answers) {
  const parameterScores = calculateParameterScores(answers);
  const characterScores = calculateCharacterScores(parameterScores);
  const result = determineCharacter(characterScores);

  return {
    parameterScores,
    characterScores,
    ...result,
    createdAt: new Date().toISOString()
  };
}

/**
 * パラメータスコアを最大値に対するパーセンテージに変換する
 * @param {Object} scores - パラメータスコア
 * @returns {Object} パーセンテージ {param: percentage}
 */
function normalizeScores(scores) {
  const maxPossibleScores = {
    VISION: 3 * 5 + 2 + 3,    // Q1-3(scale) + Q26/Q31(scenario) + Q33/Q34/Q36(value)
    ACTION: 3 * 5 + 2 + 3,
    EMPATHY: 3 * 5 + 2 + 3,
    ANALYSIS: 3 * 5 + 2 + 3,
    CREATIVE: 3 * 5 + 2 + 3,
    RISK: 3 * 5 + 2 + 3,
    TEAM: 3 * 5 + 2 + 3,
    PERSIST: 3 * 5 + 2 + 3
  };

  const result = {};
  for (const [key, value] of Object.entries(scores)) {
    result[key] = Math.min(100, Math.round((value / 25) * 100));
  }
  return result;
}
