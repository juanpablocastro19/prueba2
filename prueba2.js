  'use strict';

  // Import the Dialogflow module from the Actions on Google client library.
  const {dialogflow} = require('actions-on-google');

  // Import the firebase-functions package for deployment.
  const functions = require('firebase-functions');

  // Instantiate the Dialogflow client.
  const app = dialogflow({debug: true});

  var problema = "";
  var paso = 0;
  var detectarSubproblema = false;
  //-----------------------------------------
  var IntentEquipos = false;
  var IntentNumeroEquipos = false;
  var IntentQuestions = false;
  var numEquipos = 1;
  var index = 0;
  var _index;
  var myArray = [];
  var access = []; // Utilizo este array para controlar los intents asociados a las preguntas.
  /*Esto es así debido a que los intents se pueden lanzar en cualquier momento
  y esto tiene la "desventaja" de que se puede contestar a preguntas no activas*/
  var equipos = [];
  var pointsTeam = [];
  var failsTeam = [];
  /*-----------------------------------------------------------------------------------------*/
  var turno = 0;
  var ronda = 1;
  //var repetir = 0;

  var numPreguntas;

  var pointsTeam1 = 0;
  var failsTeam1 = 0;
  var preguntas;

  const questions =
  [
      "¿Cuál de estos meses del año NO es uno de los que tiene 31 días?\nJulio.\nJunio.\no Enero\n",//1
      "¿En cuál de estas unidades se mide la velocidad en navegación marítima y aérea?\nMillas\nNudos\no Pies\n",//2
      "En el Señor de los Anillos, ¿Cuál era la relación entre Merry y Pippin?\nPrimos\nHermanos\nAmigos\n",//3
      "¿En cuál de estas cordilleras se encuentra el Monte Everest?\nAlpes\nHimalaya\nMontes de Toledo\n",//4
      "¿Qué título posee el heredero al trono de la Corona de Inglaterra?\nPríncipe de Escocia\nPríncipe de Maine\nPríncipe de Gales\n",//5
      "¿Qué piloto ha sido el más joven en ganar un Gran Premio de Fórmula 1?\nFernando Alonso\nMax Verstappen\nSebastian Vettel\n",//6
      "¿Cuál de estos animales es el más lento del mundo?\nKoala\nPerezoso\nManatí\n",//7
      "¿Cuál de estos árboles NO es de hoja caduca?\nChopo\nNogal\nPino\n",//8
      "¿Cuál de estas estrellas firmó el contrato más caro de la historia de la música?\nC Tangana\nMichael Jackson\nU2\n",//9
      "¿Qué animal es el mamífero más grande del mundo?\nBallena Azul\nOso polar\nElefante Africano\n",//10
      "¿Cuál de estos reyes gobernó en la Corona de Aragón mientras Isabel reinaba en la de Castilla?\nCarlos primero\nFelipe Segundo\nFernando Segundo\n",//11
      "¿Cuál fue el primer largometraje de animación realizado íntegramente por ordenador?\nShrek\nBuscando a Nemo\nToy Story\n",//12
      "¿Cuál es el país del mundo con más lugares declarados Patrimonio de la Humanidad?\nEstados Unidos\nChina\nItalia\n",//13
      "¿En qué minuto metió Andrés Iniesta el gol que le daría a España el mundial de fútbol de 2010?\n121\n113\n116\n",//14
      "¿En qué ciudad nació la bolsa de valores oficial más antigua del mundo?\nÁmsterdam\nNueva York\nLondres\n",//15
      "¿Qué tipo de palabra es: versus?\nAdvervio\nPreposición\nConjunción\n",//16
      "¿Qué significa Machu Picchu?\nMontaña Vieja\nCiudad del sol\nLugar Escondido\n",//17
      "¿De cuál de estos países es originario el árbol del café?\nColombia\nBrasil\nEtiopía\n",//18*
      "¿Quién fue el primer científico que propuso el modelo heliocéntrico del sistema solar?\nGalileo Galilei\nAristarco de Samos\nNicolás Copérnico\n",
      "¿Cuál de estos clubes de fútbol ha sido más veces campeón de Europa?\nChelsea\nBorussia de Dortmund\nNottingham Forest\n",//20
      "¿Cuál de estas figuras musicales equivale a la mitad de una semifusa?\nCorchea\nGarrapatea\nMínima\n",//21
      "¿Por qué vena entra la sangre en la aurícula derecha del corazón?\nAorta\nCava\nSubclavia\n",//22
      "¿A cuál de estos países pertenece la isla de Navidad?\nAustralia\nJapón\nChile\n",//23
      "¿Quién es considerado como el fundador del ejército rojo durante la revolución rusa?\nVladimir Lennin\nStalin\nTrotsky\n",//24
      "¿Cuál de estos procesos NO forma parte del ciclo del agua?\nInfiltración\nFusión\nSubducción\n",//25
  //    "¿Qué villano dejó a Batman postrado en una silla de ruedas?\nDos caras\nEl Joker\nBane\n",//26
      "En Dragon Ball Z ¿Contra qué villano Son Gohan se transforma en super saiyan 2 por primera vez?\nBroly\nAndroide 17\nCélula\n",//27
      "¿Cuál de los siguientes entrevistados del programa, La Resistencia rompió una taza?\nAntonio Resines\nErnesto Sevilla\nWismichu\n"//28
  ];

  app.intent('Trivial', (conv, {Jugar}) => {

    IntentEquipos = true;
    IntentsControl ();

    index = 0;
  //  repetir = 1;
    pointsTeam1 = 0; // Just for examples, in the future this is gonna be an object
    failsTeam1 = 0;
    ronda = 1;
    loadOrder();
    numPreguntas = questions.length;
    // Presentación del juego
    conv.ask(toSSML("El juego consiste en una serie de preguntas a resolver." +
                    "\nAl final podréis ver las preguntas acertadas y falladas." +
                    "\nPodéis finalizar el juego en cualquier momento pronunciando la palabra: salir." +
                    "\nSi deseas repetir cualquier pregunta pronuncia la palabra: repetir." +
                    "\n¿Va a ser un juego por equipos? "));


  });

  app.intent('Equipos', (conv, {Seguir}) => {

      if (IntentEquipos)
      {
          IntentEquipos = false;

          if (Seguir == "Sí")
          {
              IntentNumeroEquipos = true;
              conv.ask(toSSML("¿Cuántos equipos habrá en total? "));

          }

          else
          {
              IntentNumeroEquipos = false;
              activateIntent (_index);
              conv.ask(toSSML("Bien. ¡Empecemos!" + questions[_index] + myArray));

          }
      }


  });

  app.intent('Número de Equipos', (conv, {NumeroDeEquipos}) => {

      if (IntentNumeroEquipos)
      {
          numEquipos = NumeroDeEquipos;

  		    var i;
          for (i = 0; i < numEquipos; i++)  loadTeams (i);
          activateIntent (_index);
          conv.ask(toSSML ("\nLos equipos serán identificados del 1 al " + numEquipos + ". De derecha a izquierda." +
                           "\nDe manera que el equipo número 1 será el grupo  situado más hacia vuestra derecha." +
                           "\nY el equipo número " + numEquipos  + " será el equipo situado más hacia vuestra izquierda. " +
                          "\nBien. ¡Empecemos!. Ronda " + ronda + ". Turno del equipo "+ equipos[turno] + ".\n" + questions[_index]));


      }


  });


  function toSSML(x) {
      return "<speak><voice gender=\"female\" variant=\"1\">" + x + "</voice></speak>";
  }




  function fail (conv, texto) {

          if (numPreguntas != index + 1) // Si quedan preguntas
          {
            if (IntentNumeroEquipos) failTeam (conv, texto); // Si es un juego por equipos
            else failNoTeam (conv, texto); // Si es un juego individual
          }

          else exitFromHere (conv);

  }

  function succsess(conv) {


          if (numPreguntas != index + 1) // Si quedan preguntas
          {
            if (IntentNumeroEquipos)  successTeam (conv); // Si es un juego por equipos
            else successNoTeam (conv); // Si es un juego individual

          }

          else lastSuccess (conv); // Si ya no quedan preguntas
  //
  }

  function lastSuccess (conv)
  {
    if (IntentNumeroEquipos)  pointsTeam [turno] += 1;
    else pointsTeam1++;

    exitFromHere(conv);
  }

  function exitFromHere (conv)
  {
    if (IntentNumeroEquipos) exitFromHereTeams (conv); // Si es un juego por equipos

    else conv.close(toSSML("Has acertado: " + pointsTeam1 + " preguntas de " + (pointsTeam1 + failsTeam1)  ));
  }


  function exitFromHereTeams (conv)
  {
    var i;
    var cadena = [];

    for (i = 0 ; i < numEquipos ; i++) // Creo una super cadena* La formateo y luego solo la imprimo una vez
    {
      if (i == numEquipos - 1) cadena [i] = "Y el equipo: " + equipos [i]   + ", ha acertado " + pointsTeam [i] + " de " + (pointsTeam[i] + failsTeam [i]) + " preguntas\n" ;
      else cadena [i] = "El equipo: " + equipos [i]   + ", ha acertado " + pointsTeam [i] + " de " + (pointsTeam[i] + failsTeam [i]) + " preguntas\n" ;

    }

   conv.close(toSSML(cadena));

  }

  /*-----------------------------------------------------------------*/
  /*Respuestas cuando no hay equipos*/

  function successNoTeam (conv)
  {
    pointsTeam1++;
    index++;
    desactivateIntent (_index);
    _index = myArray[index];
    activateIntent (_index);
    conv.ask(toSSML("Has acertado. \nSiguiente pregunta: " + questions[_index]));
  }


  function failNoTeam (conv, texto)
  {
    failsTeam1++;
    index++;
    desactivateIntent (_index);
    _index = myArray[index];
    activateIntent (_index);
    conv.ask(toSSML("Error. " + texto + " \nSiguiente pregunta: " + questions[_index]));
  }
  /*--------------------------------------------------------------------*/


  /*------------------------------------------------------------------------*/
  /*Respuestas cuando si hay equipos. Esto implica que habrá rondas y que se manejarán turnos*/

  function successTeam (conv)
  {
    desactivateIntent (_index);
    index++;
    _index = myArray[index];
    activateIntent (_index);
  //  equipo [turno] = points++;
    pointsTeam [turno] += 1;
    turno++;
    if (turno == numEquipos) //nueva ronda
    {
      turno = 0;
      ronda++;
      conv.ask(toSSML("Has acertado.\nRonda: " + ronda  + "\nSiguiente pregunta para el equipo " + equipos[turno] + ".\n" + questions[_index]));

    }

    else conv.ask(toSSML("Has acertado. \nSiguiente pregunta para el equipo " + equipos[turno] + ".\n"+ questions[_index]));
  }


  function failTeam (conv, texto)
  {
    desactivateIntent (_index);
    index++;
    _index = myArray[index];
    activateIntent (_index);
  //  equipo [turno] = fallos++;
    failsTeam [turno] += 1;
    turno++;

    if (turno == numEquipos)
    {
      turno = 0;
      ronda++;

      conv.ask(toSSML("Error." + texto + ".\n" + "Ronda: " + ronda  + "\nSiguiente pregunta para el equipo: " + equipos[turno] + ".\n" + questions[_index]));

    }
    else conv.ask(toSSML("Error." + texto + "\nSiguiente pregunta para el equipo: " + equipos[turno] + ".\n" + questions[_index]));
  }


  function loadTeams (i)
  {
    equipos [i] = i + 1;
    pointsTeam [i] = 0;
    failsTeam [i] = 0;
  }

  function loadOrder ()
  {
      /*Se selecionan inicialmente el orden de las preguntas*/
      var cantidadNumeros = questions.length;


      while(myArray.length < cantidadNumeros )
      {
        var numeroAleatorio = Math.ceil(Math.random()*cantidadNumeros);
        var existe = false;

        for(var i = 0;  i < myArray.length; i ++)
        {
          if(myArray [i] == numeroAleatorio-1)
    	    {
            existe = true;
            break;
          }
        }

        if(!existe)   myArray[myArray.length] = numeroAleatorio-1;
      }

      _index = myArray[0];



  }

