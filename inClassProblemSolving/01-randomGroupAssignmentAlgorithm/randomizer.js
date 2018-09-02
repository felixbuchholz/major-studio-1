var students = ['Alonso', 'Aaditi', 'Batool', 'Stephanie', 'Simone', 'Andrew', 'Felix', 'Mikaela', 'Candice', 'Michael'];
var readings = ['Kurgan, Laura (2013)', 'Crawford, Kate (2016)', 'Manovich, Lev (2017)'];

var assignment = [];
var teamSize = 3;

for (var i = 0; i < readings.length; i++) {
  assignment[i] = { report: readings [i], team: [] };
  // loop here?
};

for (var i in assignment) {
  while (assignment[i].team.length < teamSize) {
    var random = Math.floor(Math.random() * (students.length));
    assignment[i].team.push(students[random]);
    students.splice(random,1);
  };
};

var random = Math.floor(Math.random() * (readings.length));
assignment[random].team.push(students[0]);

console.log(assignment);

//
// for (var i = 0; i < students.length; i++) {
//   var random = Math.floor(Math.random() * 3;
//   students[i]
// }

// students.splice(-1,1)

// function Group(reading) {
//     this.reading = reading;
//     this.students = [];
// }

// var group = {
//   reading: '';
//   students: [];
// }
