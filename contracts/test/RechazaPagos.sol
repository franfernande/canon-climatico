// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {CanonClimatico} from "../CanonClimatico.sol";

/// @notice Solo para tests: un dueño que es un contrato y rechaza cualquier pago.
/// Sirve para comprobar que no puede trabar el cobro del arrendatario.
contract RechazaPagos {
    function crear(CanonClimatico canon, CanonClimatico.Condiciones calldata c) external returns (uint256) {
        return canon.crear(c);
    }

    function retirar(CanonClimatico canon) external {
        canon.retirar();
    }

    receive() external payable {
        revert("no acepto pagos");
    }
}
