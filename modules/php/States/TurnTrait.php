<?php
namespace FORD\States;
use FORD\Game\Globals;
use FORD\Game\Notifications;
use FORD\Game\Log;
use FORD\Board;

trait TurnTrait
{
  /*
   * startOfTurn : compute the order in which players gonna play this turn
   */
  public function stStartOfTurn()
  {
    Globals::startNewTurn();

    // Compute order of play
    $order = Board::getPlayersOrder();
    Notifications::startNewTurn($order);
    Log::saveTurnOrder($order);

    // Make the first player active
    $firstPlayer = array_shift($order);
    $this->gamestate->changeActivePlayer($firstPlayer);
    $this->gamestate->nextState('');
  }


  public function argChooseSpeed()
  {
    return [];
  }



  public function stEndOfTurn()
  {
    // TODO : make it more robust if other players can become active during a player turn
    $currentPlayer = $this->gamestate->getActivePlayerId();
    $order = Log::getTurnOrder();
    $index = array_search($currentPlayer, $order);

    if($index < count($order) - 1){
      // Next player
      $pId = $order[$index + 1];
      $this->gamestate->changeActivePlayer($pId);
      $this->gamestate->nextState('nextPlayer');
    } else {
      // End of turn
      $this->gamestate->nextState('nextTurn');
    }
  }
}
?>
