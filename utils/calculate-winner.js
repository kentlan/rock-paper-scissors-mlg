const calculateWinner = (moves, userId, opponentId) => {
  // 0 represents rock, 1 represents paper and 2 respresents scissors

  const truthTable = [[0, 0, 1], [1, 0, 0], [0, 1, 0]]

  const userMove = moves[userId]
  const opponentMove = moves[opponentId]

  const userScore = truthTable[userMove][opponentMove]
  const opponentScore = truthTable[opponentMove][userMove]

  if (userScore > opponentScore) {
    return {winnerId: userId, message: 'U WON LOL'}
  } else if (opponentScore > userScore) {
    return {winnerId: opponentId, message: 'U LOST, GTFO'}
  }
  return {winnerId: null, message: 'DIBILY SK'}
}

export default calculateWinner