function repetir (conv)
{
    conv.ask(toSSML("\nRepito la pregunta para el equipo " + equipos[turno] + ".\n"+ questions[_index]));
}

  /*-----------------------------------------------------------------------------------*/

function IntentsControl ()
{
  var i;
  for (i = 0; i < numPreguntas ; i++) access [i] = false;
}

function activateIntent (myIndex)
{
  access [myIndex] = true;
}

function desactivateIntent (myIndex)
{
  access [myIndex] = false;
}

function intentActivo (_myIndex)
{
  return access [_myIndex - 1];
}

/*------------------------------------------------------------------------------------------*/

  app.intent('Repetir', (conv) => {

    repetir (conv);

  });

  app.intent('Ronda', (conv) => {

    conv.ask(toSSML("\nVamos por la ronda  " + ronda ));

  });

  app.intent('Debug', (conv) => {

    conv.ask(toSSML("\nEl orden del array es el siguiente  " + myArray + " y vamos por el index " + _index +
    " el tamaño de questions es " + questions.length + " el tamaño configurado es " + numPreguntas +
  " array debug " + access));

  });

  app.intent('Salir', (conv) => {

    exitFromHere (conv);
  });




  /* A continuación se manejan todos los Intents de las respuestas de las preguntas */
  /*--------------------------------------------------------------------------------*/
  /*

  Cada pregunta tiene asociado un intent, con lo que habrá tantas "funciones" como preguntas.
  Además hay que considerar que cada pregunta tiene una respuesta diferente.

  */



  app.intent('Pregunta 1', (conv, {Pregunta1}) => {

    if (intentActivo(1))
    {
      if (Pregunta1 == "Junio")       succsess(conv);

      else fail (conv,"Es Junio el que tiene 30 días.");

    }

    else  repetir (conv);




  });

  app.intent('Pregunta 2', (conv, {Pregunta2}) => {

    if (intentActivo(2))
    {
      if (Pregunta2 == "Nudos")       succsess(conv);

      else fail (conv, "La unidad que hay en común son los nudos.");

    }

    else repetir (conv);

  });

  app.intent('Pregunta 3', (conv, {Pregunta3}) => {

    if (intentActivo(3))
    {
      if (Pregunta3 == "Primos")      succsess(conv);

      else fail (conv, "Merry y Pippin eran primos. La madre de Merry, Esmeralda Tuk y el padre de Pippin, Paladin Tuk Son hermanos.");


    }
    else repetir (conv);


  });


  app.intent('Pregunta 4', (conv, {Pregunta4}) => {

    if (intentActivo (4))
    {
      if (Pregunta4 == "Himalaya")        succsess(conv);

      else fail (conv, "El Everest se encuentra en el Himalaya.");
    }

    else repetir (conv);




  });


  app.intent('Pregunta 5', (conv, {Pregunta5}) => {

    if (intentActivo (5))
    {
      if (Pregunta5 == "Príncipe de Gales")       succsess(conv);

      else fail (conv, "El título que recibe es el de Príncipe de Gales.");

    }

    else repetir (conv);



  });

  app.intent('Pregunta 6', (conv, {Pregunta6}) => {

    if (intentActivo (6))
    {
      if (Pregunta6 == "Max Verstappen")      succsess(conv);

      else fail (conv, "El más joven en ganar un premio es Max Verstappen." );

    }
    else repetir (conv);



  });


  app.intent('Pregunta 7', (conv, {Pregunta7}) => {

    if (intentActivo (7))
    {
      if (Pregunta7 == "Perezoso")        succsess(conv);

      else fail (conv, "El más lento es el Perezoso.");
    }

    else repetir (conv);


  });


  app.intent('Pregunta 8', (conv, {Pregunta8}) => {

    if (intentActivo(8))
    {
      if (Pregunta8 == "Pino")        succsess(conv);

      else fail (conv, "La respuesta correcta es el pino.");

    }
    else repetir (conv);

  });


  app.intent('Pregunta 9', (conv, {Pregunta9}) => {

    if (intentActivo (9))
    {
      if (Pregunta9 == "Michael Jackson")     succsess(conv);

      else fail (conv, "El contrato más caro de la historia de la música fue firmado por Michael Jackson.");


    }

    else repetir (conv);

  });


  app.intent('Pregunta 10', (conv, {Pregunta10}) => {

    if (intentActivo (10))
    {
      if (Pregunta10 == "Ballena azul")       succsess(conv);

      else fail (conv, "El mamífero más grande del mundo es la ballena azul.");

    }

    else repetir (conv);

  });


  app.intent('Pregunta 11', (conv, {Pregunta11}) => {

    if (intentActivo(11))
    {
      if (Pregunta11 == "Fernando Segundo")       succsess(conv);

      else fail (conv, "El rey que gobernó en la Corona de Aragón mientras Isabel reinaba en la de Castilla fue: Fernado Segundo.");

    }

    else repetir (conv);

  });

  app.intent('Pregunta 12', (conv, {Pregunta12}) => {

    if (intentActivo(12))
    {
      if (Pregunta12 == "Toy Story")       succsess(conv);

      else fail (conv, "El primer largometraje de animación realizado íntegramente por ordenador fue Toy Story.");

    }

    else repetir (conv);

  });

  app.intent('Pregunta 13', (conv, {Pregunta13}) => {

    if (intentActivo(13))
    {
      if (Pregunta13 == "Italia")       succsess(conv);

      else fail (conv, "El país del mundo con más lugares declarados Patrimonio de la Humanidad es Italia.");

    }

    else repetir (conv);


  });

  app.intent('Pregunta 14', (conv, {Pregunta14}) => {

    if (intentActivo (14))
    {
      if (Pregunta14 == "116")       succsess(conv);

      else fail (conv, "El minuto en el que Andrés Iniesta metió el gol fue el 116.");

    }
    else repetir (conv);

  });

  app.intent('Pregunta 15', (conv, {Pregunta15}) => {

    if (intentActivo (15))
    {
      if (Pregunta15 == "Amsterdam")       succsess(conv);

      else fail (conv, "La bolsa de valores mas antigua del mundo es la de Ámsterdam.");
    }

    else repetir (conv);

  });

  app.intent('Pregunta 16', (conv, {Pregunta16}) => {

    if (intentActivo (16))
    {
      if (Pregunta16 == "adverbio")       succsess(conv);

      else fail (conv, "La palabra Versus es de tipo adverbio.");

    }

    else repetir (conv);

  });

  app.intent('Pregunta 17', (conv, {Pregunta17}) => {

    if (intentActivo(17))
    {
      if (Pregunta17 == "montaña")       succsess(conv);

      else fail (conv, "Machu Pichu significa montaña vieja.");
    }

    else repetir (conv);


  });

  app.intent('Pregunta 18', (conv, {Pregunta18}) => {


    if (intentActivo (18))
    {
      if (Pregunta18 == "etiopía")       succsess(conv);

      else fail (conv, "El árbol del Café es originario de Colombia.");

    }

    else repetir (conv);

  });

  app.intent('Pregunta 19', (conv, {Pregunta19}) => {

    if (intentActivo (19))
    {
      if (Pregunta19 == "Aristarco")       succsess(conv);

      else fail (conv, "Aristaco fue el primer científico del modelo heliocéntrico.");
    }

    else repetir (conv);

  });

  app.intent('Pregunta 20', (conv, {Pregunta20}) => {

    if (intentActivo (20))
    {
      if (Pregunta20   == "Nottingham")       succsess(conv);

      else fail (conv, "Nottingham Forest tiene más campeonatos de Europa que el Chelsea y el Borussia de Dortmund.");

    }

    else repetir (conv);

  });


  app.intent('Pregunta 21', (conv, {Pregunta21}) => {

    if (intentActivo (21))
    {
      if (Pregunta21   == "Garrapatea")       succsess(conv);

      else fail (conv, "La Garrapatea equivale a la mitad de una semifusa.");

    }

    else repetir (conv);

  });

  app.intent('Pregunta 22', (conv, {Pregunta22}) => {

    if (intentActivo (22))
    {
      if (Pregunta22   == "Cava")       succsess(conv);

      else fail (conv, "La sangre en la aurícula derecha del corazón entra por la vena cava.");

    }

    else repetir (conv);

  });

  app.intent('Pregunta 23', (conv, {Pregunta23}) => {

    if (intentActivo(23))
    {
      if (Pregunta23   == "Australia")       succsess(conv);

      else fail (conv, "La isla de la Navidad pertenece a Australia.");

    }

    else repetir (conv);

  });

  app.intent('Pregunta 24', (conv, {Pregunta24}) => {

    if (intentActivo (24))
    {
      if (Pregunta24   == "Trotsky")       succsess(conv);

      else fail (conv, "Trotsky es el fundador del ejército rojo durante la revolución rusa.");

    }

    else repetir (conv);

  });

  app.intent('Pregunta 25', (conv, {Pregunta25}) => {

    if (intentActivo (25))
    {
      if (Pregunta25   == "Subducción")       succsess(conv);

      else fail (conv, "La subducción no forma parte del ciclo del agua.");

    }

    else repetir (conv);


  });

  app.intent('Pregunta 26', (conv, {Pregunta26}) => {

    if (intentActivo (26))
    {
      if (Pregunta26   == "Batman")       succsess(conv);

      else fail (conv, "Fue Bane el que dejó en una silla de ruedas a Batman.");
    }

    else repetir (conv);

  });

  app.intent('Pregunta 27', (conv, {Pregunta27}) => {

    if (intentActivo (27))
    {
      if (Pregunta27   == "Célula")       succsess(conv);

      else fail (conv, "Gohan se transformó en Super Saiyan 2 por primera vez contra Célula.");

    }

    else repetir (conv);


  });

  app.intent('Pregunta 28', (conv, {Pregunta28}) => {

    if (intentActivo (28))
    {
      if (Pregunta28   == "Wismichu")       succsess(conv);

      else fail (conv, "Wismichu rompió una taza al finalizar el programa de la resistencia.");
    }

    else repetir (conv);

  });










  // Set the DialogflowApp object to handle the HTTPS POST request.
  exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
