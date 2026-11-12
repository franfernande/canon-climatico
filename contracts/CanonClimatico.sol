// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Canon Climático
/// @notice Alquiler de campo con un saldo en custodia que se reparte entre el dueño y el
/// arrendatario según la lluvia acumulada en una ventana, publicada por un relayer.
contract CanonClimatico {
    enum Estado {
        Creado,
        Depositado,
        Liquidado,
        Cancelado
    }

    struct Condiciones {
        address arrendatario;
        address relayer;
        uint256 saldo;
        /// @dev Grados multiplicados por 10.000: -25,12 se guarda como -251200.
        int32 latitudE4;
        int32 longitudE4;
        string fuente;
        /// @dev Segundos Unix. La ventana es [inicioVentana, finVentana).
        uint64 inicioVentana;
        uint64 finVentana;
        uint64 plazoDeposito;
        /// @dev Décimas de milímetro: 255 mm se guarda como 2550.
        uint32 umbralBajo;
        uint32 umbralAlto;
        /// @dev Porcentaje del saldo (0 a 100) que vuelve al arrendatario en cada tramo.
        uint8 pctMedio;
        uint8 pctBajo;
    }

    struct Alquiler {
        address dueno;
        Estado estado;
        uint32 lluviaDecimasMm;
        bytes32 hashDato;
        Condiciones condiciones;
    }

    uint256 public cantidad;
    mapping(uint256 => Alquiler) private alquileres;

    event Creado(
        uint256 indexed id,
        address indexed dueno,
        address indexed arrendatario,
        address relayer,
        uint256 saldo
    );
    event Depositado(uint256 indexed id, uint256 monto);
    event Liquidado(
        uint256 indexed id,
        uint32 lluviaDecimasMm,
        bytes32 hashDato,
        uint256 alDueno,
        uint256 alArrendatario
    );
    event Cancelado(uint256 indexed id);

    error NoExiste(uint256 id);
    error CondicionesInvalidas(string motivo);
    error EstadoInvalido(Estado actual);
    error SoloDueno();
    error SoloArrendatario();
    error SoloRelayer();
    error MontoIncorrecto(uint256 esperado, uint256 recibido);
    error PlazoVencido();
    error PlazoVigente();
    error VentanaAbierta();
    error HashVacio();
    error TransferenciaFallida(address destino);

    function crear(Condiciones calldata c) external returns (uint256 id) {
        if (c.arrendatario == address(0) || c.arrendatario == msg.sender) {
            revert CondicionesInvalidas("arrendatario");
        }
        if (c.relayer == address(0)) revert CondicionesInvalidas("relayer");
        if (c.saldo == 0) revert CondicionesInvalidas("saldo");
        if (c.inicioVentana >= c.finVentana) revert CondicionesInvalidas("ventana");
        if (c.plazoDeposito <= block.timestamp) revert CondicionesInvalidas("plazo");
        if (c.umbralBajo >= c.umbralAlto) revert CondicionesInvalidas("umbrales");
        if (c.pctBajo > 100 || c.pctMedio > c.pctBajo) revert CondicionesInvalidas("porcentajes");

        id = ++cantidad;
        Alquiler storage a = alquileres[id];
        a.dueno = msg.sender;
        a.condiciones = c;

        emit Creado(id, msg.sender, c.arrendatario, c.relayer, c.saldo);
    }

    /// @notice El arrendatario envía exactamente el saldo. Con eso acepta las condiciones.
    function depositar(uint256 id) external payable {
        Alquiler storage a = _existente(id);
        if (a.estado != Estado.Creado) revert EstadoInvalido(a.estado);
        if (msg.sender != a.condiciones.arrendatario) revert SoloArrendatario();
        if (block.timestamp > a.condiciones.plazoDeposito) revert PlazoVencido();
        if (msg.value != a.condiciones.saldo) {
            revert MontoIncorrecto(a.condiciones.saldo, msg.value);
        }

        a.estado = Estado.Depositado;
        emit Depositado(id, msg.value);
    }

    /// @notice El relayer publica la lluvia de la ventana y el SHA-256 de la respuesta de la
    /// fuente. El contrato elige el tramo y transfiere el saldo. Se puede llamar una sola vez.
    function liquidar(uint256 id, uint32 lluviaDecimasMm, bytes32 hashDato) external {
        Alquiler storage a = _existente(id);
        if (a.estado != Estado.Depositado) revert EstadoInvalido(a.estado);
        if (msg.sender != a.condiciones.relayer) revert SoloRelayer();
        if (block.timestamp < a.condiciones.finVentana) revert VentanaAbierta();
        if (hashDato == bytes32(0)) revert HashVacio();

        uint256 saldo = a.condiciones.saldo;
        uint256 alArrendatario = (saldo * _porcentaje(a.condiciones, lluviaDecimasMm)) / 100;
        uint256 alDueno = saldo - alArrendatario;

        a.estado = Estado.Liquidado;
        a.lluviaDecimasMm = lluviaDecimasMm;
        a.hashDato = hashDato;
        emit Liquidado(id, lluviaDecimasMm, hashDato, alDueno, alArrendatario);

        _transferir(a.dueno, alDueno);
        _transferir(a.condiciones.arrendatario, alArrendatario);
    }

    /// @notice Si el plazo venció sin depósito, el dueño cierra el contrato.
    function cancelar(uint256 id) external {
        Alquiler storage a = _existente(id);
        if (msg.sender != a.dueno) revert SoloDueno();
        if (a.estado != Estado.Creado) revert EstadoInvalido(a.estado);
        if (block.timestamp <= a.condiciones.plazoDeposito) revert PlazoVigente();

        a.estado = Estado.Cancelado;
        emit Cancelado(id);
    }

    function alquiler(uint256 id) external view returns (Alquiler memory) {
        return _existente(id);
    }

    /// @notice Porcentaje del saldo que le vuelve al arrendatario con esa lluvia.
    function porcentajeArrendatario(uint256 id, uint32 lluviaDecimasMm) external view returns (uint8) {
        return _porcentaje(_existente(id).condiciones, lluviaDecimasMm);
    }

    function _porcentaje(Condiciones storage c, uint32 lluvia) private view returns (uint8) {
        if (lluvia > c.umbralAlto) return 0;
        if (lluvia > c.umbralBajo) return c.pctMedio;
        return c.pctBajo;
    }

    function _existente(uint256 id) private view returns (Alquiler storage a) {
        a = alquileres[id];
        if (a.dueno == address(0)) revert NoExiste(id);
    }

    function _transferir(address destino, uint256 monto) private {
        if (monto == 0) return;
        (bool ok, ) = destino.call{value: monto}("");
        if (!ok) revert TransferenciaFallida(destino);
    }
}
