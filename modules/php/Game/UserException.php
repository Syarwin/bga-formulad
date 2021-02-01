<?php
namespace FORD\Game;
use FormulaD;

class UserException extends \BgaUserException {
  public function __construct($str)
  {
    parent::__construct(FormulaD::translate($str));
  }
}
?>
