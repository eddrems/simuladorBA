app.controller('simuladorController', function ($scope, $http, simuladorFactory) {

    //variables globales
    
    
    $scope.modos = [];
    $scope.periodicidades = [];
    $scope.segmentos = [];
    $scope.metodos_amortizacion = [];
    $scope.periodicidad_def = {};
    $scope.modos_def = {};
    $scope.segmento_def = {};
    $scope.metodo_amortizacion_def = {};
    
    // [] una coleccion de registros
    // {} un registro
    $scope.frecuencias_pago = [];
    $scope.frecuencias_pago_seleccionada = {};
    
    $scope.tipo_plazo = [];
    $scope.tipo_plazo_seleccionada = {};

    
    $scope.datos_credito = {};
    $scope.tabla_amortizacion = [];
    $scope.plazo_minimo = 0;
    $scope.plazo_maximo = 0;

    $scope.plazo_texto = "";
    
    //*********VARIABLES PARA LA VISTA
    $scope.numeroCuotas = 0;
    $scope.saldo_capital_final = 0;
    
    $scope.valor_cuota_detalle = 0;
    

    simuladorFactory.getModos().success(function (data, status, headers, config) {
        $scope.modos = data;
        $scope.modos_def = $scope.modos[0];

    });

    simuladorFactory.getPeriodicidad().success(function (data, status, headers, config) {
        $scope.periodicidades = data;
        $scope.periodicidad_def = $scope.periodicidades[0];

    });
    simuladorFactory.getSegmentos().success(function (data, status, headers, config) {
        $scope.segmentos = data;
        $scope.segmento_def = $scope.segmentos[0];

       // $scope.plazo_minimo = (parseInt($scope.segmento_def.plazo_minimo) * parseInt($scope.periodicidad_def.factor_calculo));
        //$scope.plazo_maximo = (parseInt($scope.segmento_def.plazo_maximo) * parseInt($scope.periodicidad_def.factor_calculo));

       // $scope.plazo_minimo = (parseInt($scope.frecuencias_pago_seleccionada.factor_calculo_anual));
       // $scope.plazo_maximo = (parseInt($scope.segmento_def.plazo_maximo) / parseInt($scope.frecuencias_pago_seleccionada.factor_calculo_mensual));

    });
    simuladorFactory.getMetodosAmortizacion().success(function (data, status, headers, config) {
        $scope.metodos_amortizacion = data;
        $scope.metodo_amortizacion_def = $scope.metodos_amortizacion[0];
    });

     
    //ejecuta para recuperar catalogos frecuencias y tipos plazo
    
    simuladorFactory.getCatalogoFrecuencias().success(function (data, status, headers, config) {
        $scope.frecuencias_pago = data;
        $scope.frecuencias_pago_seleccionada = $scope.frecuencias_pago[0]; //seleccionada por default
    });
    
    
    //MESES Y ANIOS***********
    
     simuladorFactory.getCatalogoTipoPlazo().success(function (data, status, headers, config) {
        $scope.tipo_plazo = data;
        $scope.tipo_plazo_seleccionada = $scope.tipo_plazo[0]; //seleccionada por default
    });
    
    
    
    
    
    //logica del aplicativo
    
    $scope.init = function () {
        $('#frm_params').parsley();

    };
    
    
    
    //metodo del change
    
    $scope.calcularNumeroCuotas = function () {
    
        //asuminos calculo mensual
        $scope.numeroCuotas = $scope.datos_credito.plazo / $scope.frecuencias_pago_seleccionada.factor_calculo_mensual;
    
    };
    

    $scope.generarSimulacion = function () {
        $('#frm_params').parsley().validate();

        if ($('#frm_params').parsley().isValid()) {

            //calculo inicial de cuota
            $scope.valor_cuota_detalle = $scope.datos_credito.monto / $scope.datos_credito.plazo;
 
            //alert($scope.generarSimulacion2($scope.valor_cuota_detalle));
            
        console.log(goalSeek({
            Func: $scope.generarSimulacion2, 
            aFuncParams: [$scope.valor_cuota_detalle],
            oFuncArgTarget: {
              Position: 0
            },
            Goal: 0,
            Tol: 0.01,
            maxIter: 1000
          }));
            
            
            $('#div_parametros').hide();
            $('#div_tabla_amortizacion').show();
        }
    };
    
     $scope.generarSimulacion2 = function (valor_cuota) {

        $scope.tabla_amortizacion = simuladorFactory.generarSimulacion($scope.segmento_def, $scope.metodo_amortizacion_def, $scope.modos_def, $scope.periodicidad_def, $scope.datos_credito, $scope.frecuencias_pago_seleccionada, valor_cuota);

        $scope.tasa_nominal_porc = simuladorFactory.getTasaNominalPorc();
        $scope.tasa_efectiva_porc = simuladorFactory.getTasaEfectivaPorc(); 
         
        return simuladorFactory.getSaldoCapitalFinal();
        
    };
    
    
    $scope.actualizarValidaciones = function () {
        $('#frm_params').parsley().destroy();
        $('#monto').attr('catalogos-range', '[' + $scope.segmento_def.monto_minimo + ',' + $scope.segmento_def.monto_maximo + ']');

        //************OCULTAR FRECUENCIAS POR PAGO AL VENCIMIENTO

        //alert("modalidad" +$scope.modos_def.id );
        if($scope.modos_def.id == 1){//PAGOS PERIODICOS
            $('#frecuencias').show();
            $('#plazo').hide();
            $scope.plazo_texto = $scope.frecuencias_pago_seleccionada.texto;

            if($scope.modos_def.plazo_minimo == 0){
                //$scope.plazo_minimo = (parseInt($scope.segmento_def.plazo_minimo) * parseInt($scope.periodicidad_def.factor_calculo));
                $scope.plazo_minimo = (parseInt($scope.segmento_def.plazo_minimo) / parseInt($scope.frecuencias_pago_seleccionada.factor_calculo_anual));
            }else{//PAGOS AL VENCIMIENTO
                //$scope.plazo_minimo = (parseInt($scope.modos_def.plazo_minimo) * parseInt($scope.periodicidad_def.factor_calculo));
                $scope.plazo_minimo = (parseInt($scope.segmento_def.plazo_minimo) / parseInt($scope.frecuencias_pago_seleccionada.factor_calculo_anual));
            }
            //$scope.plazo_maximo = (parseInt($scope.segmento_def.plazo_maximo) * parseInt($scope.periodicidad_def.factor_calculo));

            $scope.plazo_minimo = (parseInt($scope.frecuencias_pago_seleccionada.factor_calculo_anual));
            $scope.plazo_maximo = (parseInt($scope.segmento_def.plazo_maximo) / parseInt($scope.frecuencias_pago_seleccionada.factor_calculo_mensual));

        }else{//PAGOS AL VENCIMIENTO
            $('#frecuencias').hide();
            $('#plazo').show();

            $scope.plazo_texto = $scope.periodicidad_def.texto;

            if($scope.periodicidad_def.id == 1){//dias
                $scope.plazo_minimo = (parseInt($scope.segmento_def.plazo_minimo) * 30);
                $scope.plazo_maximo = (parseInt($scope.segmento_def.plazo_maximo) * 30);
            } else { //meses
                $scope.plazo_minimo = (parseInt($scope.segmento_def.plazo_minimo));
                $scope.plazo_maximo = (parseInt($scope.segmento_def.plazo_maximo));
            }

        }


        //**********************AQUI MODIFICAR *******************

       /* if($scope.modos_def.plazo_minimo == 0){

            //alert("frecuencia factor_mes "+$scope.frecuencias_pago_seleccionada.factor_calculo_anual);

            //$('#plazo').attr('catalogos-range', '[' + (parseInt($scope.segmento_def.plazo_minimo) / parseInt($scope.periodicidad_def.factor_calculo)) + ',' + ($scope.segmento_def.plazo_maximo * $scope.periodicidad_def.factor_calculo) + ']');
            $('#plazo').attr('catalogos-range', '[' + (parseInt($scope.segmento_def.plazo_minimo) / parseInt($scope.frecuencias_pago_seleccionada.factor_calculo_mensual)) + ',' + ($scope.segmento_def.plazo_maximo / $scope.frecuencias_pago_seleccionada.factor_calculo_anual) + ']');
        }else{
            //$('#plazo').attr('catalogos-range', '[' + (parseInt($scope.modos_def.plazo_minimo) * parseInt($scope.periodicidad_def.factor_calculo)) + ',' + ($scope.segmento_def.plazo_maximo * $scope.periodicidad_def.factor_calculo) + ']');
            $('#plazo').attr('catalogos-range', '[' + (parseInt($scope.segmento_def.plazo_minimo) / parseInt($scope.frecuencias_pago_seleccionada.factor_calculo_mensual)) + ',' + ($scope.segmento_def.plazo_maximo / $scope.frecuencias_pago_seleccionada.factor_calculo_anual) + ']');
        }*/

        $('#frm_params').parsley();



    };


    $scope.actualizarUIMetodoPago = function () {

        //$scope.periodicidad_def = $scope.periodicidades[0];

        this.actualizarValidaciones();
    };
});