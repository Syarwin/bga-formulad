<?php
namespace FORD\States;
use FORD\Game\Globals;
use FORD\Game\Notifications;
use FORD\Game\Log;

trait TurnTrait
{
  public function stStartOfTurn()
  {
    Globals::startNewTurn();

    // Compute order of play
    $order = Board::getPlayersOrder();
    Notifications::startNewTurn($order);
    Log::saveTurnOrder($order);
    $this->gamestate->nextState('');
  }
}
?>
