$(document).ready(function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
window.indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;

window.IDBTransaction =
  window.IDBTransaction ||
  window.webkitIDBTransaction ||
  window.msIDBTransaction;
window.IDBKeyRange =
  window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
  window.alert("Your browser doesn't support a stable version of IndexedDB.");
}
let dbname = "networksDb";
let tablename = "networks";
var request = window.indexedDB.open(dbname, 2);
let db;


request.onupgradeneeded = function (event) {
  db = request.result;
  let upTrans = request.transaction;
  if (!db.objectStoreNames.contains(tablename)) {
    // if there's no "books" store
    networks = db.createObjectStore(tablename, { keyPath: "name" }); // create it
  }
};
request.onerror = function () {
  console.error("Error", openRequest.error);
};

(function () {
  "use strict";
  angular
    .module("myFirstApp", [])

    .controller("MyFirstController", function ($scope) {
      //Valores iniciales de la red
      $scope.level = 1;
      $scope.network = {
        inputs_num: 0,
        trainings_num: 0,
        inputs: [],
        trainings: [],
        c: 0.25,
        iterations: 0,
        maxNum: 10000,
        bias: 0.4,
        solved: false,
        name: "net",
        commands: [],
      };
      //Valores iniciales del testeo
      $scope.testing = {
        values: [],
        output: 0,
        sum: 0,
        finish: false,
      };
      //La funcion permite empezar el testeo
      $scope.startTesting = function () {
        $scope.testing.sum = 0;
        $scope.testing.output = 0;
        $scope.testing.finish = false;

        //Itera los valores de entrada de la red 
        for (let i = 0; i < $scope.testing.values.length; i++) {
          $scope.testing.sum +=
            $scope.testing.values[i] * $scope.network.inputs[i].weight;
        }
        $scope.testing.output =
          $scope.testing.sum >= $scope.network.bias ? 1 : 0;
        console.log($scope.testing);
        $scope.testing.finish = true;
      };
      //La funcion permite empezar el entrenamiento
      $scope.start_train = function () {
        console.log($scope.network);
        let solved = false;
        $scope.network.commands = [];
        let eq = "start training:;";

        while (!solved) {
          $scope.network.iterations++;
          $scope.network.trainings.forEach((tr, i) => {
            eq += "Calculating output for (";
            //Muestra los valores de las entradas
            for (let inIdx = 0; inIdx < $scope.network.inputs_num; inIdx++) {
              eq += tr.values[inIdx] + " , ";
            }

            eq += ");";
            tr.output = 0;
            //Muestra valores de entradas asi como las salidas
            for (let inIdx = 0; inIdx < $scope.network.inputs_num; inIdx++) {
              eq +=
                "+" +
                tr.output +
                " + " +
                tr.values[inIdx] +
                "*" +
                $scope.network.inputs[inIdx].weight;

              tr.output +=
                tr.values[inIdx] * $scope.network.inputs[inIdx].weight;
              eq += "= " + tr.output + ";";
            }
            tr.afterBias = tr.output >= $scope.network.bias ? 1 : 0;
            eq += tr.afterBias == 1 ? "Output = 1;" : "Output=0;";
            if (tr.afterBias == tr.desired) {
              eq +=
                "Do not modify weights because output is like the desired value ;";

              tr.solved = true;
              //Calcula los nuevos valores con los pesos asignados
            } else {
              eq += "Calculating new weights: ;";
              for (let inIdx = 0; inIdx < $scope.network.inputs_num; inIdx++) {
                $scope.network.inputs[inIdx].weight =
                  $scope.network.inputs[inIdx].weight +
                  $scope.network.c *
                    (tr.desired - tr.output) *
                    tr.values[inIdx];
                eq +=
                  "new weight number " +
                  (inIdx + 1) +
                  "=" +
                  $scope.network.inputs[inIdx].weight +
                  "= " +
                  $scope.network.inputs[inIdx].weight +
                  " + " +
                  $scope.network.c +
                  "*(" +
                  tr.desired +
                  "-" +
                  tr.output +
                  ")*" +
                  tr.values[inIdx] +
                  "=" +
                  $scope.network.inputs[inIdx].weight +
                  ";";
              }
            }
          });
          let subSolved = true;
          $scope.network.trainings.forEach((item, i) => {
            if (!item.solved) subSolved = false;
          });
          //Valida que no exceda el maximo de iteraciones el cual es 10000
          if ($scope.network.iterations < $scope.network.maxNum)
            solved = subSolved;
          else {
            eq += "Exceeded the maximum number; not solved;";
            break;
          }
          if (!solved) {
            eq += "New iteration:;";
          }
        }
        //En caso de encontrar una solucion, muestra valores junto con un mensaje de resuelto
        if (solved) {
          $scope.network.solved = true;
          for (let i = 0; i < $scope.network.inputs_num; i++) {
            $scope.testing.values.push(0);
          }
          eq += " Solved! ;";
          console.log($scope.network);
          console.log($scope.testing);
        } else {
          alert("not solved");
        }
        $scope.network.commands = eq.split(";");
        console.log($scope.network.commands);
      };
      //Permite cambiar el valor de entradas
      $scope.change_input_nums = function () {
        $scope.network.inputs = [];
        for (let i = 0; i < $scope.network.inputs_num; i++) {
          $scope.network.inputs.push({ id: i, name: "x" + (i + 1), weight: 0 });
        }
      };
      //Permite cambiar el valor de numero de entrenamientos
      $scope.change_trainings_num = function () {
        for (let i = 0; i < $scope.network.trainings_num; i++) {
          $scope.network.trainings.push({
            name: "s" + (i + 1),
            values: [],
            desired: 0,
            output: 0,
            solved: false,
            afterBias: 0,
          });
          for (let j = 0; j < $scope.network.inputs_num; j++) {
            $scope.network.trainings[i].values.push(j);
          }
        }
      };
      //Carga los siguientes pasos para el procesos del perceptron
      $scope.nextLevel = function () {
        $scope.level++;
      };
      //Funcion que inicia el entrenamiento dela neurona
      $scope.testingDiv = false;
      $scope.start_test = function () {
        $scope.testingDiv = true;
      };

      $scope.oldNetworks = [];
      $scope.OtherNetsDiv = false;
      function readAll() {
        $scope.oldNetworks = [];
        $(".old_net_li").remove();
        let openRequest = indexedDB.open(dbname);

        let transaction = db.transaction(tablename); // readonly
        let networksss = transaction.objectStore(tablename);
        let request = networksss.getAll();
        request.onsuccess = function () {
          $scope.oldNetworks = request.result;
          $scope.oldNetworks.forEach((item, idx) => {
            $("#all_old_networks").append(
              '<li class="mt-3 old_net_li"><button type="button" class="btn btn-dark text-white old_network_choice" network_idx="' +
                idx +
                '"  name="button">' +
                item.name +
                " </button></li>"
            );
          });

          console.log($scope.oldNetworks);
        };
      }
      //Cargar redes guardadas
      $scope.loadOtherNetworks = function () {
        readAll();

        $(".modal#load").fadeIn("slow");
      };
      $scope.show_results = function () {
        $(".modal#details").fadeIn("slow");
      };
      //Limpiar procesos
      $("body").on("click", ".clear_database", function () {
        var req = indexedDB.deleteDatabase(dbname);
        req.onsuccess = function () {
          $scope.oldNetworks = [];
          console.log("Deleted database successfully");
        };
        req.onerror = function () {
          console.log("Couldn't delete database");
        };
      });
      $("body").on("click", ".close_modal", function () {
        $(".modal").fadeOut("slow");
      });
      $("body").on("click", ".old_network_choice", function () {
        let idx = $(this).attr("network_idx");
        $scope.network = $scope.oldNetworks[idx];
        for (let i = 0; i < $scope.network.inputs_num; i++) {
          $scope.testing.values.push(0);
        }
        $scope.level = 5;
        $scope.$digest();
        $(".modal").fadeOut("slow");
      });
    });
})();
