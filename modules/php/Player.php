<?php
namespace FORD;

/*
 * Player: all utility functions concerning a player
 */

class Player
{
  protected $id;
  protected $no; // natural order
  protected $name; // player name
  protected $color;
  protected $eliminated = false;
  protected $zombie = false;

  public function __construct($row) {
    if($row != null) {
      $this->id = $row['player_id'];
      $this->no = (int)$row['player_no'];
      $this->name = $row['player_name'];
      $this->color = $row['player_color'];
      $this->eliminated = $row['player_eliminated'] == 1;
      $this->zombie = $row['player_zombie'] == 1;
    }
  }

  /*
   * Getters
   */
  public function getId(){ return $this->id; }
  public function getNo(){ return $this->no; }
  public function getName(){ return $this->name; }
  public function getColor(){ return $this->color; }
  public function isEliminated(){ return $this->eliminated; }
  public function isZombie(){ return $this->zombie; }


  public function getUiData($currentPlayerId = null) {
    $current = $this->id == $currentPlayerId;
    return [
      'id'        => $this->id,
      'eliminated'=> $this->eliminated,
      'no'        => $this->no,
      'name'      => $this->name,
      'color'     => $this->color,
    ];
  }
}
