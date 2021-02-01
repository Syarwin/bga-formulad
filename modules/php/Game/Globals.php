<?php
namespace FORD\Game;
use FormulaD;

/*
 * Globals
 */
class Globals extends \APP_DbObject
{
  /* Exposing methods from Table object singleton instance */
  protected static function init($name, $value){
    FormulaD::get()->setGameStateInitialValue($name, $value);
  }

  protected static function set($name, $value){
    FormulaD::get()->setGameStateValue($name, $value);
  }

  public static function get($name){
    return FormulaD::get()->getGameStateValue($name);
  }

  protected static function inc($name, $value = 1){
    return FormulaD::get()->incGameStateValue($name, $value);
  }


  /*
   * Declare globas (in the constructor of game.php)
   */
  private static $globals = [
    'currentTurn' => 0,
  ];

  public static function declare($game){
    // Game options label
    $labels = [
      "circuit" => OPTION_CIRCUIT,
    ];

    // Add globals with indexes starting at 10
    $id = 10;
    foreach(self::$globals as $name => $initValue){
      $labels[$name] = $id++;
    }
    $game->initGameStateLabels($labels);
  }

  /*
   * Init
   */
  public static function setupNewGame(){
    foreach(self::$globals as $name => $initValue){
      self::init($name, $initValue);
    }
  }

  /*
   * Getters
   */
  public function getTurn()
  {
    return (int) self::get('currentTurn');
  }

  public function getCircuit()
  {
    return (int) self::get('circuit');
  }

  /*
   * Setters
   */
  public function startNewTurn()
  {
    self::inc('currentTurn');
  }
}
