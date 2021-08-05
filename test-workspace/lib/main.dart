import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

Color c = const Color(0xFFFF7F50);
Color d = const Color.fromARGB(0xFF, 0xFF, 0x7F, 0x50);
Color e = const Color.fromARGB(255, 66, 165, 245);
Color f = const Color.fromRGBO(66, 165, 245, 1.0);

/// Parses a variable declaration from [contents].
///
/// If passed, [url] is the name of the file
/// from which [contents] comes.
///
/// Throws a [SassFormatException] if parsing fails.
///
/// @nodoc

/// Returns the lesser of two numbers.
///
/// ```dart
/// min(5, 3) == 3
/// ```

/// A parser for `@at-root` queries.

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key? key, required this.title}) : super(key: key);

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: Icon(Icons.add),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
