app.factory('simuladorFactory', function ($http) {


    var factory = {};
    
    //*****
    var cuota_final = 0;
    
    var tasa_nominal_porc = 0;
    var tasa_efectiva_porc = 0;
    var fecha_dias;
    
    factory.getModos = function () {
        return $http.get('app/catalogos/dbmodo_pago.json');
    };

    factory.getPeriodicidad = function () {
        return $http.get('app/catalogos/dbperiodicidad.json');
    };

    factory.getSegmentos = function () {
        return $http.get('app/catalogos/dbsegmentos.json');
    };

    factory.getMetodosAmortizacion = function () {
        return $http.get('app/catalogos/dbtipos_amortizacion.json');
    };
    
    
    //recuperar catalogo de frecuencias
    
    factory.getCatalogoFrecuencias = function () {
        return $http.get('app/catalogos/dbfrecuencias_pago.json');
    };
    
    //recuperar catalogo tipo de plazo
    factory.getCatalogoTipoPlazo = function () {
        return $http.get('app/catalogos/dbtipo_plazo.json');
    };

    factory.getCatalogoTipoPersona = function () {
        return $http.get('app/catalogos/dbtipo_persona.json');
    }
    

    factory.redondearDecimales = function (number, decimalplaces) {
//        if (decimalplaces > 0) {
//            var multiply1 = Math.pow(10, (decimalplaces + 4));
//            var divide1 = Math.pow(10, decimalplaces);
//            return Math.round(Math.round(number * multiply1) / 10000) / divide1;
//        }
//        if (decimalplaces < 0) {
//            var divide2 = Math.pow(10, Math.abs(decimalplaces));
//            var multiply2 = Math.pow(10, Math.abs(decimalplaces));
//            return Math.round(Math.round(number / divide2) * multiply2);
//        }
//        return Math.round(number);

        return number;
    };

    factory.truncarDecimales = function (number) {

       return Math.floor(number * 100) / 100;

    };
    factory.contarDecimals = function (num)
    {
        var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) { return 0; }
        return Math.max(
            0,
            (match[1] ? match[1].length : 0)
                - (match[2] ? +match[2] : 0));

    };
    
    //*****************


    factory.sumaFecha = function(d, fecha)
    {
        var Fecha = new Date();
        var sFecha = fecha || (Fecha.getDate() + "/" + (Fecha.getMonth() +1) + "/" + Fecha.getFullYear());
        var sep = sFecha.indexOf('/') != -1 ? '/' : '-';
        var aFecha = sFecha.split(sep);
        var fecha = aFecha[2]+'/'+aFecha[1]+'/'+aFecha[0];
        fecha= new Date(fecha);
        fecha.setDate(fecha.getDate()+parseInt(d));
        var anno=fecha.getFullYear();
        var mes= fecha.getMonth()+1;
        var dia= fecha.getDate();
        mes = (mes < 10) ? ("0" + mes) : mes;
        dia = (dia < 10) ? ("0" + dia) : dia;
        var fechaFinal = dia+sep+mes+sep+anno;
        return (fechaFinal);
    }


    factory.restaFechas = function (f1, f2)
    {
        var aFecha1 = f1.split('/'); 
        var aFecha2 = f2.split('/'); 
        var fFecha1 = Date.UTC(aFecha1[2],aFecha1[1]-1,aFecha1[0]); 
        var fFecha2 = Date.UTC(aFecha2[2],aFecha2[1]-1,aFecha2[0]); 
        var dif = fFecha2 - fFecha1;
        var dias = Math.floor(dif / (1000 * 60 * 60 * 24)); 
        
        return dias;
    };
    
    factory.getSaldoCapitalFinal = function ()
    {
        return cuota_final;
    };
    
    factory.getTasaNominalPorc = function ()
    {
        return tasa_nominal_porc;
        
    };
    
    factory.getTasaEfectivaPorc = function ()
    {
        return tasa_efectiva_porc;
    };
    
    
    
    factory.generarSimulacion = function (segmento_def, metodo_amortizacion_def, modos_def, periodicidad_def, datos_credito, frecuencias_pago_seleccionada, valor_cuota_detalle) {

        
        //valores totales
        var capital_total = 0;
        var interes_total = 0;
        var valor_cuota_total = 0;
        var valor_seguro_desgravamen_total = 0;
        var flg_valor_cuota_aproximado = 0;

        var tabla_amortizacion = [];
        
        var tasa_nominal_calculada = 0;
        var tasa_efectiva_calculada = 0;
        var plazo_dias = 0;
        
                
        //******calculo fecha
        
        var hoy = new Date();
            
        dia = hoy.getDate(); 
        mes = hoy.getMonth()+1;
        anio= hoy.getFullYear();
        fecha_actual = String(dia+"/"+mes+"/"+anio);
            
        //alert("fecha_actual: "+ fecha_actual);

        fecha_cuota = new Date(anio,mes-1,dia);
        //alert("fecha_cuota: "+fecha_cuota);




        //******CALCULO DE TASAS POR EL MODO DE PAGO
        if(modos_def.id == 1){//PAGOS PERIODICOS
            //*******tasa nominal calculada;
            tasa_nominal_calculada = ((Math.pow(1 + segmento_def.tasa_efectiva_porc, 1 / frecuencias_pago_seleccionada.factor_calculo_anual))-1) * frecuencias_pago_seleccionada.factor_calculo_anual ;
            tasa_nominal_porc = tasa_nominal_calculada * 100;

            //alert("tasa_nominal_calculada: "+tasa_nominal_calculada);

            //*******tasa efectiva calculada;
            //tasa_efectiva_calculada = (Math.pow((segmento_def.tasa_interes_porc / frecuencias_pago_seleccionada.factor_calculo_anual)+1, frecuencias_pago_seleccionada.factor_calculo_anual)) - 1 ;
            //tasa_efectiva_porc = tasa_efectiva_calculada * 100;
            tasa_efectiva_porc = segmento_def.tasa_efectiva;


            //alert("tasa_efectiva_porc: "+tasa_efectiva_porc);
        }else{//PAGOS AL VENCIMIENTO

            //****clacular si es por meses el total de dias

            if(periodicidad_def.id == 1){//dias
                plazo_dias = datos_credito.plazo;
            }else{//meses
                plazo_dias = datos_credito.plazo * 30;
            }

            //alert("plazo_dias "+plazo_dias);

            tasa_nominal_calculada = ((Math.pow(1 + segmento_def.tasa_efectiva_porc, plazo_dias / 365))-1) * (365 / plazo_dias ) ;
            tasa_nominal_porc = tasa_nominal_calculada * 100;
            //alert("tasa_nominal_calculada: "+tasa_nominal_calculada);

            //=(POTENCIA((T30/(365/T24)+1);365/T24))-1

            //tasa_efectiva_calculada = (Math.pow((segmento_def.tasa_interes_porc/(365/plazo_dias)+1), 365/plazo_dias)) - 1 ;
            //tasa_efectiva_porc = tasa_efectiva_calculada * 100;

            tasa_efectiva_porc = segmento_def.tasa_efectiva;
            //alert("tasa efecttiva calculada: "+ tasa_efectiva_calculada);
        }

        valor_seguro_desgravamen_total = valor_seguro_desgravamen_total + ( datos_credito.monto * 0.054 / 100 * 12 / frecuencias_pago_seleccionada.factor_calculo_anual);

        if(modos_def.genera_tabla_amortizacion)
        {

            //primera fila
            tabla_amortizacion.push(
                {
                    no_pago: no_pago_detalle,
                    fecha: '-',
                    no_dias: '-',
                    capital_amortizado: '-',
                    interes: '-',
                    valor_cuota: '-',
                    saldo_capital: datos_credito.monto,
                    //seguro_desgravamen: '-'
                    seguro_desgravamen: valor_seguro_desgravamen_total
                });
            //valor_seguro_desgravamen_total = valor_seguro_desgravamen_total + ((datos_credito.monto * 0.054) / 100);


            //valores detalles
            var saldo_capital_detalle = parseFloat(datos_credito.monto).toFixed(2);
            var no_pago_detalle = 0;
            var capital_amortizado_detalle = 0;
            var interes_detalle = 0;
            //var valor_cuota_detalle = 0;
            var valor_seguro_desgravamen_detalle = 0;
            var no_dias_detalle = 0;
            var credito

            //generacion tabla

            //*********ALEMANA
            if (metodo_amortizacion_def.id == "A") {
                while (Math.round(saldo_capital_detalle) > 0 && no_pago_detalle < datos_credito.plazo) {
                    no_pago_detalle = no_pago_detalle + 1;


                    //fecha_cuota***********************
                    fecha_cuota.setMonth(fecha_cuota.getMonth() + frecuencias_pago_seleccionada.factor_calculo_mensual);


                    if(no_pago_detalle == 1){
                        no_dias_detalle = this.restaFechas(fecha_actual,fecha_cuota.toLocaleDateString("es-ES"));
                    }
                    else{
                        no_dias_detalle = this.restaFechas(fecha_actual,fecha_cuota.toLocaleDateString("es-ES"));
                    }
                    fecha_actual = fecha_cuota.toLocaleDateString("es-ES");

                    var anno=fecha_cuota.getFullYear();
                    var mes= fecha_cuota.getMonth()+1;
                    var dia= fecha_cuota.getDate();
                    mes = (mes < 10) ? ("0" + mes) : mes;
                    dia = (dia < 10) ? ("0" + dia) : dia;
                    var fecha_formateada = dia+ "/" +mes+ "/" +anno;

                    capital_amortizado_detalle = (datos_credito.monto / datos_credito.plazo);

                    if(this.contarDecimals(capital_amortizado_detalle) > 2){
                        capital_amortizado_detalle =  this.truncarDecimales(capital_amortizado_detalle);
                    }
                    datos_credito.valor_cuota_aproximado = capital_amortizado_detalle;

                    //****CALCULO DEL INTERES
                    //interes_detalle = ((segmento_def.tasa_interes_porc / 12) * saldo_capital_detalle);
                    /*if(this.contarDecimals(interes_detalle) > 2){
                     interes_detalle =  this.truncarDecimales(interes_detalle);
                     }*/
                    interes_detalle = saldo_capital_detalle * tasa_nominal_calculada / modos_def.denominador_interes * no_dias_detalle;


                    //*****CALCULO DEL CAPITAL*******
                    //valor_cuota_detalle = (capital_amortizado_detalle + interes_detalle).toFixed(2);
                    valor_cuota_detalle = (capital_amortizado_detalle + interes_detalle);

                    //saldo_capital_detalle = (saldo_capital_detalle - capital_amortizado_detalle).toFixed(2);
                    saldo_capital_detalle = (saldo_capital_detalle - capital_amortizado_detalle);


                    if(saldo_capital_detalle > 0 && no_pago_detalle == datos_credito.plazo)
                    {
                        //capital_amortizado_detalle = (parseFloat(capital_amortizado_detalle) + parseFloat(saldo_capital_detalle)).toFixed(2);
                        capital_amortizado_detalle = (parseFloat(capital_amortizado_detalle) + parseFloat(saldo_capital_detalle));
                        //valor_cuota_detalle =  (parseFloat(valor_cuota_detalle) + parseFloat(saldo_capital_detalle)).toFixed(2);
                        valor_cuota_detalle =  (parseFloat(valor_cuota_detalle) + parseFloat(saldo_capital_detalle));
                        //valor_cuota_detalle = this.truncarDecimales(valor_cuota_detalle);
                        saldo_capital_detalle = 0;
                    }


                    //****CALCULO DEL SEGURO DE DESGRAVAMEN
                    //valor_seguro_desgravamen_detalle = (saldo_capital_detalle * 0.054) / 100;
                    //valor_seguro_desgravamen_detalle = this.truncarDecimales(valor_seguro_desgravamen_detalle);
                    valor_seguro_desgravamen_detalle = saldo_capital_detalle * 0.054 / 100  * 12 / frecuencias_pago_seleccionada.factor_calculo_anual;

                    tabla_amortizacion.push(
                        {
                            no_pago:  no_pago_detalle,
                            //fecha: fecha_cuota.toLocaleDateString("es-ES"),
                            fecha: fecha_formateada,
                            no_dias: no_dias_detalle,
                            capital_amortizado: capital_amortizado_detalle,
                            interes: interes_detalle,
                            valor_cuota: valor_cuota_detalle,
                            saldo_capital: saldo_capital_detalle,
                            seguro_desgravamen: valor_seguro_desgravamen_detalle
                        });

                    /*if(flg_valor_cuota_aproximado == 0){
                        flg_valor_cuota_aproximado = 1;
                        datos_credito.valor_cuota_aproximado = (valor_cuota_detalle);
                    }*/

                    capital_total = capital_total + (datos_credito.monto / datos_credito.plazo);
                    interes_total = interes_total + (interes_detalle);
                    valor_cuota_total = (parseFloat(valor_cuota_total) + parseFloat(valor_cuota_detalle));
                    if (valor_seguro_desgravamen_detalle > 0) { valor_seguro_desgravamen_total = valor_seguro_desgravamen_total + valor_seguro_desgravamen_detalle }
                }
                
                
          //******FRANCESA
                
                
            } else {
                while (no_pago_detalle < datos_credito.plazo) {

                    no_pago_detalle = no_pago_detalle + 1;
                    
                    //fecha_cuota***********************
                    fecha_cuota.setMonth(fecha_cuota.getMonth() + frecuencias_pago_seleccionada.factor_calculo_mensual);


                    if(no_pago_detalle == 1){
                        no_dias_detalle = this.restaFechas(fecha_actual,fecha_cuota.toLocaleDateString("es-ES"));
                    }
                    else{
                        no_dias_detalle = this.restaFechas(fecha_actual,fecha_cuota.toLocaleDateString("es-ES"));
                    }
                    fecha_actual = fecha_cuota.toLocaleDateString("es-ES");

                    var anno=fecha_cuota.getFullYear();
                    var mes= fecha_cuota.getMonth()+1;
                    var dia= fecha_cuota.getDate();
                    mes = (mes < 10) ? ("0" + mes) : mes;
                    dia = (dia < 10) ? ("0" + dia) : dia;
                    var fecha_formateada = dia+ "/" +mes+ "/" +anno;

                    //****CALCULO DEL INTERES
                    //interes_detalle = saldo_capital_detalle * segmento_def.tasa_interes_porc / 360 * no_dias_detalle;
                    interes_detalle = saldo_capital_detalle * tasa_nominal_calculada / modos_def.denominador_interes * no_dias_detalle;


                    //*****CALCULO DEL CAPITAL*******
                    capital_amortizado_detalle = (valor_cuota_detalle - interes_detalle);

                    saldo_capital_detalle = (saldo_capital_detalle - capital_amortizado_detalle);
                

                    if(saldo_capital_detalle > 0 && no_pago_detalle == datos_credito.plazo)
                    {
                        if(no_pago_detalle == datos_credito.plazo-1){
                            capital_amortizado_detalle = capital_amortizado_detalle - (valor_cuota_detalle - interes_detalle);// this.truncarDecimales(parseFloat(capital_amortizado_detalle) + parseFloat(saldo_capital_detalle));
                      }
                    }

                    capital_total = capital_total + parseFloat(capital_amortizado_detalle);

                    //****CALCULO DEL SEGURO DE DESGRAVAMEN
                    //valor_seguro_desgravamen_detalle = (saldo_capital_detalle * 0.054) / 100;
                    valor_seguro_desgravamen_detalle = saldo_capital_detalle * 0.054 / 100 * 12 / frecuencias_pago_seleccionada.factor_calculo_anual;
                    
                    tabla_amortizacion.push(
                        {
                            no_pago: no_pago_detalle,
                            //fecha: fecha_cuota.toLocaleDateString("es-ES"),
                            fecha: fecha_formateada,
                            no_dias: no_dias_detalle,
                            capital_amortizado: capital_amortizado_detalle,
                            interes: interes_detalle,
                            valor_cuota: valor_cuota_detalle,
                            saldo_capital: saldo_capital_detalle,
                            seguro_desgravamen: valor_seguro_desgravamen_detalle
                        });

                    if(flg_valor_cuota_aproximado == 0){
                        flg_valor_cuota_aproximado = 1;
                        datos_credito.valor_cuota_aproximado = (valor_cuota_detalle);
                    }

                     
                    interes_total = interes_total + (interes_detalle);
                    valor_cuota_total = valor_cuota_total + (valor_cuota_detalle);
                    if (valor_seguro_desgravamen_detalle > 0) { valor_seguro_desgravamen_total = valor_seguro_desgravamen_total + valor_seguro_desgravamen_detalle }

                }
                
                //******ASIGNACION CAPITAL FINAL A VARIABLE GLOBAL
                cuota_final = saldo_capital_detalle;
            }
            
            //******************TOTALES***********
            datos_credito.capital_total = capital_total;
            datos_credito.interes_total = interes_total;
            datos_credito.valor_cuota_total = valor_cuota_total;
            datos_credito.seguro_desgravamen = valor_seguro_desgravamen_total;
            datos_credito.res_valor_relacion = valor_cuota_total / datos_credito.monto;


            //****CALCULO DEL SOLCA
            /*if(datos_credito.plazo >= 12){
                datos_credito.valor_solca = (datos_credito.monto * 0.5) / 100;
            }else{
                datos_credito.valor_solca = ((datos_credito.monto * 0.5) * (periodicidad_def.factor_calculo_dias * datos_credito.plazo)) / 36000;
            }*/
            datos_credito.valor_solca = factory.redondearDecimales((datos_credito.monto * 0.5) / 100);


            //****CALCULO DEL TOTAL
            //datos_credito.valor_total = (parseFloat(datos_credito.capital_total) + parseFloat(datos_credito.seguro_desgravamen) + parseFloat(datos_credito.interes_total) + parseFloat(datos_credito.valor_solca));
            datos_credito.valor_total = parseFloat(datos_credito.capital_total)  + parseFloat(datos_credito.interes_total);

            return tabla_amortizacion;

        }else//********PAGOS AL VENCIMIENTO
        {

            fecha_dias = this.sumaFecha(plazo_dias);

            no_dias_detalle = this.restaFechas(fecha_actual,fecha_dias);

            capital_total = parseFloat(datos_credito.monto).toFixed(2);

            //var dias_plazo = (periodicidad_def.factor_calculo_dias *  datos_credito.plazo);


            //****CALCULO DEL INTERES
            //interes_total = (((capital_total * segmento_def.tasa_interes_porc) * dias_plazo) / 365);
            //interes_total = (((capital_total * tasa_nominal_calculada) * plazo_dias) / 360);
            interes_total = capital_total * tasa_nominal_calculada * plazo_dias / modos_def.denominador_interes;//denominador 365

            valor_cuota_total = factory.redondearDecimales(capital_total, 2) + factory.redondearDecimales(interes_total, 2);


            //****CALCULO DEL SEGURO DE DESGRAVAMEN
            var calculo_dias = Math.floor(plazo_dias / 30);
            var resto = plazo_dias % 30;
            var calculo_dias_ajustado = 0;

            if(resto > 0)
                calculo_dias_ajustado = calculo_dias + 1;
            else
                calculo_dias_ajustado = calculo_dias;

            //alert("calculo dias ajustado "+calculo_dias_ajustado);

            valor_seguro_desgravamen_total = (capital_total * 0.054 * calculo_dias_ajustado ) / 100;


            datos_credito.capital_total = factory.redondearDecimales(capital_total, 2);
            datos_credito.interes_total = factory.redondearDecimales(interes_total, 2);
            datos_credito.valor_cuota_total = factory.redondearDecimales(valor_cuota_total, 2);
            datos_credito.seguro_desgravamen = factory.redondearDecimales(valor_seguro_desgravamen_total, 2);
            datos_credito.res_valor_relacion = factory.redondearDecimales((valor_cuota_total / datos_credito.monto), 2);


            //****CALCULO DEL SOLCA
            if(plazo_dias > 360){
                datos_credito.valor_solca = factory.redondearDecimales((datos_credito.monto * 0.5) / 100);
            }else{
                //datos_credito.valor_solca = factory.redondearDecimales(((datos_credito.monto * 0.5) * (periodicidad_def.factor_calculo_dias * datos_credito.plazo)) / 36000);
                datos_credito.valor_solca = factory.redondearDecimales((datos_credito.monto * 0.5) / 36000 * plazo_dias);
            }


            //****CALCULO DEL TOTAL
            //datos_credito.valor_total = (parseFloat(datos_credito.capital_total) + parseFloat(datos_credito.seguro_desgravamen) + parseFloat(datos_credito.interes_total) + parseFloat(datos_credito.valor_solca));
            datos_credito.valor_total = parseFloat(datos_credito.capital_total)  + parseFloat(datos_credito.interes_total);


            datos_credito.valor_cuota_total = parseFloat(datos_credito.capital_total)  + parseFloat(datos_credito.interes_total);
            datos_credito.valor_costos_gastos = 10;//(valor_seguro_desgravamen_total + interes_total);

            tabla_amortizacion.push(
                {
                    no_pago: 1,
                    //fecha: fecha_cuota.toLocaleDateString("es-ES"),
                    fecha: fecha_dias,
                    no_dias: no_dias_detalle,
                    capital_amortizado: capital_total,
                    interes: interes_total,
                    //valor_cuota: capital_total + interes_total,
                    valor_cuota: "",
                    saldo_capital: datos_credito.monto,
                    seguro_desgravamen: valor_seguro_desgravamen_total
                });
            
            return tabla_amortizacion;
        }

        //***********DEVUELVE SALDO CAPITAL FINAL
        this.getSaldoCapitalFinal();
        

    };

    return factory;

});