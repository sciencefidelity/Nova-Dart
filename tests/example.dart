// Dart language test file
// code examples copied from https://dart.dev/samples

#!/usr/bin/env dart

// Importing core libraries
import 'dart:math';

// Importing libraries from external packages
import 'package:test/test.dart';

// Importing files
import 'path/to/my_other_file.dart';

void main() {
  print('Hello, World!');
}

/* */

(employee as Person).firstName = 'Bob';
var list = json['images'] as List;

var name = 'Voyager I';
var year = 1977;
var antennaDiameter = 3.7;
bool truthy = true;
bool falsy = false;
var flybyObjects = ['Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const set = {if (list is List<int>) ...list};
var image = {
  'tags': ['saturn'],
  'url': '//path/to/saturn.jpg'
};

if (year >= 2001) {
  print('21st century');
} else if (year >= 1901) {
  print('20th century');
}

for (var object in flybyObjects) {
  print(object);
}

for (int month = 1; month <= 12; month++) {
  print(month);
}

while (year < 2016) {
  year += 1;
}

int fibonacci(int n) {
  if (n == 0 || n == 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

var result = fibonacci(20);

flybyObjects.where((name) => name.contains('turn')).forEach(print);

// This is a normal, one-line comment.

/// This is a documentation comment, used to document libraries,
/// classes, and their members. [Tools] like IDEs and dartdoc treat
/// doc comments specially.

/* Comments like these are also supported. */

class Spacecraft {
  String name;
  DateTime? launchDate;

  int? get launchYear => launchDate?.year; // read-only non-final property

  // Constructor, with syntactic sugar for assignment to members.
  Spacecraft(this.name, this.launchDate) {
    // Initialization code goes here.
  }

  // Named constructor that forwards to the default one.
  Spacecraft.unlaunched(String name) : this(name, null);

  // Method.
  void describe() {
    print('Spacecraft: $name');
    var launchDate = this.launchDate; // Type promotion doesn't work on getters.
    if (launchDate != null) {
      int years = DateTime.now().difference(launchDate).inDays ~/ 365;
      print('Launched: $launchYear ($years years ago)');
    } else {
      print('Unlaunched');
    }
  }
}

var voyager = Spacecraft('Voyager I', DateTime(1977, 9, 5));
voyager.describe();

var voyager3 = Spacecraft.unlaunched('Voyager III');
voyager3.describe();

class Orbiter extends Spacecraft {
  double altitude;

  Orbiter(String name, DateTime launchDate, this.altitude)
      : super(name, launchDate);
}

mixin Piloted {
  int astronauts = 1;

  void describeCrew() {
    print('Number of astronauts: $astronauts');
  }
}

class PilotedCraft extends Spacecraft with Piloted {
  // ···
}

class MockSpaceship implements Spacecraft {
  // ···
}

abstract class Describable {
  void describe();

  void describeWithEmphasis() {
    print('=========');
    describe();
    print('=========');
  }
}

const oneSecond = Duration(seconds: 1);
// ···
Future<void> printWithDelay(String message) async {
  await Future.delayed(oneSecond);
  print(message);
}

Future<void> printWithDelay(String message) {
  return Future.delayed(oneSecond).then((_) {
    print(message);
  });
}

Future<void> createDescriptions(Iterable<String> objects) async {
  for (var object in objects) {
    try {
      var file = File('$object.txt');
      if (await file.exists()) {
        var modified = await file.lastModified();
        print(
            'File for $object already exists. It was modified on $modified.');
        continue;
      }
      await file.create();
      await file.writeAsString('Start describing $object in this file.');
    } on IOException catch (e) {
      print('Cannot create description for $object: $e');
    }
  }
}

Stream<String> report(Spacecraft craft, Iterable<String> objects) async* {
  for (var object in objects) {
    await Future.delayed(oneSecond);
    yield '${craft.name} flies by $object';
  }
}

if (astronauts == 0) {
  throw StateError('No astronauts.');
}

try {
  for (var object in flybyObjects) {
    var description = await File('$object.txt').readAsString();
    print(description);
  }
} on IOException catch (e) {
  print('Could not describe object: $e');
} finally {
  flybyObjects.clear();
}

int a = -1;
int b = 2;

int minVal = (a < b) ? a : b;
print(minVal);   //prints "-1"

int absValue = (a < 0) ? -a : a;
print(absValue);   //prints "1"

@pragma('vm:entry-point')
const Color(int value) : value = value & 0xFFFFFFFF;

const color = const Color(0xFFFF9000);

extension HexColor on Color {
  /// String is in the format "aabbcc" or "ffaabbcc" with an optional leading "#".
  static Color fromHex(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }

  /// Prefixes a hash sign if [leadingHashSign] is set to `true` (default is `true`).
  String toHex({bool leadingHashSign = true}) => '${leadingHashSign ? '#' : ''}'
      '${alpha.toRadixString(16).padLeft(2, '0')}'
      '${red.toRadixString(16).padLeft(2, '0')}'
      '${green.toRadixString(16).padLeft(2, '0')}'
      '${blue.toRadixString(16).padLeft(2, '0')}';
}

void main() {
  final Color color = HexColor.fromHex('#aabbcc');

  print(color.toHex());
  print(const Color(0xffaabbcc).toHex());
}
